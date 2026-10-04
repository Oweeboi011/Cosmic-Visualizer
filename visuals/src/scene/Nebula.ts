import * as THREE from "three";
import { params } from "../config";
import noise from "../shaders/noise.glsl?raw";
import vertexShader from "../shaders/nebula.vert.glsl?raw";
import fragmentShader from "../shaders/nebula.frag.glsl?raw";

const PALETTE = ["#7c5cff", "#38e8e0", "#ff5c9a", "#4f7bff", "#b45cff"];

/**
 * Volumetric-looking gas clouds: camera-facing noise billboards, all drawn in one
 * instanced call. Additive and depth-write-free, so overlapping clouds build up glow.
 */
export class Nebula {
  readonly mesh: THREE.InstancedMesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private readonly material: THREE.ShaderMaterial;

  constructor(galaxyRadius: number) {
    const { count } = params.nebula;
    const geometry = new THREE.PlaneGeometry(1, 1);
    const colors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      color.set(PALETTE[i % PALETTE.length]).toArray(colors, i * 3);
      seeds[i] = Math.random();
    }
    geometry.setAttribute("aColor", new THREE.InstancedBufferAttribute(colors, 3));
    geometry.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader: `${noise}\n${fragmentShader}`,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: params.nebula.opacity },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.InstancedMesh(geometry, this.material, count);
    this.mesh.name = "nebula";
    // Billboarding happens in the shader, so the base geometry's bounds are meaningless.
    this.mesh.frustumCulled = false;

    // Clouds hug the galactic disk, mostly along the arms' radial range.
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      const r = galaxyRadius * (0.25 + Math.random() * 0.85);
      const a = Math.random() * Math.PI * 2;
      position.set(Math.cos(a) * r, (Math.random() - 0.5) * 6, Math.sin(a) * r);
      const size = 12 + Math.random() * 16;
      scale.set(size, size, size);
      this.mesh.setMatrixAt(i, matrix.compose(position, quaternion, scale));
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  update(elapsed: number) {
    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uOpacity.value = params.nebula.opacity;
    this.mesh.visible = params.nebula.visible;
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
