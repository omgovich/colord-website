"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Palette, X } from "lucide-react";
import {
  COLOR_FORMATS,
  HARMONY_TYPES,
  OUTPUT_META,
  getAvailableRepresentation,
  type ColorFormat,
  type OutputKind,
  type OutputResult,
  type OutputSettings,
} from "@/lib/color-engine";
import { CopyButton } from "./ui";
import { NativeSelect, ParameterColor } from "./color-controls";

export function OutputBlock({
  settings,
  onChange,
}: {
  settings: OutputSettings;
  onChange: (patch: Partial<OutputSettings>) => void;
}) {
  const meta = OUTPUT_META[settings.kind];
  const representation = getAvailableRepresentation(settings.format);
  return (
    <motion.section
      layout
      className={`output-block glass material-${meta.material}`}

      aria-label="Output settings"
    >
      <span className="output-eyebrow">Output</span>
      <div className="output-main-row">
        <Palette size={21} />
        <NativeSelect
          label="Output type"
          value={settings.kind}
          onChange={(kind) => onChange({ kind: kind as OutputKind })}
          className="output-kind-select"
          displayValue={meta.label}
        >
          {(Object.keys(OUTPUT_META) as OutputKind[]).map((kind) => (
            <option key={kind} value={kind}>
              {OUTPUT_META[kind].label}
            </option>
          ))}
        </NativeSelect>
        {settings.kind === "color" && (
          <NativeSelect
            label="Color format"
            value={settings.format}
            onChange={(format) => onChange({ format: format as ColorFormat })}
          >
            {COLOR_FORMATS.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </NativeSelect>
        )}
      </div>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={settings.kind}
          className="output-parameters"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
        >
          {settings.kind === "color" && representation === "both" && (
            <NativeSelect
              label="Color representation"
              value={settings.representation}
              onChange={(value) =>
                onChange({
                  representation: value as OutputSettings["representation"],
                })
              }
            >
              <option value="string">CSS string</option>
              <option value="object">Object</option>
            </NativeSelect>
          )}
          {settings.kind === "color" && settings.format === "CSS name" && (
            <label className="check-label">
              <input
                type="checkbox"
                checked={settings.closest}
                onChange={(e) => onChange({ closest: e.target.checked })}
              />
              Closest name
            </label>
          )}
          {settings.kind === "palette" && (
            <>
              <div className="output-fields-row">
                <NativeSelect
                  label="Palette type"
                  value={settings.palette}
                  onChange={(value) =>
                    onChange({ palette: value as OutputSettings["palette"] })
                  }
                >
                  <option value="tints">Tints</option>
                  <option value="shades">Shades</option>
                  <option value="tones">Tones</option>
                </NativeSelect>
                <NativeSelect
                  label="Palette color space"
                  value={settings.space}
                  onChange={(value) =>
                    onChange({ space: value as OutputSettings["space"] })
                  }
                >
                  <option value="lab">LAB</option>
                  <option value="rgb">RGB</option>
                </NativeSelect>
              </div>
              <label className="count-control">
                <span>Colors</span>
                <input
                  aria-label="Palette color count"
                  type="range"
                  min={2}
                  max={10}
                  value={settings.count}
                  onChange={(e) => onChange({ count: Number(e.target.value) })}
                />
                <output>{settings.count}</output>
              </label>
            </>
          )}
          {settings.kind === "harmony" && (
            <NativeSelect
              label="Harmony type"
              value={settings.harmony}
              onChange={(harmony) => onChange({ harmony })}
            >
              {HARMONY_TYPES.map((type) => (
                <option value={type} key={type}>
                  {type
                    .replaceAll("-", " ")
                    .replace(/^./, (s) => s.toUpperCase())}
                </option>
              ))}
            </NativeSelect>
          )}
          {["contrast", "readability", "difference"].includes(
            settings.kind,
          ) && (
            <ParameterColor
              label="against"
              value={settings.comparison}
              onChange={(comparison) => onChange({ comparison })}
            />
          )}
          {settings.kind === "readability" && (
            <div className="output-fields-row">
              <NativeSelect
                label="Readability WCAG level"
                value={settings.level}
                onChange={(level) =>
                  onChange({ level: level as OutputSettings["level"] })
                }
              >
                <option value="AA">WCAG AA</option>
                <option value="AAA">WCAG AAA</option>
              </NativeSelect>
              <NativeSelect
                label="Readability text size"
                value={settings.size}
                onChange={(size) =>
                  onChange({ size: size as OutputSettings["size"] })
                }
              >
                <option value="normal">Normal text</option>
                <option value="large">Large text</option>
              </NativeSelect>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}
export function ResultView({
  result,
  settings,
}: {
  result: OutputResult;
  settings: OutputSettings;
}) {
  const value =
    typeof result.value === "object"
      ? JSON.stringify(result.value, null, 2)
      : String(result.value);
  const summary = `${OUTPUT_META[settings.kind].label} result: ${value}`;
  const [announcement, setAnnouncement] = useState(summary);
  useEffect(() => {
    const timer = setTimeout(() => setAnnouncement(summary), 350);
    return () => clearTimeout(timer);
  }, [summary]);
  return (
    <div
      className={`result-view result-${result.type}`}
      role="region"
      aria-label="Result"
    >
      <span className="sr-only" role="status" aria-atomic="true">
        {announcement}
      </span>
      <span className="result-eyebrow">Result</span>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          className="result-content"
          key={settings.kind}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {result.type === "color" && (
            <>
              <div
                className="color-sphere result-sphere"
                style={{ "--swatch": result.color } as CSSProperties}
              >
                <span className="sphere-reflection" />
              </div>
              <div className="result-value-row">
                <pre className="result-value">{value}</pre>
                <CopyButton value={value} label="Copy result" />
              </div>
            </>
          )}
          {result.type === "palette" && (
            <>
              <div className="palette-result">
                {result.colors.map((color, index) => (
                  <CopyButton
                    key={`${index}-${color}`}
                    value={color}
                    label={`Copy ${color}`}
                    className="palette-swatch-copy"
                  >
                    <span
                      className="palette-swatch"
                      style={{ backgroundColor: color }}
                    />
                    <code>{color}</code>
                  </CopyButton>
                ))}
              </div>
              <CopyButton
                value={JSON.stringify(result.colors, null, 2)}
                label="Copy color palette"
                className="copy-result-label"
              >
                Copy palette
              </CopyButton>
            </>
          )}
          {result.type === "number" && (
            <>
              <div className="numeric-result">
                {result.value}
                {result.unit === "contrast" && <span>:1</span>}
              </div>
              <span className="numeric-result-label">
                {result.unit === "contrast"
                  ? "Contrast ratio"
                  : "Delta E · 0–1"}
              </span>
              {result.unit === "delta" && (
                <p className="delta-hint">0 means identical colors</p>
              )}
              <CopyButton
                value={String(result.value)}
                label="Copy numeric result"
              />
            </>
          )}
          {result.type === "boolean" && (
            <>
              <div
                className="readability-sample"
                style={{
                  color: result.foreground,
                  backgroundColor: result.background,
                  fontSize: settings.size === "large" ? 28 : 17,
                }}
              >
                The quick brown fox
                <br />
                jumps over the lazy dog.
              </div>
              <div
                className={`readability-verdict ${result.value ? "passes" : "fails"}`}
              >
                {result.value ? <Check size={19} /> : <X size={19} />}
                <span>
                  {result.value ? "Passes" : "Doesn’t pass"} {settings.level}
                </span>
              </div>
              <p className="readability-details">
                {settings.size === "large" ? "Large text" : "Normal text"} ·{" "}
                {result.contrast}:1 contrast
              </p>
            </>
          )}
          {result.type === "text" && (
            <div className="result-value-row">
              <code className="minified-result">{result.value}</code>
              <CopyButton value={result.value} label="Copy minified color" />
            </div>
          )}
          {result.type === "info" && (
            <dl className="info-result">
              <div>
                <dt>Brightness</dt>
                <dd>{result.value.brightness}</dd>
              </div>
              <div>
                <dt>Luminance</dt>
                <dd>{result.value.luminance}</dd>
              </div>
              <div>
                <dt>Light / dark</dt>
                <dd>{result.value.isLight ? "Light" : "Dark"}</dd>
              </div>
            </dl>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
