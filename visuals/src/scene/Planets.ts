import * as THREE from "three";
import vertexShader from "../shaders/atmosphere.vert.glsl?raw";
import fragmentShader from "../shaders/atmosphere.frag.glsl?raw";

interface PlanetSpec {
  name: string;
  radius: number;
  position: [number, number, number];
  bands: string[];
  atmosphere: string;
  spin: number;
}

const PLANETS: PlanetSpec[] = [
  { name: "Aurelia", radius: 3.2, position: [78, 10, 22], bands: ["#3a6fd8", "#2a4f9c", "#5c8fe8", "#e8f0ff"], atmosphere: "#6fb2ff", spin: 0.12 },
  { name: "Ember", radius: 2.2, position: [-64, -6, 58], bands: ["#b5542c", "#8a3a1e", "#d8834f", "#6e2a14"], atmosphere: "#ff8a5c", spin: 0.08 },
  { name: "Halcyon", radius: 5.4, position: [12, 18, -92], bands: ["#d8c08a", "#b89a62", "#efdcae", "#9c7c4a"], atmosphere: "#f3dcb8", spin: 0.2 },
];

/** Horizontal bands with a little noise, drawn once into a small canvas texture. */
function bandTexture(colors: string[]): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  for (let y = 0; y < canvas.height; y++) {
    const t = y / canvas.height + Math.sin(y * 0.35) * 0.03 + (Math.random() - 0.5) * 0.02;
    ctx.fillStyle = colors[Math.abs(Math.floor(t * colors.length * 2.5)) % colors.length];
    ctx.fillRect(0, y, canvas.width, 1);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A few planets with banded surfaces and an atmospheric rim glow. */
export class Planets {
  readonly group = new THREE.Group();
  /** Surface meshes, used as double-click fly-to targets. */
  readonly targets: THREE.Mesh[] = [];
  private readonly spins: number[] = [];
  private readonly disposables: { dispose(): void }[] = [];

  constructor() {
    this.group.name = "planets";
    const sphere = new THREE.SphereGeometry(1, 64, 32);
    const shell = new THREE.SphereGeometry(1, 48, 24);
    this.disposables.push(sphere, shell);

    for (const spec of PLANETS) {
      const map = bandTexture(spec.bands);
      const surfaceMaterial = new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0 });
      const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uColor: { value: new THREE.Color(spec.atmosphere) },
          uIntensity: { value: 1.4 },
        },
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      });
      this.disposables.push(map, surfaceMaterial, atmosphereMaterial);

      const planet = new THREE.Group();
      planet.position.set(...spec.position);
      planet.rotation.z = 0.3;

      const surface = new THREE.Mesh(sphere, surfaceMaterial);
      surface.scale.setScalar(spec.radius);
      surface.name = spec.name;
      surface.userData.radius = spec.radius;

      const atmosphere = new THREE.Mesh(shell, atmosphereMaterial);
      atmosphere.scale.setScalar(spec.radius * 1.12);

      planet.add(surface, atmosphere);
      this.group.add(planet);
      this.targets.push(surface);
      this.spins.push(spec.spin);
    }
  }

  update(delta: number) {
    for (let i = 0; i < this.targets.length; i++) {
      this.targets[i].rotation.y += this.spins[i] * delta;
    }
  }

  dispose() {
    for (const d of this.disposables) d.dispose();
  }
}
