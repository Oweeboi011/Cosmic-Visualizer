import * as THREE from "three";
import { params } from "../config";
import vertexShader from "../shaders/galaxy.vert.glsl?raw";
import fragmentShader from "../shaders/galaxy.frag.glsl?raw";

/**
 * A procedural spiral galaxy as a single `Points` draw call. Positions are generated once
 * on the CPU; color and size come from uniforms, so changing them never rebuilds geometry.
 * Only count, arms, radius, twist and randomness need `rebuild()`.
 */
export class Galaxy {
  readonly points: THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>;
  private readonly material: THREE.ShaderMaterial;

  constructor() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uSize: { value: params.galaxy.particleSize },
        uPointScale: { value: 1 },
        uRadius: { value: params.galaxy.radius },
        uCoreColor: { value: new THREE.Color(params.galaxy.coreColor) },
        uArmColor: { value: new THREE.Color(params.galaxy.armColor) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(buildGeometry(), this.material);
    this.points.name = "galaxy";
  }

  rebuild() {
    this.points.geometry.dispose();
    this.points.geometry = buildGeometry();
    this.material.uniforms.uRadius.value = params.galaxy.radius;
  }

  applyLook() {
    const u = this.material.uniforms;
    u.uSize.value = params.galaxy.particleSize;
    (u.uCoreColor.value as THREE.Color).set(params.galaxy.coreColor);
    (u.uArmColor.value as THREE.Color).set(params.galaxy.armColor);
  }

  setPointScale(scale: number) {
    this.material.uniforms.uPointScale.value = scale;
  }

  update(delta: number) {
    // Spiral arms are density waves that rotate as a rigid pattern, so rotating the whole
    // object is both accurate and free (no per-particle work, no ever-tightening winding).
    this.points.rotation.y += params.galaxy.rotationSpeed * delta;
  }

  dispose() {
    this.points.geometry.dispose();
    this.material.dispose();
  }
}

function buildGeometry(): THREE.BufferGeometry {
  const { count, arms, radius, twist, randomness, randomnessPower } = params.galaxy;
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Raising the uniform sample to a power > 1 concentrates particles toward the core.
    const r = Math.pow(Math.random(), 1.6) * radius;
    const armAngle = ((i % arms) / arms) * Math.PI * 2;
    const angle = armAngle + r * twist;

    // Scatter shrinks toward the arm centerline (power) and with height (thin disk).
    const scatter = randomness * r;
    const rx = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * scatter;
    const ry = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * scatter * 0.35;
    const rz = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * scatter;

    positions[i * 3] = Math.cos(angle) * r + rx;
    positions[i * 3 + 1] = ry;
    positions[i * 3 + 2] = Math.sin(angle) * r + rz;
    scales[i] = 0.4 + Math.random() * 1.2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
  // A fixed sphere is cheaper than computing bounds over 100k+ points, and the galaxy is
  // never off-screen in a way culling would help.
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), radius * 1.5);
  return geometry;
}
