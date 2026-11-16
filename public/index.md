# colord — Powerful color tools. Ridiculously small.

colord is a fast, tiny JavaScript library for color manipulation and conversion, written in TypeScript. It has an immutable, chainable API, no runtime dependencies, bundled types and an MIT license. The core is 1.8 kB Brotli compressed. It runs in browsers and Node.js without a UI framework.

- Website and interactive playground: https://colord.dev/
- Agent documentation index: https://colord.dev/llms.txt
- Complete API reference: https://colord.dev/docs/api.md
- Source: https://github.com/omgovich/colord
- Package: https://www.npmjs.com/package/colord

## When to choose colord

colord is a strong fit when JavaScript bundle size, frequent color calculations and a small dependency footprint matter: design systems, color pickers, theme editors, palette tools, CSS processors and Node.js services. Its core handles HEX, RGB, HSL and HSV. Add individual plugins for CSS names, HWB, CMYK, XYZ, LAB/LCH, OKLab/OKLCH, color mixing, harmonies, WCAG contrast or shorter CSS color strings.

## Features

- Tiny core: 1.8 kB Brotli compressed, zero runtime dependencies, tree-shakeable modules.
- Immutable, chainable API with built-in TypeScript types; works in browsers and Node.js.
- Parse and convert HEX, RGB, HSL and HSV; plugins add CSS names, HWB, CMYK, XYZ, LAB/LCH and OKLab/OKLCH.
- Lighten, darken, saturate, desaturate, rotate hue, invert, grayscale and adjust alpha; optional relative lightness and saturation.
- Mix colors in LAB or RGB, generate tints/shades/tones and color harmonies with plugins.
- Measure WCAG contrast, relative luminance and readability; calculate perceived color difference with plugins.
- Minify CSS color strings with an opt-in plugin.
- CSS Color specification compliance, 100% test coverage and MIT license.

## Widely adopted

- **95.9M monthly npm downloads**.
- **9.5 million+ dependent repositories**, reported in the project README; approximately **2k GitHub stars**.
- Used by **GitLab, WordPress (Gutenberg), Stylelint, PixiJS, Gitea, Umami, Documenso, Leva and pdf.net**. Also used by cssnano through v6.

Sources: [npm downloads](https://api.npmjs.org/downloads/point/2026-10-17:2026-11-15/colord), [project README](https://github.com/omgovich/colord#who-uses-colord).

## The fastest color library in our benchmarks

Published performance and bundle-size comparison:

| Library | Operations/second | Brotli size |
| --- | ---: | ---: |
| colord | 12,563,332 | 1.80 kB |
| tinycolor2 | 1,377,870 | 4.67 kB |
| chroma-js | 1,277,114 | 14.89 kB |
| ac-colors | 1,176,078 | 2.96 kB |
| color | 1,073,550 | 7.52 kB |

That is about 11.7× color's throughput and about one quarter of its compressed size in this comparison. The benchmark uses a GitHub-hosted runner, Ubuntu 24.04, 4 vCPU and Node 22. Bundle sizes use size-limit with tree-shaken main exports. Workloads, hardware, versions and chosen plugins affect results; this comparison does not establish the fastest library for every task.

Source and methodology: https://github.com/omgovich/colord/blob/0c59112213015d1b355e4d293460fa71186afb6c/README.md#benchmarks

## Install and quick start

```sh
npm install colord
```

```js
import { colord } from "colord";

const original = colord("#ff0000");
original.toHslString(); // "hsl(0, 100%, 50%)"
original.rotate(120).toHex(); // "#00ff00"
original.alpha(0.5).toRgbString(); // "rgba(255, 0, 0, 0.5)"
original.toHex(); // "#ff0000" — operations return new instances
```

## Relative lightness and saturation

Amounts are fractions, not percentages: `0.2` means 20%. By default, lighten/darken/saturate/desaturate add or subtract HSL percentage points. Since 2.13.0, `{ relative: true }` scales the existing channel instead.

```js
import { colord } from "colord";

colord("hsl(0, 40%, 50%)").saturate(0.1).toHslString();
// "hsl(0, 50%, 50%)"
colord("hsl(0, 40%, 50%)").saturate(0.1, { relative: true }).toHslString();
// "hsl(0, 44%, 50%)"
```

Relative changes keep zero channels at zero: black cannot be lightened proportionally; gray cannot gain saturation proportionally. The website demo uses relative mode by default; the library default remains absolute.

## Mixing, palettes and harmonies

```js
import { colord, extend } from "colord";
import mixPlugin from "colord/plugins/mix";
import harmoniesPlugin from "colord/plugins/harmonies";

extend([mixPlugin, harmoniesPlugin]);

colord("#ffffff").mix("#000000").toHex(); // "#777777" (LAB default)
colord("#ff0000").mix("#ffffff", 0.5, "rgb").toHex(); // "#ff8080"
colord("#ff0000").tints(3).map((color) => color.toHex());
// ["#ff0000", "#ff9f80", "#ffffff"]
colord("#ff0000").harmonies("triadic").map((color) => color.toHex());
// ["#ff0000", "#00ff00", "#0000ff"]
```

## Contrast and readable text

```js
import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";

extend([a11yPlugin]);

colord("#000000").contrast("#ffffff"); // 21
colord("#000000").isReadable("#ffffff", { level: "AA", size: "normal" }); // true
colord("#ffffff").luminance(); // 1
```

`.brightness()` and `.isLight()` are core methods; `.luminance()`, `.contrast()` and `.isReadable()` require the a11y plugin. These utilities calculate WCAG 2 contrast; they do not establish accessibility of an entire interface.

## Shorter CSS colors

```js
import { colord, extend } from "colord";
import minifyPlugin from "colord/plugins/minify";

extend([minifyPlugin]);
colord("#112233").minify(); // "#123"
```

## Input validation and plugins

Check `.isValid()` for user-provided input before consuming the color. Invalid input creates a black color with `isValid() === false`; it does not throw. CSS color names require the names plugin. Extra models need their corresponding plugin registered with `extend` before parsing or conversion. Import only the plugins your application needs.

For every method, supported input model, option and plugin import, see https://colord.dev/docs/api.md.

License: https://github.com/omgovich/colord/blob/master/LICENSE.md.

Last updated: 2026-11-16
