import GUI from "lil-gui";
import { params } from "../config";

export interface PanelHooks {
  /** Regenerate galaxy geometry (count, arms, radius, twist, randomness). */
  rebuildGalaxy(): void;
  /** Push size/color uniforms; no geometry rebuild. */
  applyGalaxyLook(): void;
  applyBloom(): void;
  setCruise(on: boolean): void;
}

/**
 * Tweak panel. Geometry-affecting controls rebuild on `onFinishChange` (slider release),
 * not on every drag tick, so dragging "particles" doesn't regenerate 300k points per frame.
 */
export function createPanel(hooks: PanelHooks): { gui: GUI; setCruise(on: boolean): void } {
  const gui = new GUI({ title: "Cosmos" });
  const state = { cruise: false };

  const galaxy = gui.addFolder("Galaxy");
  galaxy.add(params.galaxy, "count", 10_000, 300_000, 10_000).name("particles").onFinishChange(hooks.rebuildGalaxy);
  galaxy.add(params.galaxy, "arms", 2, 8, 1).onFinishChange(hooks.rebuildGalaxy);
  galaxy.add(params.galaxy, "radius", 20, 90, 1).onFinishChange(hooks.rebuildGalaxy);
  galaxy.add(params.galaxy, "twist", 0, 0.5, 0.01).onFinishChange(hooks.rebuildGalaxy);
  galaxy.add(params.galaxy, "randomness", 0, 1, 0.01).onFinishChange(hooks.rebuildGalaxy);
  galaxy.add(params.galaxy, "randomnessPower", 1, 6, 0.1).name("concentration").onFinishChange(hooks.rebuildGalaxy);
  galaxy.add(params.galaxy, "rotationSpeed", -0.2, 0.2, 0.005).name("spin");
  galaxy.add(params.galaxy, "particleSize", 0.05, 0.8, 0.01).name("size").onChange(hooks.applyGalaxyLook);
  galaxy.addColor(params.galaxy, "coreColor").name("core").onChange(hooks.applyGalaxyLook);
  galaxy.addColor(params.galaxy, "armColor").name("arms color").onChange(hooks.applyGalaxyLook);

  const scenery = gui.addFolder("Nebula & stars");
  scenery.add(params.nebula, "visible").name("nebula");
  scenery.add(params.nebula, "opacity", 0, 1.5, 0.01).name("nebula opacity");
  scenery.add(params.stars, "twinkle", 0, 1, 0.01);

  const bloom = gui.addFolder("Bloom");
  bloom.add(params.bloom, "strength", 0, 3, 0.01).onChange(hooks.applyBloom);
  bloom.add(params.bloom, "radius", 0, 1, 0.01).onChange(hooks.applyBloom);
  bloom.add(params.bloom, "threshold", 0, 1, 0.01).onChange(hooks.applyBloom);

  const camera = gui.addFolder("Camera");
  const cruiseToggle = camera.add(state, "cruise").name("cruise (C)").onChange(hooks.setCruise);
  camera.add(params.camera, "cruiseSpeed", 1, 40, 0.5).name("cruise speed");
  camera.add(params.camera, "parallax", 0, 0.15, 0.005);

  if (window.innerWidth < 600) gui.close();

  return {
    gui,
    /** Reflect cruise changes made elsewhere (keyboard, double-click) without re-firing onChange. */
    setCruise(on: boolean) {
      state.cruise = on;
      cruiseToggle.updateDisplay();
    },
  };
}
