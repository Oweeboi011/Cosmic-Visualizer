import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRMLoaderPlugin, VRMUtils, type VRM } from "@pixiv/three-vrm";

export type Mood = "neutral" | "happy" | "relaxed" | "surprised" | "sad" | "angry";

const MOODS: Exclude<Mood, "neutral">[] = ["happy", "relaxed", "surprised", "sad", "angry"];
const VISEMES = ["aa", "ih", "ou", "ee", "oh"] as const;
type Viseme = (typeof VISEMES)[number];

/** Characters per second for text-driven lip sync (roughly conversational speech). */
const SPEECH_RATE = 14;

function visemeFor(char: string): Viseme | null {
  switch (char.toLowerCase()) {
    case "a":
      return "aa";
    case "i":
    case "y":
      return "ih";
    case "u":
    case "w":
      return "ou";
    case "e":
      return "ee";
    case "o":
      return "oh";
    default:
      // Consonants open the mouth a little; spaces and punctuation close it.
      return /[a-z]/i.test(char) ? "aa" : null;
  }
}

/**
 * A VRM character rendered in its own overlay scene (drawn after bloom, see
 * World.setOverlay). Handles loading, a relaxed idle pose with breathing, blinking,
 * gaze that follows the pointer, text-driven lip sync, and mood expressions.
 *
 * All per-frame work reuses preallocated objects.
 */
export class Avatar {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
  private readonly root = new THREE.Group();
  private readonly lookTarget = new THREE.Object3D();
  private readonly loader = new GLTFLoader();
  private vrm: VRM | null = null;

  private elapsed = 0;
  private nextBlink = 2;
  private blinkTime = -1;

  // Lip sync
  private speech = "";
  private speechTime = 0;
  private resolveSpeech: (() => void) | null = null;
  private externalMouth = 0;
  private readonly visemeWeights: Record<Viseme, number> = { aa: 0, ih: 0, ou: 0, ee: 0, oh: 0 };

  // Mood
  private mood: Mood = "neutral";
  private readonly moodWeights: Record<Exclude<Mood, "neutral">, number> = {
    happy: 0,
    relaxed: 0,
    surprised: 0,
    sad: 0,
    angry: 0,
  };

  private readonly pointer = new THREE.Vector2();

  constructor() {
    this.loader.register((parser) => new VRMLoaderPlugin(parser));
    this.camera.position.set(0, 1.25, 3.6);
    this.camera.lookAt(0, 1.1, 0);

    const key = new THREE.DirectionalLight("#ffffff", 2.2);
    key.position.set(1, 2, 3);
    const rim = new THREE.DirectionalLight("#7c9cff", 1.4);
    rim.position.set(-2, 1.5, -2);
    this.scene.add(key, rim, new THREE.AmbientLight("#8090c0", 0.6));
    this.scene.add(this.root, this.lookTarget);

    window.addEventListener("pointermove", (e) => {
      this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    });
  }

  get loaded() {
    return this.vrm !== null;
  }

  async load(url: string): Promise<void> {
    const gltf = await this.loader.loadAsync(url);
    const vrm = gltf.userData.vrm as VRM | undefined;
    if (!vrm) throw new Error("Not a VRM file");

    // Recommended clean-up: fewer draw calls and vertices, VRM 0.x faced the other way.
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.combineSkeletons(gltf.scene);
    VRMUtils.rotateVRM0(vrm);
    vrm.scene.traverse((obj) => {
      obj.frustumCulled = false; // skinned bounds are unreliable once posed
    });

    this.unload();
    this.vrm = vrm;
    this.root.add(vrm.scene);
    if (vrm.lookAt) {
      vrm.lookAt.target = this.lookTarget;
      vrm.lookAt.autoUpdate = true;
    }
    this.relaxPose();
  }

  unload() {
    if (!this.vrm) return;
    this.root.remove(this.vrm.scene);
    VRMUtils.deepDispose(this.vrm.scene);
    this.vrm = null;
  }

  /** Animate the mouth for `text`; resolves when done (or when interrupted). */
  speak(text: string): Promise<void> {
    this.resolveSpeech?.();
    this.speech = text;
    this.speechTime = 0;
    return new Promise((resolve) => {
      this.resolveSpeech = resolve;
    });
  }

  /** Drive the mouth from audio instead (0–1, e.g. an AnalyserNode level). Overrides text. */
  setMouthLevel(level: number) {
    this.externalMouth = THREE.MathUtils.clamp(level, 0, 1);
  }

  setMood(mood: Mood) {
    this.mood = mood;
  }

  /** Keep the character framed: right-hand side on wide screens, bottom-center on narrow. */
  resize(width: number, height: number) {
    const aspect = width / height;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    const distance = this.camera.position.z;
    const halfWidth = distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * aspect;
    if (aspect >= 1) {
      this.root.position.set(halfWidth * 0.5, 0, 0);
      this.root.rotation.y = -0.25;
    } else {
      this.root.position.set(0, -0.35, 0);
      this.root.rotation.y = 0;
    }
  }

  update(delta: number) {
    const vrm = this.vrm;
    if (!vrm) return;
    this.elapsed += delta;
    const t = this.elapsed;

    this.updateIdle(vrm, t);
    this.updateBlink(vrm, delta);
    this.updateMouth(vrm, delta);
    this.updateMood(vrm, delta);

    // Gaze follows the pointer, projected onto a plane in front of the character.
    this.lookTarget.position.set(
      this.root.position.x + this.pointer.x * 1.2,
      1.35 + this.pointer.y * 0.6,
      2.2
    );

    vrm.update(delta);
  }

  private relaxPose() {
    const h = this.vrm?.humanoid;
    if (!h) return;
    // VRM rests in a T-pose; lower the arms. VRM 1.0 faces +Z, so the left arm is +X.
    const leftUpper = h.getNormalizedBoneNode("leftUpperArm");
    const rightUpper = h.getNormalizedBoneNode("rightUpperArm");
    const leftLower = h.getNormalizedBoneNode("leftLowerArm");
    const rightLower = h.getNormalizedBoneNode("rightLowerArm");
    if (leftUpper) leftUpper.rotation.z = -1.2;
    if (rightUpper) rightUpper.rotation.z = 1.2;
    if (leftLower) leftLower.rotation.y = 0.25;
    if (rightLower) rightLower.rotation.y = -0.25;
  }

  private updateIdle(vrm: VRM, t: number) {
    const h = vrm.humanoid;
    const chest = h.getNormalizedBoneNode("chest") ?? h.getNormalizedBoneNode("spine");
    const spine = h.getNormalizedBoneNode("spine");
    const neck = h.getNormalizedBoneNode("neck");
    if (chest) chest.rotation.x = Math.sin(t * 1.4) * 0.025; // breathing
    if (spine) spine.rotation.y = Math.sin(t * 0.35) * 0.04; // slow sway
    // A gentle nod while talking.
    const talking = this.speech.length > 0 || this.externalMouth > 0.05;
    if (neck) neck.rotation.x = talking ? Math.sin(t * 5) * 0.03 : Math.sin(t * 0.5) * 0.01;
  }

  private updateBlink(vrm: VRM, delta: number) {
    const em = vrm.expressionManager;
    if (!em) return;
    if (this.blinkTime < 0) {
      this.nextBlink -= delta;
      if (this.nextBlink <= 0) this.blinkTime = 0;
      em.setValue("blink", 0);
      return;
    }
    this.blinkTime += delta;
    const duration = 0.16;
    em.setValue("blink", Math.sin(Math.min(this.blinkTime / duration, 1) * Math.PI));
    if (this.blinkTime >= duration) {
      this.blinkTime = -1;
      this.nextBlink = 2 + Math.random() * 4;
    }
  }

  private updateMouth(vrm: VRM, delta: number) {
    const em = vrm.expressionManager;
    let active: Viseme | null = null;
    let openness = 0;

    if (this.externalMouth > 0) {
      active = "aa";
      openness = this.externalMouth;
    } else if (this.speech) {
      this.speechTime += delta;
      const index = Math.floor(this.speechTime * SPEECH_RATE);
      if (index >= this.speech.length) {
        this.speech = "";
        this.resolveSpeech?.();
        this.resolveSpeech = null;
      } else {
        active = visemeFor(this.speech[index]);
        openness = active === "aa" && !/[aA]/.test(this.speech[index]) ? 0.35 : 0.8;
      }
    }

    // Ease toward the target shape so the mouth doesn't snap between characters.
    const k = 1 - Math.exp(-delta * 18);
    for (const v of VISEMES) {
      const target = v === active ? openness : 0;
      this.visemeWeights[v] += (target - this.visemeWeights[v]) * k;
      em?.setValue(v, this.visemeWeights[v]);
    }
  }

  private updateMood(vrm: VRM, delta: number) {
    const em = vrm.expressionManager;
    const k = 1 - Math.exp(-delta * 4);
    for (const m of MOODS) {
      const target = m === this.mood ? 0.7 : 0;
      this.moodWeights[m] += (target - this.moodWeights[m]) * k;
      em?.setValue(m, this.moodWeights[m]);
    }
  }
}
