# colord.dev

The interactive home of [colord](https://github.com/omgovich/colord), built with Next.js App Router and TypeScript from the approved Pen design.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. If the host runs out of filesystem watchers, use `WATCHPACK_POLLING=1000 npm run dev`.

```sh
npm test
npm run typecheck
npm run build
npm start
```

## Playground

Seven transformations can be added, reordered or removed. Lightness and Saturation use signed values; Mix supports LAB/RGB. Drag the handles, use Space/arrow keys/Space, or add blocks with +. A compact dropdown beside each + provides the same operations on phones, with keyboard navigation and insertion at the selected position.

Eight terminal outputs: Color, Palette, Harmony, Contrast, Readability, Difference, Minify and Info. Color supports twelve formats and string/object representations where the API supports them. Color fields accept colord's supported CSS syntax, and open react-colorful pickers. Invalid drafts preserve the last valid result. The generated example includes the required plugin imports and matches the displayed result.

`lib/color-engine.ts` owns calculation/code generation. Tests execute generated examples in fresh Node processes. Interface components are under `components/`; `app/globals.css` styles the playground and `components/site-shell.css` the header, proof panels and footer. Fonts are bundled locally. Animations respect reduced-motion preferences.

## Social image and deployment

`public/og.png` is the approved 1200×630 vivid B export from `colord.pen`. Both Open Graph and Twitter metadata reference it. The site includes the gradient crown favicon, robots.txt and sitemap. `/docs` redirects to the upstream API documentation.

Vercel detects the **Next.js** preset. No environment variables or external services are required. Add `colord.dev` to the project's domains when deploying.

## Published metrics

Metrics are a static snapshot checked on 2026-11-11:

- 91,202,231 downloads over 2026-10-12–2026-11-10: [npm API](https://api.npmjs.org/downloads/point/last-month/colord).
- 1,893 stars and 9.5M+ projects: [GitHub/README](https://github.com/omgovich/colord).
- Benchmark: colord 12,563,332 ops/s; tinycolor2 1,377,870; chroma-js 1,277,114; ac-colors 1,176,078; color 1,073,550. [Workflow run](https://github.com/omgovich/colord/actions/runs/42921880592), Ubuntu 24.04 / 4 vCPU / Node 22. Performance depends on the machine.
- Core size, TypeScript, zero dependencies and coverage claims follow the project README. Refresh published snapshots when updating the library.
