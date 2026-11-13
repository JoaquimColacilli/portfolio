# Portfolio

Personal site of Joaquim Colacilli: <https://joaquimcolacilli-portfolio.netlify.app/>

Eleven years of work, from technical school to Despegar, drawn as one line. The site is a
set of technical-drawing sheets on cyanotype paper. A single amber line leaves the cursor
after the name on the cover, passes one drawing per chapter, takes off from a runway at
Despegar ("to take off") and stops at a cursor on the last sheet. Every drawing is
plotted stroke by stroke as the visitor scrolls towards it, and lifted again as they leave.

## Day and night

The site has two modes, and the night is more than a darker palette. The paper goes
dark and the scene lights up, lamp by lamp:

- a starry sky fixed to the world, a moon drawn like everything else (outline, hatched
  shadow), a falling star now and then and a distant airliner crossing every minute and a half;
- lamps on the drafting floor and a red beacon over every chapter;
- each drawing gets its own lights: the old monitor glows, the dashboard switches itself
  to dark mode, the servers show their status LEDs, the car turns its headlights on, and
  the runway at Despegar gets edge, centre-line, threshold and approach lights;
- above the clouds a constellation is ruled star to star (the Southern Cross, then Orion).

By day there is movement too: a line of code being typed, a paper plane, a chart being
re-plotted, wheels turning, a marshaller waving the airliner in, a windsock, birds and a
balloon. At Despegar the airliner leaves its sheet, turns its nose up and climbs with the
visitor, with the line as its trail.

The mode follows the visitor's clock (night from 19:00 to 06:59). The switch in the
header overrides it for the rest of the visit, and `?mode=night` or `?mode=day` forces one.

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
    mode.ts       day or night: clock, header switch, `?mode=`
  runtime.ts      wires it together: smooth scroll → stage → DOM → 3D, once per frame
  experience/     the 3D world (plain three.js, no React)
    Experience.ts renderer, frame loop, anchoring of the line to the page
    Rig.ts        camera path, one viewpoint per sheet
    ink/          the line renderer: strokes → ribbons, drawn and erased over time
    stations/     one drawing per sheet, with its moving parts and its night lights
    world/        backdrop (paper, stars, moon), floor grid, lamps, night sky, the line itself
```

The page and the 3D world read the same number, `stage.s`, so they cannot drift apart.
The 3D code is loaded after the first paint, in its own chunk.

Things the scene does on its own:

- No WebGPU: WebGL 2. Neither, or the GPU device is lost: the sheets stay, on grid paper.
- `prefers-reduced-motion`: no smooth scrolling, no idle motion, and the camera cuts from
  sheet to sheet instead of flying.
- Phones and narrow or tall windows: drawing on top, text below, lighter scene.
- Slow frames: the render resolution steps down.

For debugging: `?gl=webgl` forces the WebGL 2 backend, `?debug` exposes `window.__stage`,
`window.__info()` and `window.__hold(seconds)`, which stops the scene clock at a moment
of your choice (`null` lets it run again).

## Deploy

Netlify builds every push with `npm run build` and serves `dist/` (see `netlify.toml`).

## Credits

- Typeface: Archivo by Omnibus-Type (SIL Open Font License).
- Lettering inside the drawings: the Hershey fonts, created by Dr. A. V. Hershey at the
  U.S. National Bureau of Standards; outlined numerals traced from Archivo Black (OFL).
  `scripts/build-glyphs.mjs` regenerates both data files.
- three.js and Lenis are MIT licensed.
