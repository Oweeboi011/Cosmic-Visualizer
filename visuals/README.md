# Cosmic Visuals

A standalone Vite + TypeScript + Three.js scene: a procedural spiral galaxy, a twinkling
starfield, noise-shaded nebulae, planets with atmospheric rims, and bloom. It also has
an optional VRM avatar (`@pixiv/three-vrm`) for a chat companion.

It has its own toolchain and is separate from the Next.js app at the repository root.

```bash
cd visuals
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
```

## Controls

| Input | Action |
| --- | --- |
| Drag / scroll | Orbit / zoom |
| Double-click a planet or the core | Fly to it |
| <kbd>C</kbd> | Toggle cruise (a looping fly-through); <kbd>Esc</kbd> exits |
| <kbd>H</kbd> | Hide or show the tweak panel |
| Mouse move | Parallax (the background moves less than the galaxy) |

Shortcuts are ignored while the chat or panel inputs have focus.

## Structure

```
src/
  config.ts          every tweakable value (edited in place by the panel)
  main.ts            wiring: world, camera rig, panel, avatar, chat, input
  scene/             World (renderer, loop, resize), Galaxy, Starfield, Nebula, Planets, PostProcessing
  shaders/           GLSL, imported with ?raw (noise.glsl is prepended where needed)
  controls/          CameraRig: orbit, fly-to tween, cruise spline, parallax
  ui/                lil-gui Panel, ChatPanel
  avatar/            VRM avatar: idle pose, blink, gaze, lip sync, moods
  chat/              ChatBackend interface (+ an offline placeholder)
```

## Performance notes

- The galaxy is one `Points` draw call. Changing colors or size only updates uniforms;
  only count, arms, radius, twist and randomness rebuild the geometry, and they rebuild
  when you release the slider.
- Galaxy spin rotates the object, not the particles. Spiral arms are density waves that
  rotate rigidly, so this is accurate and costs nothing per particle.
- The nebula is one `InstancedMesh` with billboarding done in the shader. Stars twinkle
  in the shader.
- The frame loop allocates nothing; vectors are preallocated.
- devicePixelRatio is capped at 2 (`MAX_PIXEL_RATIO`), and the frame delta is clamped
  after a background tab returns.
- The avatar renders in an overlay pass after bloom, so toon shading doesn't bloom out.

## Avatar

Load a `.vrm` model in one of three ways:

- drop the file onto the page
- put it at `public/models/avatar.vrm` (gitignored)
- pass `?vrm=<url>` (the host must allow CORS)

Check the model's license before shipping it. VRoid Hub and model authors set
per-model terms.

From code:

```ts
await avatar.speak("Hello!");     // text-driven lip sync; resolves when done
avatar.setMood("happy");          // happy | relaxed | surprised | sad | angry | neutral
avatar.setMouthLevel(level);      // drive the mouth from audio (0–1) instead of text
```

## Chat backend

`src/chat/backend.ts` defines `ChatBackend`. The default `OfflineBackend` returns a fixed
message, so the speech path can be exercised without a backend. Don't put model API keys
in this app: it's a static bundle, so anything in it is public. Implement `ChatBackend`
against your own server endpoint that holds the key.
