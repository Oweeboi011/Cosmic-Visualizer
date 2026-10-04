import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { params } from "../config";

/** Render → bloom → output (tone mapping and sRGB conversion happen in OutputPass). */
export class PostProcessing {
  readonly composer: EffectComposer;
  private readonly bloom: UnrealBloomPass;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), params.bloom.strength, params.bloom.radius, params.bloom.threshold);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());
  }

  applyBloom() {
    this.bloom.strength = params.bloom.strength;
    this.bloom.radius = params.bloom.radius;
    this.bloom.threshold = params.bloom.threshold;
  }

  setSize(width: number, height: number, pixelRatio: number) {
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
  }

  render() {
    this.composer.render();
  }

  dispose() {
    this.composer.dispose();
  }
}
