import * as THREE from "three";
import { params } from "./config";
import { World } from "./scene/World";
import { CameraRig } from "./controls/CameraRig";
import { createPanel } from "./ui/Panel";
import { createChatPanel } from "./ui/ChatPanel";
import { Avatar } from "./avatar/Avatar";
import { OfflineBackend } from "./chat/backend";

const canvas = document.querySelector<HTMLCanvasElement>("#scene")!;
const fpsLabel = document.querySelector<HTMLElement>("#fps")!;

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  params.galaxy.rotationSpeed = 0;
  params.stars.twinkle = 0;
  params.camera.parallax = 0;
}

const world = new World(canvas);
const rig = new CameraRig(world.camera, canvas, world.content, world.background, params.galaxy.radius);

const panel = createPanel({
  rebuildGalaxy: () => world.galaxy.rebuild(),
  applyGalaxyLook: () => world.galaxy.applyLook(),
  applyBloom: () => world.post.applyBloom(),
  setCruise: (on) => rig.setCruise(on),
});
rig.onCruiseChange((on) => panel.setCruise(on));

// Avatar + chat. The avatar renders in an overlay pass, unaffected by bloom.
const avatar = new Avatar();
world.setOverlay(avatar.scene, avatar.camera);
world.onResize((w, h) => avatar.resize(w, h));
const chat = createChatPanel(new OfflineBackend(), avatar);

async function loadAvatar(url: string, quietIfMissing = false) {
  chat.setAvatarHint("Loading avatar…");
  try {
    await avatar.load(url);
    chat.setAvatarHint(null);
  } catch (err) {
    if (!quietIfMissing) console.warn("[avatar] failed to load", url, err);
    chat.setAvatarHint(quietIfMissing ? "Drop a .vrm file anywhere to load an avatar." : "That file couldn't be loaded as a VRM avatar.");
  }
}

// ?vrm=<url> wins; otherwise try public/models/avatar.vrm if one has been added.
const vrmParam = new URLSearchParams(location.search).get("vrm");
void loadAvatar(vrmParam ?? `${import.meta.env.BASE_URL}models/avatar.vrm`, !vrmParam);

window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer?.files[0];
  if (!file || !file.name.toLowerCase().endsWith(".vrm")) return;
  const url = URL.createObjectURL(file);
  void loadAvatar(url).finally(() => URL.revokeObjectURL(url));
});

// Double-click: fly toward the planet or core under the pointer.
const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
const pickTargets: THREE.Object3D[] = [...world.planets.targets, world.coreTarget];
canvas.addEventListener("dblclick", (e) => {
  pointerNdc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(pointerNdc, world.camera);
  const hit = raycaster.intersectObjects(pickTargets, false)[0];
  if (hit) rig.flyTo(hit.object, hit.object.userData.radius ?? 1);
});

let panelVisible = true;
window.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLInputElement) return; // typing in the panel
  const key = e.key.toLowerCase();
  if (key === "c") rig.setCruise(!rig.cruising);
  else if (key === "escape") rig.setCruise(false);
  else if (key === "h") {
    panelVisible = !panelVisible;
    panel.gui.show(panelVisible);
  }
});

// Lightweight FPS readout (updated twice a second, no per-frame DOM writes).
let frames = 0;
let sinceReport = 0;
world.onFrame((delta) => {
  rig.update(delta);
  avatar.update(delta);
  frames++;
  sinceReport += delta;
  if (sinceReport >= 0.5) {
    fpsLabel.textContent = `${Math.round(frames / sinceReport)} fps`;
    frames = 0;
    sinceReport = 0;
  }
});

world.start();

// Dev-only handle for debugging from the console; stripped from production builds.
if (import.meta.env.DEV) {
  Object.assign(window, { __cosmos: { world, rig, avatar, params } });
}
