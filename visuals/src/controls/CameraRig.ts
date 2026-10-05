import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { params } from "../config";

type Mode = "orbit" | "flying" | "cruise";

const FLY_DURATION = 1.6;
const CRUISE_BLEND = 2.0;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Owns every camera behaviour:
 * - orbit: OrbitControls with damping; scroll zooms
 * - flying: an eased tween toward a picked object (double-click)
 * - cruise: a looping fly-through along a spline around the galaxy (C to toggle)
 * - parallax: content tilts slightly toward the pointer; the background tilts less
 *
 * All vectors are preallocated; `update` allocates nothing.
 */
export class CameraRig {
  readonly controls: OrbitControls;
  private mode: Mode = "orbit";
  private readonly listeners = new Set<(cruising: boolean) => void>();

  // Fly-to tween
  private flyElapsed = 0;
  private readonly fromPosition = new THREE.Vector3();
  private readonly toPosition = new THREE.Vector3();
  private readonly fromTarget = new THREE.Vector3();
  private readonly toTarget = new THREE.Vector3();
  private readonly direction = new THREE.Vector3();

  // Cruise
  private readonly path: THREE.CatmullRomCurve3;
  private readonly pathLength: number;
  private cruiseT = 0;
  private cruiseBlend = 0;
  private readonly entryPosition = new THREE.Vector3();
  private readonly entryTarget = new THREE.Vector3();
  private readonly pathPoint = new THREE.Vector3();
  private readonly lookPoint = new THREE.Vector3();

  // Parallax
  private readonly pointer = new THREE.Vector2();
  private readonly smoothedPointer = new THREE.Vector2();

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    private readonly parallaxContent: THREE.Object3D,
    private readonly parallaxBackground: THREE.Object3D,
    galaxyRadius: number
  ) {
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 400;
    this.controls.zoomSpeed = 0.8;

    // A tilted, undulating loop that dips through the disk and passes the outer arms.
    const r = galaxyRadius;
    this.path = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(r * 1.5, r * 0.25, 0),
        new THREE.Vector3(r * 0.9, r * 0.05, r * 1.1),
        new THREE.Vector3(-r * 0.4, -r * 0.08, r * 1.3),
        new THREE.Vector3(-r * 1.4, r * 0.18, r * 0.4),
        new THREE.Vector3(-r * 1.2, r * 0.35, -r * 0.9),
        new THREE.Vector3(0, r * 0.12, -r * 1.5),
        new THREE.Vector3(r * 1.1, -r * 0.05, -r * 0.9),
      ],
      true,
      "centripetal"
    );
    this.pathLength = this.path.getLength();

    domElement.addEventListener("pointermove", (e) => {
      this.pointer.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    });
  }

  get cruising() {
    return this.mode === "cruise";
  }

  onCruiseChange(listener: (cruising: boolean) => void) {
    this.listeners.add(listener);
  }

  /** Tween toward `object`, ending at a distance proportional to its radius. */
  flyTo(object: THREE.Object3D, radius: number) {
    if (this.mode === "cruise") this.setCruise(false);
    object.getWorldPosition(this.toTarget);
    this.direction.subVectors(this.camera.position, this.toTarget).normalize();
    this.toPosition.copy(this.toTarget).addScaledVector(this.direction, radius * 4 + 3);
    this.fromPosition.copy(this.camera.position);
    this.fromTarget.copy(this.controls.target);
    this.flyElapsed = 0;
    this.mode = "flying";
    this.controls.enabled = false;
  }

  setCruise(on: boolean) {
    if (on === this.cruising) return;
    if (on) {
      this.entryPosition.copy(this.camera.position);
      this.entryTarget.copy(this.controls.target);
      this.cruiseT = this.nearestPathT(this.camera.position);
      this.cruiseBlend = 0;
      this.mode = "cruise";
      this.controls.enabled = false;
    } else {
      // Hand the current view back to OrbitControls without a jump.
      this.controls.target.copy(this.lookPoint);
      this.mode = "orbit";
      this.controls.enabled = true;
    }
    for (const listener of this.listeners) listener(on);
  }

  update(delta: number) {
    if (this.mode === "flying") {
      this.flyElapsed += delta;
      const t = Math.min(this.flyElapsed / FLY_DURATION, 1);
      const e = easeInOutCubic(t);
      this.camera.position.lerpVectors(this.fromPosition, this.toPosition, e);
      this.controls.target.lerpVectors(this.fromTarget, this.toTarget, e);
      this.camera.lookAt(this.controls.target);
      if (t === 1) {
        this.mode = "orbit";
        this.controls.enabled = true;
      }
    } else if (this.mode === "cruise") {
      this.cruiseT = (this.cruiseT + (params.camera.cruiseSpeed * delta) / this.pathLength) % 1;
      this.path.getPointAt(this.cruiseT, this.pathPoint);
      this.path.getPointAt((this.cruiseT + 0.012) % 1, this.lookPoint);

      // Ease from wherever the camera was onto the path instead of snapping.
      if (this.cruiseBlend < 1) {
        this.cruiseBlend = Math.min(this.cruiseBlend + delta / CRUISE_BLEND, 1);
        const e = easeInOutCubic(this.cruiseBlend);
        this.pathPoint.lerpVectors(this.entryPosition, this.pathPoint, e);
        this.lookPoint.lerpVectors(this.entryTarget, this.lookPoint, e);
      }
      this.camera.position.copy(this.pathPoint);
      this.camera.lookAt(this.lookPoint);
    } else {
      this.controls.update(delta);
    }

    // Parallax: a small tilt of the scene toward the pointer, less for distant stars.
    const k = 1 - Math.exp(-delta * 3);
    this.smoothedPointer.lerp(this.pointer, k);
    const p = params.camera.parallax;
    this.parallaxContent.rotation.set(-this.smoothedPointer.y * p, this.smoothedPointer.x * p, 0);
    this.parallaxBackground.rotation.set(-this.smoothedPointer.y * p * 0.3, this.smoothedPointer.x * p * 0.3, 0);
  }

  private nearestPathT(position: THREE.Vector3): number {
    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < 200; i++) {
      const t = i / 200;
      const d = this.path.getPointAt(t, this.pathPoint).distanceToSquared(position);
      if (d < bestDistance) {
        bestDistance = d;
        best = t;
      }
    }
    return best;
  }

  dispose() {
    this.controls.dispose();
  }
}
