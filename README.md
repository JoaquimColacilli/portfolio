# Portfolio

Personal site of Joaquim Colacilli: <https://joaquimcolacilli-portfolio.netlify.app/>

Eleven years of work, from technical school to Despegar, drawn as one line. The site is a
set of technical-drawing sheets on cyanotype paper. A single amber line leaves the cursor
after the name on the cover, passes one drawing per chapter, takes off from a runway at
Despegar ("to take off") and stops at a cursor on the last sheet. Every drawing is
plotted stroke by stroke as the visitor scrolls towards it, and lifted again as they leave.

## Stack

- [three.js](https://threejs.org/) r187 with `WebGPURenderer` and TSL node materials. It
  runs on WebGPU where the browser has it and falls back to WebGL 2 on its own.
- React 19 for the page, TypeScript, Vite.
- [Lenis](https://lenis.darkroom.engineering/) for smooth wheel scrolling.
- [Archivo](https://www.omnibus-type.com/fonts/archivo/) variable font (weight and width).

No UI kit and no CSS framework: two stylesheets in `src/styles`.

## Run it

Needs Node 20.19 or newer (22 is what Netlify uses, see `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve dist/ locally
npm run typecheck
```

## Change the content

All text lives in two files, in English and Spanish. Nothing else needs to change.

| File | What it holds |
| --- | --- |
| `src/content/content.ts` | Name, links, cover, the five chapters, toolkit, practices, education, interface strings |
| `src/content/projects.ts` | The projects on the work sheet (`featured: true` puts one among the four large figures) |

Project screenshots are `public/images/projects/<slug>-640.webp` and `-1280.webp`
(16:10). The CVs are the two PDFs in `public/`.

## How it is built

```
src/
  content/        text and data
  components/     one component per sheet, plus header, ruler and title block
  styles/         base.css (tokens, shared pieces) and sheets.css (one block per sheet)
  lib/
    stage.ts      scroll position → "sheet coordinate" (3.5 = halfway from sheet 3 to 4)
    ticker.ts     the one requestAnimationFrame loop
    bindings.ts   writes the stage into CSS variables and classes
  runtime.ts      wires it together: smooth scroll → stage → DOM → 3D, once per frame
  experience/     the 3D world (plain three.js, no React)
    Experience.ts renderer, frame loop, anchoring of the line to the page
    Rig.ts        camera path, one viewpoint per sheet
    ink/          the line renderer: strokes → ribbons, drawn and erased over time
    stations/     one drawing per sheet
    world/        backdrop, floor grid, dust, the line itself
```

The page and the 3D world read the same number, `stage.s`, so they cannot drift apart.
The 3D code is loaded after the first paint, in its own chunk.

Things the scene does on its own:

- No WebGPU: WebGL 2. Neither, or the GPU device is lost: the sheets stay, on grid paper.
- `prefers-reduced-motion`: no smooth scrolling, no idle motion, and the camera cuts from
  sheet to sheet instead of flying.
- Phones and narrow or tall windows: drawing on top, text below, lighter scene.
- Slow frames: the render resolution steps down.

For debugging: `?gl=webgl` forces the WebGL 2 backend, `?debug` exposes `window.__stage`
and `window.__info()`.

## Deploy

Netlify builds every push with `npm run build` and serves `dist/` (see `netlify.toml`).

## Credits

- Typeface: Archivo by Omnibus-Type (SIL Open Font License).
- Lettering inside the drawings: the Hershey fonts, created by Dr. A. V. Hershey at the
  U.S. National Bureau of Standards; outlined numerals traced from Archivo Black (OFL).
  `scripts/build-glyphs.mjs` regenerates both data files.
- three.js and Lenis are MIT licensed.
