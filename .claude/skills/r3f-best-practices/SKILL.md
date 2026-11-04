---
name: r3f-best-practices
description: Best practices for three.js with react-three-fiber and drei in this project. Use before writing or changing anything inside <Canvas>: meshes, materials, lighting, models, animation, events, performance, or putting HTML on 3D objects.
---

# three.js / R3F best practices

The user is new to three.js. When introducing a new 3D concept, add one short comment or
sentence explaining it.

## Mental model

Scene graph of objects (`mesh` = geometry + material, `group` = container). R3F lets you
write it as JSX. The renderer draws a frame roughly 60 times a second; `useFrame` runs inside
that loop.

## The render loop (most important rule)

- **Never call `setState` in `useFrame`.** That re-renders React 60 times a second.
  Mutate refs (`ref.current.position.y = ...`) or read the store with `useStore.getState()`.
- Use `delta` for all motion so speed is frame-rate independent. Use `MathUtils.damp` or
  `lerp` for easing.
- Animation state that does not need to render React (pressed keys, spring values) lives in
  refs or the game store, not `useState`.

## Allocation and reuse

- Do not create `Vector3`, `Color`, `Euler` or materials inside render or `useFrame`. Hoist
  them to module scope or `useMemo`/`useRef`.
- Share geometries and materials across identical meshes (`useMemo`, or module-level). Many
  identical objects (for example keys of the same width) should share one geometry.
- For hundreds of identical objects use `<Instances>` (drei) or `InstancedMesh`.
- R3F disposes objects it created when they unmount. For resources you share or cache
  yourself, pass `dispose={null}`.

## Models and assets

- Prefer `.glb`. Load with `useGLTF`, wrap in `<Suspense>`, and `useGLTF.preload(url)`.
- Generate components from models with `npx gltfjsx model.glb --types` rather than hand-typing.
- Compress: Draco or meshopt via `gltf-transform` before committing large models.
- Keep assets in `src/assets` (or `public/` for large ones), one folder per category.
- Free sources: Kenney, Quaternius, Poly Pizza (check each licence, prefer CC0). Record the
  source and licence in `docs/ASSETS.md` when adding a file.
- Primitives are fine and encouraged for the prototype. Wrap each placeholder in a component
  with the final model's name so swapping it later changes one file.

## Moving the camera by hand

- drei's `OrbitControls` only aims the camera (the `lookAt`) while `controls.enabled` is true. If you move the camera
  yourself while the controls are off, also call `camera.lookAt(controls.target)`, or it slides to the new spot still
  facing the old way and then snaps round when the controls come back on (`CameraRig` does this).
- Check a camera move by its **facing direction** as well as its position. Matching positions can hide a camera
  looking the wrong way.
- Orbit controls coast after a drag when `enableDamping` is on; turn it off while you steer the camera.

## Lighting and materials

- Few lights. One ambient or `<Environment preset=...>` plus one directional is usually enough.
- Shadows are expensive. Enable only where they sell the scene (desk, keyboard), set a small
  `shadow-mapSize`, and prefer `<ContactShadows>` or `<AccumulativeShadows>` for static scenes.
- `meshStandardMaterial` is the default. Use `meshBasicMaterial` for things that should not
  be lit (screens, glow). Avoid `meshPhysicalMaterial` unless needed.

## Canvas settings

- `dpr={[1, 2]}` to cap pixel ratio on high-DPI screens.
- Keep `<Canvas>` mounted once at the app root. Do not remount it to change scenes.
- If something is static, consider `frameloop="demand"` and `invalidate()`. This game animates
  constantly, so default `frameloop` is expected.

## Events

- **Click-through:** R3F only raycasts objects that have event handlers. Anything without one (a monitor frame, a
  desk) is invisible to clicks, so a click passes through to objects behind it. Wrap solid things in
  `<Solid>` (`src/scene/Solid.tsx`), which stops clicks and hover.
- **DOM inside the canvas container** (drei `<Html>`) makes `event.offsetX/Y` relative to the clicked element, so R3F
  computes a wrong pointer. The Canvas uses `createCanvasEvents` (`src/scene/canvasEvents.ts`) to measure from
  `clientX/Y` against the canvas instead. Keep it, or clicks on the monitor will hit random 3D objects.

- Use `onPointerDown/Up/Over/Out/Click` on meshes. Call `e.stopPropagation()` so objects
  behind do not also fire.
- Set cursor with `document.body.style.cursor` on hover for clickable objects.

## HTML on 3D objects (the monitor)

- Use drei `<Html transform occlude>` to put real DOM on the screen, so assignment text, tabs
  and the AI panel are ordinary React and CSS.
- Keep the DOM small; many `<Html>` instances are costly. One per screen.
- `<Html>` renders in a **separate React root**: context does not reach inside. Read context in
  the 3D component and pass props down; Zustand stores work. In `transform` mode one CSS pixel is
  `distanceFactor / 400` metres. Give it a low `zIndexRange` so it stays under the HUD.
- Anything in the 2D HUD that must be clickable needs `pointer-events: auto`, because the HUD
  container is `none` so the scene stays draggable.
- Typing input: listen to `window` keydown rather than a focused `<input>` inside `<Html>`.

## Context and state

- Put providers outside `<Canvas>`. R3F bridges context into the canvas. If a context value
  is unexpectedly undefined inside the canvas, use drei `useContextBridge`.
- Read game state in scene components with narrow selectors so only the parts that change
  re-render.

## Units and structure

- 1 world unit = 1 metre for the office scene. Scale imported or placeholder objects to fit
  rather than inventing per-object units.
- One component per physical object (`Desk`, `Monitor`, `Chair`), props for position and
  variant. Compose them in `Room`.
- Debug helpers while building: drei `<Stats />`, `<axesHelper />`, `<gridHelper />`. Remove
  or gate behind a dev flag before committing.

## Before finishing a 3D change

- `npx tsc -b` and `npm run build` pass.
- No `setState` inside `useFrame`, no per-frame allocations.
- If you have not seen it run in a browser, say so.
