import { colord, extend, getFormat, type Colord } from "colord";
import a11yPlugin from "colord/plugins/a11y";
import cmykPlugin from "colord/plugins/cmyk";
import harmoniesPlugin, { type HarmonyType } from "colord/plugins/harmonies";
import hwbPlugin from "colord/plugins/hwb";
import labPlugin from "colord/plugins/lab";
import lchPlugin from "colord/plugins/lch";
import minifyPlugin from "colord/plugins/minify";
import mixPlugin from "colord/plugins/mix";
import namesPlugin from "colord/plugins/names";
import oklabPlugin from "colord/plugins/oklab";
import oklchPlugin from "colord/plugins/oklch";
import xyzPlugin from "colord/plugins/xyz";

extend([
  a11yPlugin,
  cmykPlugin,
  harmoniesPlugin,
  hwbPlugin,
  labPlugin,
  lchPlugin,
  minifyPlugin,
  mixPlugin,
  namesPlugin,
  oklabPlugin,
  oklchPlugin,
  xyzPlugin,
]);

export type OperationKind =
  | "lightness"
  | "saturation"
  | "hue"
  | "mix"
  | "opacity"
  | "invert"
  | "grayscale";
export type OutputKind =
  | "color"
  | "palette"
  | "harmony"
  | "contrast"
  | "readability"
  | "difference"
  | "minify"
  | "info";
export type ColorFormat =
  | "HEX"
  | "RGB"
  | "HSL"
  | "HSV"
  | "HWB"
  | "CMYK"
  | "LAB"
  | "LCH"
  | "OKLAB"
  | "OKLCH"
  | "XYZ"
  | "CSS name";
export type MixingSpace = "lab" | "rgb";
export interface Step {
  id: string;
  kind: OperationKind;
  value: number;
  color: string;
  space: MixingSpace;
}
export interface OutputSettings {
  kind: OutputKind;
  format: ColorFormat;
  representation: "string" | "object";
  closest: boolean;
  palette: "tints" | "shades" | "tones";
  count: number;
  space: MixingSpace;
  harmony: string;
  comparison: string;
  level: "AA" | "AAA";
  size: "normal" | "large";
}
type ColorObject = Record<string, number | boolean>;
export type OutputResult =
  | {
      type: "color";
      value: string | ColorObject;
      color: string;
      format: ColorFormat;
    }
  | { type: "palette"; value: string[]; colors: string[] }
  | { type: "number"; value: number; unit: "contrast" | "delta" }
  | {
      type: "boolean";
      value: boolean;
      contrast: number;
      foreground: string;
      background: string;
    }
  | { type: "text"; value: string }
  | {
      type: "info";
      value: { brightness: number; luminance: number; isLight: boolean };
    };

export const OPERATION_META: Record<
  OperationKind,
  {
    label: string;
    material: string;
    min: number;
    max: number;
    step: number;
    defaultValue: number;
  }
> = {
  lightness: {
    label: "Lightness",
    material: "yellow",
    min: -100,
    max: 100,
    step: 1,
    defaultValue: 8,
  },
  saturation: {
    label: "Saturation",
    material: "pink",
    min: -100,
    max: 100,
    step: 1,
    defaultValue: -20,
  },
  hue: {
    label: "Hue",
    material: "mint",
    min: -180,
    max: 180,
    step: 1,
    defaultValue: 30,
  },
  mix: {
    label: "Mix",
    material: "violet",
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 25,
  },
  opacity: {
    label: "Opacity",
    material: "blue",
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 75,
  },
  invert: {
    label: "Invert",
    material: "dark",
    min: 0,
    max: 0,
    step: 1,
    defaultValue: 0,
  },
  grayscale: {
    label: "Grayscale",
    material: "silver",
    min: 0,
    max: 0,
    step: 1,
    defaultValue: 0,
  },
};
export const OUTPUT_META: Record<
  OutputKind,
  { label: string; material: string }
> = {
  color: { label: "Color", material: "mint" },
  palette: { label: "Palette", material: "yellow" },
  harmony: { label: "Harmony", material: "violet" },
  contrast: { label: "Contrast", material: "dark" },
  readability: { label: "Readability", material: "peach" },
  difference: { label: "Difference", material: "periwinkle" },
  minify: { label: "Minify", material: "lime" },
  info: { label: "Info", material: "blue" },
};
export const COLOR_FORMATS: ColorFormat[] = [
  "HEX",
  "RGB",
  "HSL",
  "HSV",
  "HWB",
  "CMYK",
  "LAB",
  "LCH",
  "OKLAB",
  "OKLCH",
  "XYZ",
  "CSS name",
];
export const HARMONY_TYPES: HarmonyType[] = [
  "analogous",
  "complementary",
  "double-split-complementary",
  "rectangle",
  "split-complementary",
  "tetradic",
  "triadic",
];

export function createStep(kind: OperationKind): Step {
  return {
    id: `step-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`,
    kind,
    value: OPERATION_META[kind].defaultValue,
    color: "#7955f6",
    space: "lab",
  };
}
export const DEFAULT_STEPS: Step[] = [
  { id: "hue-1", kind: "hue", value: 20, color: "#7955f6", space: "lab" },
  {
    id: "lightness-1",
    kind: "lightness",
    value: -15,
    color: "#7955f6",
    space: "lab",
  },
  {
    id: "saturation-1",
    kind: "saturation",
    value: 20,
    color: "#7955f6",
    space: "lab",
  },
  { id: "mix-1", kind: "mix", value: 50, color: "#dddc33", space: "rgb" },
];
export const DEFAULT_OUTPUT: OutputSettings = {
  kind: "color",
  format: "HEX",
  representation: "string",
  closest: false,
  palette: "tints",
  count: 5,
  space: "lab",
  harmony: "analogous",
  comparison: "#ffffff",
  level: "AA",
  size: "normal",
};

export function isValidColor(input: string): boolean {
  return colord(input.trim()).isValid();
}
export function normalizedColor(input: string): string {
  return parseColor(input).toHex();
}
function parseColor(input: string): Colord {
  const parsed = colord(input.trim());
  if (!parsed.isValid())
    throw new Error(
      "Enter a valid color, such as #ff5c7a, rgb(255 92 122), or tomato.",
    );
  return parsed;
}
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}
function amount(step: Step): number {
  const meta = OPERATION_META[step.kind];
  return clamp(step.value, meta.min, meta.max);
}
function space(value: MixingSpace): MixingSpace {
  return value === "rgb" ? "rgb" : "lab";
}
function paletteCount(value: number): number {
  return Math.round(clamp(value, 2, 10));
}
function harmonyType(value: string): HarmonyType {
  return HARMONY_TYPES.includes(value as HarmonyType)
    ? (value as HarmonyType)
    : "analogous";
}

export function runChain(input: string | Colord, steps: Step[]): Colord {
  return steps.reduce(
    (color, step) => {
      const value = amount(step);
      switch (step.kind) {
        case "lightness":
          return value < 0
            ? color.darken(-value / 100)
            : color.lighten(value / 100);
        case "saturation":
          return value < 0
            ? color.desaturate(-value / 100)
            : color.saturate(value / 100);
        case "hue":
          return color.rotate(value);
        case "mix":
          return color.mix(
            parseColor(step.color),
            value / 100,
            space(step.space),
          );
        case "opacity":
          return color.alpha(value / 100);
        case "invert":
          return color.invert();
        case "grayscale":
          return color.grayscale();
      }
    },
    typeof input === "string" ? parseColor(input) : input,
  );
}

/** Sample every selectable value, including clamped plateaus and LAB mixing. */
export function getOperationGradient(
  input: string | Colord,
  operation: Pick<Step, "kind" | "color" | "space">,
): string {
  const { min, max, step } = OPERATION_META[operation.kind];
  const intervals = Math.max(1, (max - min) / (step || 1));
  const stops = Array.from({ length: intervals + 1 }, (_, index) => {
    const fraction = index / intervals;
    const color = runChain(input, [
      {
        ...operation,
        id: "gradient-sample",
        value: min + (max - min) * fraction,
      },
    ]).toHex();
    // The native thumb's center travels between the track's 11px insets.
    const percent = Number((fraction * 100).toFixed(3));
    const inset = Number((11 - fraction * 22).toFixed(3));
    return `${color} calc(${percent}% + ${inset}px)`;
  });
  return `linear-gradient(90deg in srgb, ${stops.join(", ")})`;
}

export function getAvailableRepresentation(
  format: ColorFormat,
): "string" | "object" | "both" {
  if (format === "HEX" || format === "CSS name") return "string";
  if (format === "HSV" || format === "LAB" || format === "XYZ") return "object";
  return "both";
}
function colorMethod(output: OutputSettings): string {
  const object =
    getAvailableRepresentation(output.format) === "object" ||
    (getAvailableRepresentation(output.format) === "both" &&
      output.representation === "object");
  switch (output.format) {
    case "HEX":
      return "toHex";
    case "RGB":
      return object ? "toRgb" : "toRgbString";
    case "HSL":
      return object ? "toHsl" : "toHslString";
    case "HSV":
      return "toHsv";
    case "HWB":
      return object ? "toHwb" : "toHwbString";
    case "CMYK":
      return object ? "toCmyk" : "toCmykString";
    case "LAB":
      return "toLab";
    case "LCH":
      return object ? "toLch" : "toLchString";
    case "OKLAB":
      return object ? "toOklab" : "toOklabString";
    case "OKLCH":
      return object ? "toOklch" : "toOklchString";
    case "XYZ":
      return "toXyz";
    case "CSS name":
      return "toName";
  }
}
function convertColor(
  color: Colord,
  output: OutputSettings,
): string | ColorObject {
  if (output.format === "CSS name")
    return color.toName({ closest: output.closest }) ?? "No exact CSS name";
  const method = colorMethod(output) as Exclude<
    keyof Colord,
    "rgba" | "constructor"
  >;
  const convert = color[method] as () => string | ColorObject;
  return convert.call(color);
}

export function evaluateOutput(
  color: Colord,
  output: OutputSettings,
): OutputResult {
  switch (output.kind) {
    case "color":
      return {
        type: "color",
        value: convertColor(color, output),
        color: color.toHex(),
        format: output.format,
      };
    case "palette": {
      const colors = color[output.palette](
        paletteCount(output.count),
        space(output.space),
      ).map((c) => c.toHex());
      return { type: "palette", value: colors, colors };
    }
    case "harmony": {
      const colors = color
        .harmonies(harmonyType(output.harmony))
        .map((c) => c.toHex());
      return { type: "palette", value: colors, colors };
    }
    case "contrast":
      return {
        type: "number",
        value: color.contrast(parseColor(output.comparison)),
        unit: "contrast",
      };
    case "difference":
      return {
        type: "number",
        value: color.delta(parseColor(output.comparison)),
        unit: "delta",
      };
    case "readability": {
      const comparison = parseColor(output.comparison);
      return {
        type: "boolean",
        value: color.isReadable(comparison, {
          level: output.level,
          size: output.size,
        }),
        contrast: color.contrast(comparison),
        foreground: color.toHex(),
        background: comparison.toHex(),
      };
    }
    case "minify":
      return { type: "text", value: color.minify() };
    case "info":
      return {
        type: "info",
        value: {
          brightness: color.brightness(),
          luminance: color.luminance(),
          isLight: color.isLight(),
        },
      };
  }
}

const FORMAT_PLUGINS: Partial<Record<ColorFormat, string>> = {
  HWB: "hwb",
  CMYK: "cmyk",
  LAB: "lab",
  LCH: "lch",
  OKLAB: "oklab",
  OKLCH: "oklch",
  XYZ: "xyz",
  "CSS name": "names",
};
function sourcePlugin(input: string): string | undefined {
  const format = getFormat(input.trim());
  if (format === "name") return "names";
  if (["hwb", "cmyk", "lch", "oklab", "oklch"].includes(format ?? ""))
    return format;
  return undefined;
}
const literal = (value: unknown): string => JSON.stringify(value);
const numeric = (value: number): string =>
  String(Math.round(value * 1e6) / 1e6);
function stepCode(step: Step): string {
  const value = amount(step);
  switch (step.kind) {
    case "lightness":
      return `.${value < 0 ? "darken" : "lighten"}(${numeric(Math.abs(value) / 100)})`;
    case "saturation":
      return `.${value < 0 ? "desaturate" : "saturate"}(${numeric(Math.abs(value) / 100)})`;
    case "hue":
      return `.rotate(${numeric(value)})`;
    case "mix":
      return `.mix(${literal(step.color.trim())}, ${numeric(value / 100)}${space(step.space) === "rgb" ? ', "rgb"' : ""})`;
    case "opacity":
      return `.alpha(${numeric(value / 100)})`;
    case "invert":
      return ".invert()";
    case "grayscale":
      return ".grayscale()";
  }
}
function displayComment(result: OutputResult): string {
  if (result.type === "color" && result.value === "No exact CSS name")
    return "undefined";
  return literal(result.value);
}

export function generateCode(
  input: string,
  steps: Step[],
  output: OutputSettings,
): string {
  const plugins = new Set<string>();
  const includeSource = (value: string) => {
    const plugin = sourcePlugin(value);
    if (plugin) plugins.add(plugin);
  };
  includeSource(input);
  for (const step of steps)
    if (step.kind === "mix") {
      plugins.add("mix");
      includeSource(step.color);
    }
  switch (output.kind) {
    case "color": {
      const plugin = FORMAT_PLUGINS[output.format];
      if (plugin) plugins.add(plugin);
      break;
    }
    case "palette":
      plugins.add("mix");
      break;
    case "harmony":
      plugins.add("harmonies");
      break;
    case "contrast":
    case "readability":
    case "info":
      plugins.add("a11y");
      break;
    case "difference":
      plugins.add("lab");
      break;
    case "minify":
      plugins.add("minify");
      break;
  }
  if (["contrast", "readability", "difference"].includes(output.kind))
    includeSource(output.comparison);
  const names = [...plugins];
  const imports = [
    `import { colord${names.length ? ", extend" : ""} } from "colord";`,
    ...names.map(
      (name) => `import ${name}Plugin from "colord/plugins/${name}";`,
    ),
    ...(names.length
      ? [`extend([${names.map((name) => `${name}Plugin`).join(", ")}]);`]
      : []),
  ].join("\n");
  const chain = `colord(${literal(input.trim())})${steps.map((step) => `\n  ${stepCode(step)}`).join("")}`;
  const color = runChain(input, steps);
  if (output.kind === "info") {
    return `${imports}\n\nconst color = ${chain};\n\ncolor.brightness(); // ${numeric(color.brightness())}\ncolor.luminance();  // ${numeric(color.luminance())}\ncolor.isLight();    // ${color.isLight()}`;
  }
  let terminal: string;
  switch (output.kind) {
    case "color":
      terminal =
        output.format === "CSS name"
          ? `.toName(${output.closest ? "{ closest: true }" : ""})`
          : `.${colorMethod(output)}()`;
      break;
    case "palette":
      terminal = `.${output.palette}(${paletteCount(output.count)}${space(output.space) === "rgb" ? ', "rgb"' : ""})\n  .map((color) => color.toHex())`;
      break;
    case "harmony":
      terminal = `.harmonies(${literal(harmonyType(output.harmony))})\n  .map((color) => color.toHex())`;
      break;
    case "contrast":
      terminal = `.contrast(${literal(output.comparison.trim())})`;
      break;
    case "readability":
      terminal = `.isReadable(${literal(output.comparison.trim())}, { level: ${literal(output.level)}, size: ${literal(output.size)} })`;
      break;
    case "difference":
      terminal = `.delta(${literal(output.comparison.trim())})`;
      break;
    case "minify":
      terminal = ".minify()";
      break;
  }
  return `${imports}\n\n${chain}\n  ${terminal}; // ${displayComment(evaluateOutput(color, output))}`;
}
