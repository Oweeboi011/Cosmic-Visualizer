import * as THREE from "three";
import { MAX_PIXEL_RATIO, params } from "../config";
import { Galaxy } from "./Galaxy";
import { Starfield } from "./Starfield";
import { Nebula } from "./Nebula";
import { Planets } from "./Planets";
import { PostProcessing } from "./PostProcessing";

/**
 * Renderer, scene graph, sizing and the frame loop. Scene modules expose `update`;
 * per-frame callbacks registered with `onFrame` run before rendering.
 */
export class World {
  readonly renderer: THREE.WebGLRenderer;
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  /** Everything that tilts with mouse parallax (the background tilts separately). */
  readonly content = new THREE.Group();
  readonly background = new THREE.Group();

  readonly galaxy: Galaxy;
  readonly starfield: Starfield;
  readonly nebula: Nebula;
  readonly planets: Planets;
  readonly post: PostProcessing;
  /** Invisible pick target so double-clicking the galactic core flies there. */
  readonly coreTarget: THREE.Mesh;

  private readonly timer = new THREE.Timer();
  private readonly frameCallbacks: ((delta: number, elapsed: number) => void)[] = [];
  private readonly resizeCallbacks: ((width: number, height: number) => void)[] = [];
  private overlay: { scene: THREE.Scene; camera: THREE.Camera } | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 3000);
    this.camera.position.set(0, 38, 98);

    this.galaxy = new Galaxy();
    this.starfield = new Starfield();
    this.nebula = new Nebula(params.galaxy.radius);
    this.planets = new Planets();

    // Clouds are children of the galaxy so they rotate with the arms.
    this.galaxy.points.add(this.nebula.mesh);

    this.coreTarget = new THREE.Mesh(
      new THREE.SphereGeometry(4, 8, 6),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    this.coreTarget.name = "Galactic core";
    this.coreTarget.userData.radius = 6;

    // The core lights the planets.
    const coreLight = new THREE.PointLight("#ffd9b0", 2.6, 0, 0);
    this.content.add(this.galaxy.points, this.planets.group, this.coreTarget, coreLight);
    this.content.add(new THREE.AmbientLight("#6070a0", 0.12));
    this.background.add(this.starfield.points);
    this.scene.add(this.background, this.content);

    this.post = new PostProcessing(this.renderer, this.scene, this.camera);

    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.timer.connect(document);
  }

  onFrame(callback: (delta: number, elapsed: number) => void) {
    this.frameCallbacks.push(callback);
  }

  onResize(callback: (width: number, height: number) => void) {
    this.resizeCallbacks.push(callback);
    callback(window.innerWidth, window.innerHeight);
  }

  /**
   * A scene drawn on top after post-processing, with its own camera (used for the avatar).
   * It skips bloom on purpose: bright toon shading would bloom into a white smear.
   */
  setOverlay(scene: THREE.Scene, camera: THREE.Camera) {
    this.overlay = { scene, camera };
  }

  start() {
    this.renderer.setAnimationLoop((time) => this.frame(time));
  }

  private frame(time: number) {
    this.timer.update(time);
    // Clamp so a background tab returning doesn't produce one giant step.
    const delta = Math.min(this.timer.getDelta(), 0.1);
    const elapsed = this.timer.getElapsed();

    this.galaxy.update(delta);
    this.starfield.update(elapsed);
    this.nebula.update(elapsed);
    this.planets.update(delta);
    for (const callback of this.frameCallbacks) callback(delta, elapsed);

    this.post.render();

    if (this.overlay) {
      this.renderer.autoClear = false;
      this.renderer.clearDepth();
      this.renderer.render(this.overlay.scene, this.overlay.camera);
      this.renderer.autoClear = true;
    }
  }

  private resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height, false);
    this.post.setSize(width, height, pixelRatio);

    // World-sized points: pixels per world unit at distance 1, in device pixels.
    const fov = THREE.MathUtils.degToRad(this.camera.fov);
    this.galaxy.setPointScale((height * pixelRatio) / (2 * Math.tan(fov / 2)));
    this.starfield.setPixelRatio(pixelRatio);
    for (const callback of this.resizeCallbacks) callback(width, height);
  }
}
