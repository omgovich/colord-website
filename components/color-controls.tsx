"use client";
import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { HexAlphaColorPicker } from "react-colorful";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { ChevronDown, X } from "lucide-react";
import { isValidColor, normalizedColor } from "@/lib/color-engine";

export function ColorPicker({
  value,
  onChange,
  label,
  children,
  className = "",
  style,
}: {
  value: string;
  onChange: (color: string) => void;
  label: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset(14), flip(), shift({ padding: 16 })],
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ]);
  useEffect(() => {
    setDraft(value);
  }, [value]);
  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className={`color-picker-trigger ${className}`}
        style={style}
        aria-label={`Open ${label} picker`}
        {...getReferenceProps()}
      >
        {children}
      </button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
            disabled={!isPositioned}
          >
            <div
              ref={refs.setFloating}
              className="color-picker-popover"
              style={{
                ...floatingStyles,
                visibility: isPositioned ? "visible" : "hidden",
                animation: isPositioned ? undefined : "none",
              }}
              aria-label={`${label} picker`}
              {...getFloatingProps()}
            >
              <div className="picker-heading">
                <span>{label}</span>
                <button
                  className="icon-button"
                  aria-label="Close color picker"
                  onClick={() => setOpen(false)}
                >
                  <X size={17} />
                </button>
              </div>
              <HexAlphaColorPicker
                color={normalizedColor(value)}
                onChange={onChange}
              />
              <label
                className={`picker-text-field ${!isValidColor(draft) ? "has-error" : ""}`}
              >
                <span className="sr-only">{label} value</span>
                <input
                  value={draft}
                  spellCheck={false}
                  autoComplete="off"
                  aria-invalid={!isValidColor(draft)}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (isValidColor(e.target.value)) onChange(e.target.value);
                  }}
                  onBlur={() => {
                    if (!isValidColor(draft)) setDraft(value);
                  }}
                />
              </label>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
export function ParameterColor({
  value,
  onChange,
  label = "with",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [draft, setDraft] = useState(value);
  const id = useId();
  useEffect(() => {
    setDraft(value);
  }, [value]);
  const valid = isValidColor(draft);
  return (
    <div className="parameter-color-row">
      <label htmlFor={id}>{label}</label>
      <div className={`parameter-color ${!valid ? "has-error" : ""}`}>
        <ColorPicker
          value={value}
          onChange={onChange}
          label="parameter color"
          className="parameter-swatch"
          style={{ "--swatch": normalizedColor(value) } as CSSProperties}
        />
        <input
          id={id}
          aria-label={`${label} color`}
          value={draft}
          aria-invalid={!valid}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setDraft(e.target.value);
            if (isValidColor(e.target.value)) onChange(e.target.value);
          }}
          onBlur={() => {
            if (!valid) setDraft(value);
          }}
        />
      </div>
    </div>
  );
}
export function NativeSelect({
  label,
  value,
  onChange,
  children,
  className = "",
  displayValue,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
  displayValue?: string;
}) {
  return (
    <label
      className={`select-wrap ${displayValue ? "has-display-value" : ""} ${className}`}
    >
      <span className="sr-only">{label}</span>
      {displayValue && (
        <span className="select-display-value" aria-hidden="true">
          {displayValue}
          <ChevronDown size={16} />
        </span>
      )}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      {!displayValue && <ChevronDown size={14} aria-hidden="true" />}
    </label>
  );
}
