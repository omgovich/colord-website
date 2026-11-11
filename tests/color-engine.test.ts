import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { colord } from "colord";
import {
  COLOR_FORMATS,
  DEFAULT_OUTPUT,
  DEFAULT_STEPS,
  HARMONY_TYPES,
  createStep,
  evaluateOutput,
  generateCode,
  getOperationGradient,
  getAvailableRepresentation,
  isValidColor,
  runChain,
  type OutputSettings,
  type Step,
} from "../lib/color-engine.ts";

const settings = (patch: Partial<OutputSettings>): OutputSettings => ({
  ...DEFAULT_OUTPUT,
  ...patch,
});
const step = (
  kind: Step["kind"],
  value: number,
  color = "#7955f6",
  space: Step["space"] = "lab",
): Step => ({ id: "test", kind, value, color, space });

// Execute copied examples in a clean process: missing plugin imports cannot hide
// behind the playground engine's globally installed plugins.
function executeExample(code: string): unknown {
  const boundary = code.indexOf("\n\n");
  const imports = code.slice(0, boundary);
  const expression = code.slice(boundary + 2).replace(/; \/\/ [^\n]*$/, "");
  const program = `${imports}\nconsole.log(JSON.stringify(${expression}));`;
  const output = execFileSync(
    process.execPath,
    ["--input-type=module", "-e", program],
    { encoding: "utf8", cwd: process.cwd() },
  ).trim();
  return output === "undefined" ? undefined : JSON.parse(output);
}

test("the design's complete chain computes the displayed result without mutating its source", () => {
  const steps = structuredClone(DEFAULT_STEPS);
  const original = structuredClone(steps);
  assert.equal(runChain("#ff5c7a", steps).toHex(), "#ee8822");
  assert.deepEqual(steps, original);
  assert.equal(runChain("#ff5c7a", []).toHex(), "#ff5c7a");
});

test("slider previews match signed zero, clipping, relative hue, mixing space and alpha", () => {
  const input = "#ff5c7a";
  const samples = (operation: Step) =>
    getOperationGradient(input, operation).match(/#[0-9a-f]+/g)!;
  const lightness = samples(step("lightness", 0));
  assert.equal(lightness[0], "#000000");
  assert.equal(lightness[100], input);
  assert.equal(lightness[108], colord(input).lighten(0.08).toHex());
  assert.equal(lightness[200], "#ffffff");
  const saturation = samples(step("saturation", 0));
  assert.equal(saturation[0], colord(input).grayscale().toHex());
  assert.equal(saturation[100], input);
  assert.equal(saturation[200], colord(input).saturate(1).toHex());
  const hue = samples(step("hue", 0));
  assert.equal(hue[180], input);
  assert.equal(hue[210], colord(input).rotate(30).toHex());
  assert.equal(hue[0], hue[360]);
  const previous = runChain(input, [step("lightness", 8)]);
  const afterPrevious = getOperationGradient(previous, step("hue", 0)).match(
    /#[0-9a-f]+/g,
  )!;
  assert.equal(
    afterPrevious[205],
    runChain(input, [step("lightness", 8), step("hue", 25)]).toHex(),
  );
  assert.equal(afterPrevious[205], "#ffa185");
  const lab = samples(step("mix", 0, "#7955f6", "lab"));
  const rgb = samples(step("mix", 0, "#7955f6", "rgb"));
  assert.equal(lab[0], input);
  assert.equal(lab[100], "#7955f6");
  assert.equal(lab[50], colord(input).mix("#7955f6", 0.5, "lab").toHex());
  assert.notEqual(lab[50], rgb[50]);
  const alpha = samples(step("opacity", 0));
  assert.equal(alpha[0], "#ff5c7a00");
  assert.equal(alpha[100], input);
});

test("negative signed controls use positive darken/desaturate calls in the copied code", () => {
  const steps = [
    step("lightness", -8),
    step("saturation", -20),
    step("hue", -90),
  ];
  const result = runChain("#ff5c7a", steps).toHex();
  assert.equal(
    result,
    colord("#ff5c7a").darken(0.08).desaturate(0.2).rotate(-90).toHex(),
  );
  const code = generateCode("#ff5c7a", steps, DEFAULT_OUTPUT);
  assert.match(code, /\.darken\(0\.08\)/);
  assert.match(code, /\.desaturate\(0\.2\)/);
  assert.doesNotMatch(code, /\.(lighten|saturate)\(-/);
  assert.equal(executeExample(code), result);
});

test("all transform types and mixing spaces produce executable, matching examples", () => {
  for (const steps of [
    [step("mix", 37, "tomato", "rgb")],
    [step("mix", 37, "hwb(240 0% 0%)", "lab")],
    [
      step("lightness", 15),
      step("saturation", 25),
      step("opacity", 42),
      step("invert", 0),
      step("grayscale", 0),
    ],
    [step("opacity", 0)],
  ]) {
    assert.equal(
      executeExample(generateCode("#ff5c7a", steps, DEFAULT_OUTPUT)),
      runChain("#ff5c7a", steps).toHex(),
    );
  }
});

test("every supported Color format and representation matches generated code", () => {
  const color = runChain("#7955f680", []);
  for (const format of COLOR_FORMATS) {
    for (const representation of ["string", "object"] as const) {
      const output = settings({ format, representation });
      const result = evaluateOutput(color, output);
      assert.equal(result.type, "color");
      if (result.type !== "color") continue;
      const expected =
        result.value === "No exact CSS name" ? undefined : result.value;
      assert.deepEqual(
        executeExample(generateCode("#7955f680", [], output)),
        expected,
        `${format} / ${representation}`,
      );
    }
  }
  assert.equal(getAvailableRepresentation("HSV"), "object");
  assert.equal(getAvailableRepresentation("CSS name"), "string");
  assert.equal(getAvailableRepresentation("RGB"), "both");
});

test("generated examples include parsers for plugin-based input strings", () => {
  for (const input of [
    "tomato",
    "transparent",
    "hwb(120 20% 10%)",
    "device-cmyk(10% 20% 30% 0%)",
    "lch(60% 30 90)",
    "oklch(60% .1 90)",
    "oklab(60% .1 .1)",
  ]) {
    assert.ok(isValidColor(input), input);
    assert.equal(
      executeExample(generateCode(input, [], DEFAULT_OUTPUT)),
      runChain(input, []).toHex(),
      input,
    );
  }
});

test("CSS names handle an absent exact name and optional closest lookup", () => {
  const color = runChain("#db81b9", []);
  const exact = settings({ format: "CSS name" });
  const closest = settings({ format: "CSS name", closest: true });
  assert.equal(evaluateOutput(color, exact).value, "No exact CSS name");
  assert.equal(executeExample(generateCode("#db81b9", [], exact)), undefined);
  assert.equal(
    executeExample(generateCode("#db81b9", [], closest)),
    evaluateOutput(color, closest).value,
  );
});

test("palettes support all three methods and mixing spaces, capped at 10 colors", () => {
  const color = runChain("#ff5c7a", []);
  for (const palette of ["tints", "shades", "tones"] as const) {
    for (const space of ["lab", "rgb"] as const) {
      const output = settings({ kind: "palette", palette, space, count: 12 });
      const result = evaluateOutput(color, output);
      assert.equal(result.type, "palette");
      if (result.type === "palette") assert.equal(result.colors.length, 10);
      assert.deepEqual(
        executeExample(generateCode("#ff5c7a", [], output)),
        result.value,
      );
    }
  }
});

test("every harmony mode generates the same colors as its copied example", () => {
  for (const harmony of HARMONY_TYPES) {
    const output = settings({ kind: "harmony", harmony });
    assert.deepEqual(
      executeExample(generateCode("#ff5c7a", [], output)),
      evaluateOutput(runChain("#ff5c7a", []), output).value,
    );
  }
});

test("Contrast, Difference and Readability expose real library outputs", () => {
  const black = runChain("#000", []);
  assert.deepEqual(
    evaluateOutput(black, settings({ kind: "contrast", comparison: "white" })),
    { type: "number", value: 21, unit: "contrast" },
  );
  assert.deepEqual(
    evaluateOutput(black, settings({ kind: "difference", comparison: "#000" })),
    { type: "number", value: 0, unit: "delta" },
  );
  assert.equal(
    evaluateOutput(
      runChain("#777", []),
      settings({ kind: "readability", size: "normal" }),
    ).value,
    false,
  );
  assert.equal(
    evaluateOutput(
      runChain("#777", []),
      settings({ kind: "readability", size: "large" }),
    ).value,
    true,
  );
  assert.equal(
    evaluateOutput(
      runChain("#777", []),
      settings({ kind: "readability", size: "large", level: "AAA" }),
    ).value,
    false,
  );
  for (const kind of ["contrast", "difference", "readability"] as const) {
    const output = settings({ kind, comparison: "white" });
    assert.equal(
      executeExample(generateCode("#777", [], output)),
      evaluateOutput(runChain("#777", []), output).value,
    );
  }
});

test("Minify has no option controls or arguments and preserves transparent colors", () => {
  const output = settings({ kind: "minify" });
  assert.equal(
    evaluateOutput(runChain("#ff5c7a", DEFAULT_STEPS), output).value,
    "#e82",
  );
  for (const input of ["#ff0000", "#12345680", "transparent"]) {
    const result = evaluateOutput(runChain(input, []), output);
    const code = generateCode(input, [], output);
    assert.match(code, /\.minify\(\)/);
    assert.equal(executeExample(code), result.value);
    if (typeof result.value === "string")
      assert.equal(colord(result.value).toHex(), colord(input).toHex());
  }
});

test("Info uses a single chain variable and independent method calls", () => {
  const output = settings({ kind: "info" });
  const result = evaluateOutput(runChain("#ff5c7a", DEFAULT_STEPS), output);
  assert.deepEqual(result, {
    type: "info",
    value: { brightness: 0.61, luminance: 0.36, isLight: true },
  });
  const code = generateCode("#ff5c7a", DEFAULT_STEPS, output);
  assert.equal((code.match(/colord\("/g) ?? []).length, 1);
  assert.match(code, /const color = colord/);
  assert.match(code, /color\.brightness\(\);/);
  assert.match(code, /color\.luminance\(\);/);
  assert.match(code, /color\.isLight\(\);/);
  assert.doesNotMatch(code, /brightness:/);
});

test("invalid drafts are rejected instead of becoming a silent black result", () => {
  assert.equal(isValidColor("#notacolor"), false);
  assert.throws(() => runChain("#notacolor", []), /valid color/);
  assert.throws(
    () => runChain("#fff", [step("mix", 25, "unfinished(")]),
    /valid color/,
  );
  assert.throws(
    () =>
      evaluateOutput(
        runChain("#fff", []),
        settings({ kind: "contrast", comparison: "unfinished(" }),
      ),
    /valid color/,
  );
  assert.notEqual(createStep("mix").id, createStep("mix").id);
});
