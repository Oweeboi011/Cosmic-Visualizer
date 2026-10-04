import * as THREE from "three";
import { params } from "../config";
import vertexShader from "../shaders/stars.vert.glsl?raw";
import fragmentShader from "../shaders/stars.frag.glsl?raw";

/** Distant background stars on a spherical shell; twinkle runs entirely in the shader. */
export class Starfield {
  readonly points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private readonly material: THREE.ShaderMaterial;

  constructor() {
    const { count } = params.stars;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const direction = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      direction.randomDirection().multiplyScalar(600 + Math.random() * 600);
      direction.toArray(positions, i * 3);
      // Mostly faint stars, a few bright ones.
      sizes[i] = 0.6 + Math.pow(Math.random(), 6) * 3.2;
      phases[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uTwinkle: { value: params.stars.twinkle },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geometry, this.material);
    this.points.name = "starfield";
    // The shell surrounds the camera; it's always partly visible.
    this.points.frustumCulled = false;
  }

  setPixelRatio(ratio: number) {
    this.material.uniforms.uPixelRatio.value = ratio;
  }

  update(elapsed: number) {
    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uTwinkle.value = params.stars.twinkle;
  }

  dispose() {
    this.points.geometry.dispose();
    this.material.dispose();
  }
}
