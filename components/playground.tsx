"use client";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ButtonHTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { colord, type Colord } from "colord";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type Active,
  type Over,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  Check,
  Dices,
  GripVertical,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { CopyButton } from "./ui";
import { ColorPicker, NativeSelect, ParameterColor } from "./color-controls";
import { OutputBlock, ResultView } from "./output-block";
import {
  DEFAULT_OUTPUT,
  DEFAULT_STEPS,
  OPERATION_META,
  OUTPUT_META,
  createStep,
  evaluateOutput,
  generateCode,
  getOperationGradient,
  isValidColor,
  normalizedColor,
  runChain,
  type OperationKind,
  type OutputKind,
  type OutputSettings,
  type Step,
} from "@/lib/color-engine";
const operationKinds = Object.keys(OPERATION_META) as OperationKind[];
const outputKinds = Object.keys(OUTPUT_META) as OutputKind[];
const ease = [0.22, 1, 0.36, 1] as const;

type DragCardSnapshot = {
  node: HTMLElement;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  origin: string;
  rotation: number;
};

function DragCard({ snapshot }: { snapshot: DragCardSnapshot }) {
  const container = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    const element = container.current;
    element?.replaceChildren(snapshot.node);
    return () => element?.replaceChildren();
  }, [snapshot]);
  return (
    <motion.div
      ref={container}
      className="drag-card-clone"
      inert
      aria-hidden="true"
      style={{
        width: snapshot.width,
        height: snapshot.height,
        marginLeft: snapshot.offsetX,
        marginTop: snapshot.offsetY,
        transformOrigin: snapshot.origin,
      }}
      initial={{
        y: 0,
        scale: 1,
        rotate: snapshot.rotation,
        filter: "drop-shadow(0 0px 0px #4e255800)",
      }}
      animate={{
        y: reduced ? 0 : -7,
        scale: reduced ? 1 : 1.025,
        rotate: reduced ? 0 : -1.6,
        filter: "drop-shadow(0 16px 20px #4e255833)",
      }}
      transition={{ duration: 0.24, ease }}
    />
  );
}

function snapshotCard(
  source: HTMLElement,
  frame: { left: number; top: number },
  event: Event,
): DragCardSnapshot {
  const rect = source.getBoundingClientRect();
  const node = source.cloneNode(true) as HTMLElement;
  const originals = source.querySelectorAll<
    HTMLInputElement | HTMLSelectElement
  >("input, select");
  node
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select")
    .forEach((field, index) => {
      field.value = originals[index].value;
      field.tabIndex = -1;
    });
  node
    .querySelectorAll("[id], [aria-describedby], [aria-controls], label[for]")
    .forEach((element) => {
      for (const attribute of [
        "id",
        "aria-describedby",
        "aria-controls",
        "for",
      ])
        element.removeAttribute(attribute);
    });
  node.style.transform = "none";
  node.style.opacity = "1";
  const pointer = event as PointerEvent;
  const x =
    typeof pointer.clientX === "number" ? pointer.clientX - rect.left : 28;
  const y =
    typeof pointer.clientY === "number" ? pointer.clientY - rect.top : 22;
  const matrix = new DOMMatrixReadOnly(getComputedStyle(source).transform);
  return {
    node,
    width: source.offsetWidth,
    height: source.offsetHeight,
    offsetX: rect.left - frame.left,
    offsetY: rect.top - frame.top,
    origin: `${x}px ${y}px`,
    rotation: (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI,
  };
}

function AmountNumber({
  step,
  onChange,
}: {
  step: Step;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(step.value));
  useEffect(() => {
    setDraft(String(step.value));
  }, [step.value]);
  const meta = OPERATION_META[step.kind];
  const positive =
    ["lightness", "saturation", "hue"].includes(step.kind) && Number(draft) > 0;
  return (
    <label className="amount-number">
      <span className="sr-only">{meta.label} numeric amount</span>
      {positive && <span>+</span>}
      <span className="amount-value">
        <span aria-hidden="true">{draft || "0"}</span>
        <input
          type="text"
          inputMode={meta.min < 0 ? "text" : "numeric"}
          aria-label={`${meta.label} numeric amount`}
          value={draft}
          onChange={(e) => {
            const value = e.target.value;
            if (!/^-?\d{0,4}$/.test(value)) return;
            setDraft(value);
            if (
              /^-?\d+$/.test(value) &&
              Number(value) >= meta.min &&
              Number(value) <= meta.max
            )
              onChange(Number(value));
          }}
          onBlur={() => {
            const value =
              draft === "" || draft === "-"
                ? step.value
                : Math.max(meta.min, Math.min(meta.max, Number(draft)));
            setDraft(String(value));
            onChange(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setDraft(String(step.value));
              e.currentTarget.blur();
            }
          }}
        />
      </span>
      <span>{step.kind === "hue" ? "°" : "%"}</span>
    </label>
  );
}

const keyboardCoordinates =
  (onTarget: (id: string) => void): KeyboardCoordinateGetter =>
  (event, args) => {
    if (
      !["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(event.code)
    )
      return;
    event.preventDefault();
    const library = args.context.active?.data.current?.origin === "library";
    const targets = args.context.droppableContainers
      .getEnabled()
      .filter((c) =>
        library
          ? String(c.id).startsWith("slot-")
          : c.data.current?.origin === "chain",
      )
      .sort((a, b) =>
        library
          ? Number(a.data.current?.index) - Number(b.data.current?.index)
          : Number(a.data.current?.sortable?.index) -
            Number(b.data.current?.sortable?.index),
      );
    const current = targets.findIndex(
      (c) => c.id === (args.context.over?.id ?? args.active),
    );
    const direction =
      event.code === "ArrowUp" || event.code === "ArrowLeft" ? -1 : 1;
    const index =
      current === -1
        ? 0
        : Math.min(targets.length - 1, Math.max(0, current + direction));
    const rect =
      targets[index] && args.context.droppableRects.get(targets[index].id);
    if (rect) {
      onTarget(String(targets[index].id));
      return {
        x:
          rect.left +
          rect.width / 2 -
          (args.context.collisionRect?.width ?? 0) / 2,
        y:
          rect.top +
          rect.height / 2 -
          (args.context.collisionRect?.height ?? 0) / 2,
      };
    }
  };

function LibraryOperation({
  kind,
  onAdd,
}: {
  kind: OperationKind;
  onAdd: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${kind}`,
    data: { origin: "library", kind },
  });
  const meta = OPERATION_META[kind];
  return (
    <div
      ref={setNodeRef}
      className={`library-operation glass material-${meta.material} ${isDragging ? "is-dragging" : ""}`}
    >
      <button
        type="button"
        className="library-grip"
        aria-label={`Drag ${meta.label} into the chain`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={19} />
      </button>
      <button
        type="button"
        className="library-add"
        aria-label={`Add ${meta.label}`}
        onClick={onAdd}
      >
        <span className="library-operation-name">{meta.label}</span>
        <span className="round-action" aria-hidden="true">
          <Plus size={18} />
        </span>
      </button>
    </div>
  );
}
function OutputLibrary({
  selected,
  onSelect,
}: {
  selected: OutputKind;
  onSelect: (kind: OutputKind) => void;
}) {
  return (
    <div className="output-library">
      <h2 className="library-heading">Output blocks</h2>
      <div className="library-list">
        {outputKinds.map((kind) => (
          <button
            type="button"
            key={kind}
            className={`output-choice glass material-${OUTPUT_META[kind].material} ${selected === kind ? "is-selected" : ""}`}
            aria-pressed={selected === kind}
            onClick={() => onSelect(kind)}
          >
            <span>{OUTPUT_META[kind].label}</span>
            <AnimatePresence initial={false}>
              {selected === kind && (
                <motion.span
                  className="round-action"
                  aria-hidden="true"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check size={17} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>
    </div>
  );
}
function InsertSlot({
  index,
  active,
  opening,
  kind,
  height,
  menuProps,
}: {
  index: number;
  active: boolean;
  opening: boolean;
  kind: OperationKind | null;
  height: number;
  menuProps: ButtonHTMLAttributes<HTMLButtonElement>;
}) {
  const { setNodeRef } = useDroppable({ id: `slot-${index}`, data: { index } });
  const reduced = useReducedMotion();
  return (
    <div
      ref={setNodeRef}
      className={`insert-slot ${active ? "drop-ready" : ""} ${opening ? "is-opening" : ""}`}
      style={{ height: opening ? height + 64 : 32 }}
    >
      <button
        className="insert-point"
        type="button"
        aria-label={`Insert a color block at position ${index + 1}`}
        {...menuProps}
      >
        <Plus size={10} />
        <span className="insert-point-label">Add block</span>
      </button>
      <AnimatePresence>
        {opening && kind && (
          <motion.div
            key="pocket"
            className={`landing-pocket material-${OPERATION_META[kind].material}`}
            aria-hidden="true"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease }}
          >
            <span className="pocket-glint" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AmountSlider({
  step,
  before,
  onChange,
}: {
  step: Step;
  before: Colord;
  onChange: (value: number) => void;
}) {
  const meta = OPERATION_META[step.kind];
  const id = useId();
  const signed = ["lightness", "saturation", "hue"].includes(step.kind);
  const labels =
    step.kind === "lightness"
      ? ["Darker", "Lighter"]
      : step.kind === "saturation"
        ? ["Desaturated", "Saturated"]
        : step.kind === "hue"
          ? ["−180°", "+180°"]
          : step.kind === "opacity"
            ? ["Transparent", "Opaque"]
            : ["Original", "Mixed"];
  const track = useMemo(
    () =>
      getOperationGradient(before, {
        kind: step.kind,
        color: step.color,
        space: step.space,
      }),
    [before, step.kind, step.color, step.space],
  );
  const thumbColor = runChain(before, [step]).toHex();
  return (
    <div
      className={`slider-control ${signed ? "is-signed" : ""} ${step.kind === "opacity" ? "alpha-track" : ""}`}
    >
      <label className="sr-only" htmlFor={id}>
        {meta.label} amount
      </label>
      <div
        className="range-wrap"
        style={
          { "--track": track, "--thumb-color": thumbColor } as CSSProperties
        }
      >
        <input
          id={id}
          type="range"
          min={meta.min}
          max={meta.max}
          step={meta.step}
          value={step.value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {signed && <i className="range-zero" aria-hidden="true" />}
      </div>
      <div className="range-labels">
        <span>{labels[0]}</span>
        {signed && <span className="midpoint">0</span>}
        <span>{labels[1]}</span>
      </div>
    </div>
  );
}
function StepCard({
  step,
  index,
  before,
  landed,
  onUpdate,
  onRemove,
}: {
  step: Step;
  index: number;
  before: Colord;
  landed: boolean;
  onUpdate: (patch: Partial<Step>) => void;
  onRemove: () => void;
}) {
  const { setNodeRef, attributes, listeners, isDragging } = useSortable({
    id: step.id,
    data: { origin: "chain", kind: step.kind },
  });
  const reduced = useReducedMotion();
  const meta = OPERATION_META[step.kind];
  const hasAmount = meta.max !== meta.min;
  const positive =
    ["lightness", "saturation", "hue"].includes(step.kind) && step.value > 0;
  return (
    <div
      ref={setNodeRef}
      style={{
        height: isDragging ? 0 : undefined,
        overflow: isDragging ? "hidden" : undefined,
        opacity: isDragging ? 0 : 1,
      }}
      className={`sortable-step step-${step.kind} ${landed ? "just-landed" : ""}`}
      data-step-id={step.id}
    >
      <motion.article
        layout={reduced || isDragging || landed ? false : "position"}
        initial={false}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: reduced ? 1 : 0.95 }}
        transition={{ duration: 0.28, ease }}
        className={`operation-card glass material-${meta.material}`}

        aria-label={`${meta.label} operation ${index + 1}`}
      >
        <div className="operation-header">
          <div className="operation-title">
            <button
              className="step-grip"
              aria-label={`Reorder ${meta.label}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical size={19} />
            </button>
            <h3>{meta.label}</h3>
          </div>
          {hasAmount && (
            <AmountNumber
              step={step}
              onChange={(value) => onUpdate({ value })}
            />
          )}
          <button
            className="remove-step icon-button"
            aria-label={`Remove ${meta.label}`}
            onClick={onRemove}
          >
            <X size={16} />
          </button>
        </div>
        {step.kind === "mix" && (
          <div className="mix-parameters">
            <ParameterColor
              value={step.color}
              onChange={(color) => onUpdate({ color })}
            />
            <div className="mix-space">
              <NativeSelect
                label="Mix color space"
                value={step.space}
                onChange={(space) =>
                  onUpdate({ space: space as Step["space"] })
                }
              >
                <option value="lab">LAB</option>
                <option value="rgb">RGB</option>
              </NativeSelect>
            </div>
          </div>
        )}
        {hasAmount && (
          <AmountSlider
            step={step}
            before={before}
            onChange={(value) => onUpdate({ value })}
          />
        )}
      </motion.article>
    </div>
  );
}
function HighlightedCode({ code }: { code: string }) {
  const tokenize = (line: string) =>
    line.split(
      /(\/\/[^\n]*|"(?:[^"\\]|\\.)*"|\b(?:import|from|const|true|false|undefined)\b|\b\d+(?:\.\d+)?\b)/g,
    );
  return (
    <pre className="recipe-code" tabIndex={0} aria-label="Generated JavaScript">
      <code>
        {code.split("\n").map((line, lineIndex) => (
          <span className="code-line" key={lineIndex}>
            {tokenize(line).map((token, index) => (
              <span
                key={index}
                className={
                  token.startsWith("//")
                    ? "code-comment"
                    : token.startsWith('"')
                      ? "code-string"
                      : /^(import|from|const|true|false|undefined)$/.test(token)
                        ? "code-keyword"
                        : /^\d/.test(token)
                          ? "code-number"
                          : undefined
                }
              >
                {token}
              </span>
            ))}
          </span>
        ))}
      </code>
    </pre>
  );
}
const collisionDetection: CollisionDetection = (args) => {
  if (args.pointerCoordinates) {
    const hits = pointerWithin(args);
    const slot = hits.find((hit) => String(hit.id).startsWith("slot-"));
    if (slot) {
      const liftedIndex =
        args.active.data.current?.origin === "chain"
          ? Number(args.active.data.current?.sortable?.index)
          : -1;
      if (slot.id === `slot-${liftedIndex}`) {
        const visible = args.droppableContainers.find(
          (c) => c.id === `slot-${liftedIndex + 1}`,
        );
        return visible ? [{ id: visible.id }] : [];
      }
      return [slot];
    }
    const hit = hits.find(
      (h) =>
        args.droppableContainers.find((c) => c.id === h.id)?.data.current
          ?.origin === "chain",
    );
    if (!hit) return [];
    const node = args.droppableContainers.find((c) => c.id === hit.id);
    const rect = args.droppableRects.get(hit.id);
    if (!rect || !node) return [];
    let index =
      Number(node.data.current?.sortable?.index) +
      (args.pointerCoordinates.y > rect.top + rect.height / 2 ? 1 : 0);
    if (
      args.active.data.current?.origin === "chain" &&
      index === Number(args.active.data.current?.sortable?.index)
    )
      index += 1;
    const target = args.droppableContainers.find(
      (c) => c.id === `slot-${index}`,
    );
    return target ? [{ id: target.id }] : [];
  }
  return closestCenter({
    ...args,
    droppableContainers:
      args.active.data.current?.origin === "library"
        ? args.droppableContainers.filter((d) =>
            String(d.id).startsWith("slot-"),
          )
        : args.droppableContainers.filter(
            (d) => d.data.current?.origin === "chain",
          ),
  });
};

export default function Playground() {
  const [input, setInput] = useState("#ff5c7a"),
    [draft, setDraft] = useState("#ff5c7a");
  const [steps, setSteps] = useState<Step[]>(DEFAULT_STEPS),
    [output, setOutput] = useState<OutputSettings>(DEFAULT_OUTPUT);
  const [dragKind, setDragKind] = useState<OperationKind | null>(null),
    [announcement, setAnnouncement] = useState("");
  const [blocksOpen, setBlocksOpen] = useState(false),
    [insertIndex, setInsertIndex] = useState<number | null>(null),
    [hydrated, setHydrated] = useState(false),
    [randomKey, setRandomKey] = useState(0);
  const [dragTarget, setDragTarget] = useState<number | null>(null);
  const [dragHeight, setDragHeight] = useState(140);
  const [dragCard, setDragCard] = useState<DragCardSnapshot | null>(null);
  const [landedId, setLandedId] = useState<string | null>(null);
  const [liftedId, setLiftedId] = useState<string | null>(null);
  const keyboardTarget = useRef<string | null>(null);
  const keyboardGetter = useMemo(
    () =>
      keyboardCoordinates((id) => {
        keyboardTarget.current = id;
      }),
    [],
  );
  const operationsRail = useRef<HTMLElement>(null);
  const outputRail = useRef<HTMLElement>(null);
  const pendingReveal = useRef<string | null>(null);
  const menuItems = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeMenuItem, setActiveMenuItem] = useState<number | null>(null);
  const {
    refs: blockMenuRefs,
    floatingStyles: blockMenuStyles,
    context: blockMenuContext,
    isPositioned: blockMenuPositioned,
  } = useFloating({
    open: blocksOpen,
    onOpenChange: (open) => {
      setBlocksOpen(open);
      if (!open) setInsertIndex(null);
    },
    placement: "bottom",
    strategy: "fixed",
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [offset(10), flip(), shift({ padding: 12 })],
  });
  const {
    getFloatingProps: getBlockMenuProps,
    getItemProps: getBlockItemProps,
  } = useInteractions([
    useDismiss(blockMenuContext),
    useRole(blockMenuContext, { role: "menu" }),
    useListNavigation(blockMenuContext, {
      listRef: menuItems,
      activeIndex: activeMenuItem,
      onNavigate: setActiveMenuItem,
      loop: true,
    }),
  ]);
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height =
          entry.borderBoxSize?.[0]?.blockSize ??
          entry.target.getBoundingClientRect().height;
        (entry.target as HTMLElement).style.setProperty(
          "--rail-height",
          `${height}px`,
        );
      }
    });
    for (const node of [operationsRail.current, outputRail.current])
      if (node) observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const inputId = useId();
  const blockMenuId = useId();
  const reduced = useReducedMotion();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardGetter }),
  );
  useEffect(() => {
    setHydrated(true);
  }, []);
  const finalColor = useMemo(() => runChain(input, steps), [input, steps]);
  const result = useMemo(
    () => evaluateOutput(finalColor, output),
    [finalColor, output],
  );
  const code = useMemo(
    () => generateCode(input, steps, output),
    [input, steps, output],
  );
  const beforeColors = useMemo(
    () => steps.map((_, index) => runChain(input, steps.slice(0, index))),
    [input, steps],
  );
  useEffect(() => {
    if (!landedId) return;
    const timer = setTimeout(() => setLandedId(null), 650);
    return () => clearTimeout(timer);
  }, [landedId]);
  useEffect(() => {
    if (!pendingReveal.current || blocksOpen) return;
    let frame = 0;
    let nextFrame = 0;
    // Output parameters swap after their exit animation; reveal the final size.
    const timer = setTimeout(
      () => {
        frame = requestAnimationFrame(() => {
          nextFrame = requestAnimationFrame(() => {
            const id = pendingReveal.current;
            pendingReveal.current = null;
            if (!id) return;
            const isOutput = id === "output";
            const card = document.querySelector<HTMLElement>(
              isOutput
                ? ".output-block"
                : `[data-step-id="${id}"] .operation-card`,
            );
            if (!card) return;
            const rect = card.getBoundingClientRect();
            const viewport = window.visualViewport;
            const top = viewport?.offsetTop ?? 0;
            const height = viewport?.height ?? innerHeight;
            if (
              rect.top >= top + 24 &&
              rect.top + card.offsetHeight <= top + height - 24
            )
              return;
            card.scrollIntoView({
              behavior: reduced ? "instant" : "smooth",
              block:
                isOutput || rect.height > height - 48 ? "start" : "nearest",
            });
          });
        });
      },
      pendingReveal.current === "output" ? 180 : 0,
    );
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(nextFrame);
    };
  }, [steps, output, blocksOpen, reduced]);
  const valid = isValidColor(draft);
  const changeSource = (value: string) => {
    setInput(value);
    setDraft(value);
  };
  const add = (
    kind: OperationKind,
    index = insertIndex ?? steps.length,
    reveal = true,
  ) => {
    const added = createStep(kind);
    pendingReveal.current = reveal ? added.id : null;
    setLandedId(added.id);
    setSteps((current) => {
      const next = [...current];
      next.splice(Math.min(index, current.length), 0, added);
      return next;
    });
    setAnnouncement(`${OPERATION_META[kind].label} added to the chain.`);
    setBlocksOpen(false);
    setInsertIndex(null);
  };
  const selectOutput = (kind: OutputKind) => {
    pendingReveal.current = "output";
    setOutput((current) => ({ ...current, kind }));
    setAnnouncement(`${OUTPUT_META[kind].label} output selected.`);
  };
  const openBlocks = (anchor: HTMLButtonElement, index?: number) => {
    const toggleClosed =
      blocksOpen && blockMenuRefs.domReference.current === anchor;
    blockMenuRefs.setReference(anchor);
    setInsertIndex(toggleClosed ? null : (index ?? null));
    setActiveMenuItem(toggleClosed ? null : 0);
    setBlocksOpen(!toggleClosed);
  };
  const blockTriggerProps = (
    id: string,
    index?: number,
  ): ButtonHTMLAttributes<HTMLButtonElement> => ({
    id,
    "aria-haspopup": "menu",
    "aria-expanded":
      blocksOpen && blockMenuRefs.domReference.current?.id === id,
    "aria-controls": blocksOpen ? blockMenuId : undefined,
    onClick: (event) => openBlocks(event.currentTarget, index),
    onKeyDown: (event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      openBlocks(event.currentTarget, index);
      setActiveMenuItem(
        event.key === "ArrowUp" ? operationKinds.length - 1 : 0,
      );
    },
  });
  const dragLabel = (active: Active) => {
    const kind = active.data.current?.kind as OperationKind | undefined;
    return kind ? OPERATION_META[kind].label : "Color block";
  };
  const dropAnnouncement = (active: Active, over: Over | null) => {
    if (!over) return `${dragLabel(active)} is outside the chain.`;
    const slot = String(over.id).startsWith("slot-");
    const target = slot
      ? Number(String(over.id).slice(5))
      : steps.findIndex((s) => s.id === over.id);
    const from = steps.findIndex((s) => s.id === active.id);
    const total = steps.length + (from < 0 ? 1 : 0);
    const position =
      Math.max(
        0,
        Math.min(
          total - 1,
          target - (slot && from >= 0 && from < target ? 1 : 0),
        ),
      ) + 1;
    return `${dragLabel(active)}, position ${position} of ${total}.`;
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragKind(null);
    setDragCard(null);
    setDragTarget(null);
    setLiftedId(null);
    if (!over) return;
    const targetIsSlot = String(over.id).startsWith("slot-");
    const targetIndex = targetIsSlot
      ? Number(String(over.id).slice(5))
      : steps.findIndex((s) => s.id === over.id);
    if (targetIndex < 0) return;
    if (active.data.current?.origin === "library") {
      add(active.data.current.kind as OperationKind, targetIndex, false);
      return;
    }
    setLandedId(String(active.id));
    setSteps((current) => {
      const oldIndex = current.findIndex((s) => s.id === active.id);
      if (oldIndex < 0) return current;
      if (!targetIsSlot) return arrayMove(current, oldIndex, targetIndex);
      const next = [...current];
      const [item] = next.splice(oldIndex, 1);
      next.splice(
        Math.max(0, targetIndex - (oldIndex < targetIndex ? 1 : 0)),
        0,
        item,
      );
      return next;
    });
    setAnnouncement("Color blocks reordered.");
  };
  const reset = () => {
    setSteps(DEFAULT_STEPS.map((s) => ({ ...s })));
    setOutput({ ...DEFAULT_OUTPUT });
    changeSource("#ff5c7a");
    setAnnouncement("Playground reset.");
  };
  return (
    <MotionConfig reducedMotion="user">
      <DndContext
        id="color-chain"
        sensors={sensors}
        collisionDetection={(args) => {
          if (!args.pointerCoordinates && keyboardTarget.current)
            return [{ id: keyboardTarget.current }];
          return collisionDetection(args);
        }}
        measuring={{
          droppable: { strategy: MeasuringStrategy.Always, frequency: 40 },
        }}
        onDragStart={({ active, activatorEvent }) => {
          pendingReveal.current = null;
          const kind = active.data.current?.kind as OperationKind;
          const source =
            active.data.current?.origin === "chain"
              ? document.querySelector<HTMLElement>(
                  `[data-step-id="${String(active.id)}"] .operation-card`,
                )
              : document
                  .querySelector<HTMLElement>(
                    `[aria-label="Drag ${OPERATION_META[kind].label} into the chain"]`,
                  )
                  ?.closest<HTMLElement>(".library-operation");
          if (source)
            setDragCard(
              snapshotCard(
                source,
                active.rect.current.initial ?? source.getBoundingClientRect(),
                activatorEvent,
              ),
            );
          keyboardTarget.current =
            active.data.current?.origin === "library"
              ? "slot-0"
              : String(active.id);
          setLiftedId(
            active.data.current?.origin === "chain" ? String(active.id) : null,
          );
          setDragKind(kind);
          setDragTarget(null);
          setLandedId(null);
          const card = document.querySelector(`.step-${kind} .operation-card`);
          setDragHeight(
            active.data.current?.origin === "chain"
              ? (active.rect.current.initial?.height ?? 140)
              : (card?.getBoundingClientRect().height ??
                  (kind === "mix"
                    ? 180
                    : ["invert", "grayscale"].includes(kind)
                      ? 80
                      : 140)),
          );
        }}
        onDragOver={({ active, over }) => {
          if (!over) {
            setDragTarget(null);
            return;
          }
          if (String(over.id).startsWith("slot-")) {
            setDragTarget(Number(String(over.id).slice(5)));
            return;
          }
          const target = steps.findIndex((s) => s.id === over.id);
          const from = steps.findIndex((s) => s.id === active.id);
          setDragTarget(
            target < 0 ? null : target + (from >= 0 && from <= target ? 1 : 0),
          );
        }}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setDragKind(null);
          setDragCard(null);
          setDragTarget(null);
          setLiftedId(null);
        }}
        accessibility={{
          announcements: {
            onDragStart: ({ active }) =>
              `${dragLabel(active)} picked up. Use arrow keys to choose a position.`,
            onDragOver: ({ active, over }) => dropAnnouncement(active, over),
            onDragEnd: ({ active, over }) =>
              over
                ? `Dropped ${dropAnnouncement(active, over)}`
                : `${dragLabel(active)} returned to its original position.`,
            onDragCancel: ({ active }) =>
              `${dragLabel(active)} drag cancelled.`,
          },
          screenReaderInstructions: {
            draggable:
              "Press space to pick up a block, arrow keys to move, space to drop, or Escape to cancel.",
          },
        }}
      >
        <section
          className={`workspace wrap ${dragKind ? "is-dragging" : ""}`}
          id="playground"
          aria-label="Interactive color playground"
        >
          <h1 className="sr-only">colord color playground</h1>
          <aside
            ref={operationsRail}
            className="operations-library"
            aria-label="Color blocks"
          >
            <h2 className="library-heading">Color blocks</h2>
            <div className="library-list">
              {operationKinds.map((kind) => (
                <LibraryOperation
                  key={kind}
                  kind={kind}
                  onAdd={() => add(kind, steps.length)}
                />
              ))}
            </div>
          </aside>
          <div className="color-flow">
            <div className="source-color">
              <ColorPicker
                value={input}
                onChange={changeSource}
                label="input color"
                className="color-sphere source-sphere"
                style={{ "--swatch": normalizedColor(input) } as CSSProperties}
              >
                <span className="sphere-reflection" />
              </ColorPicker>
              <div
                className={`source-input-field ${!valid ? "has-error" : ""}`}
              >
                <label htmlFor={inputId} className="sr-only">
                  Input color
                </label>
                <input
                  id={inputId}
                  value={draft}
                  aria-invalid={!valid}
                  aria-describedby={!valid ? "source-error" : undefined}
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (isValidColor(e.target.value)) setInput(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setDraft(input);
                  }}
                />
                <motion.button
                  key={randomKey}
                  type="button"
                  className="random-color icon-button"
                  aria-label="Randomize input color"
                  title="Random color"
                  animate={{
                    rotate: reduced || randomKey === 0 ? 0 : [0, -16, 16, 0],
                  }}
                  transition={{ duration: 0.3 }}
                  onClick={() => {
                    changeSource(
                      colord({
                        h: Math.random() * 360,
                        s: 70 + Math.random() * 30,
                        l: 55 + Math.random() * 18,
                      }).toHex(),
                    );
                    setRandomKey((key) => key + 1);
                  }}
                >
                  <Dices size={19} />
                </motion.button>
              </div>
              {!valid && (
                <p className="input-error" id="source-error">
                  Enter a valid CSS color, such as #ff5c7a or oklch(0.7 0.15
                  30).
                </p>
              )}
            </div>
            <div className="chain-spine">
              <SortableContext
                items={steps.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <AnimatePresence initial={false}>
                  {steps.map((step, index) => (
                    <motion.div
                      layout={
                        reduced || liftedId === step.id || landedId === step.id
                          ? false
                          : "position"
                      }
                      key={step.id}
                      className="flow-item"
                      style={{
                        height: liftedId === step.id ? 0 : undefined,
                        overflow: liftedId === step.id ? "hidden" : undefined,
                      }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.22, ease }}
                    >
                      <InsertSlot
                        index={index}
                        active={!!dragKind}
                        opening={!!dragKind && dragTarget === index}
                        kind={dragKind}
                        height={dragHeight}
                        menuProps={blockTriggerProps(
                          `${inputId}-insert-${index}`,
                          index,
                        )}
                      />
                      <StepCard
                        step={step}
                        index={index}
                        before={beforeColors[index]}
                        landed={landedId === step.id}
                        onUpdate={(patch) =>
                          setSteps((current) =>
                            current.map((s) =>
                              s.id === step.id ? { ...s, ...patch } : s,
                            ),
                          )
                        }
                        onRemove={() => {
                          const removed = document.querySelector(
                            `[data-step-id="${step.id}"]`,
                          );
                          if (removed?.contains(document.activeElement)) {
                            const neighbor =
                              steps[index + 1] ?? steps[index - 1];
                            const target = neighbor
                              ? document.querySelector<HTMLButtonElement>(
                                  `[data-step-id="${neighbor.id}"] .step-grip`,
                                )
                              : document.getElementById(`${inputId}-add`);
                            target?.focus({ preventScroll: true });
                          }
                          setSteps((current) =>
                            current.filter((s) => s.id !== step.id),
                          );
                          setAnnouncement(
                            `${OPERATION_META[step.kind].label} removed.`,
                          );
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SortableContext>
              <InsertSlot
                index={steps.length}
                active={!!dragKind}
                opening={!!dragKind && dragTarget === steps.length}
                kind={dragKind}
                height={dragHeight}
                menuProps={blockTriggerProps(
                  `${inputId}-insert-${steps.length}`,
                  steps.length,
                )}
              />
              <div className="chain-actions">
                <button
                  className="add-block-button"
                  {...blockTriggerProps(`${inputId}-add`)}
                >
                  <Plus size={16} />
                  Add a block
                </button>
                <button
                  className="reset-chain icon-button"
                  aria-label="Reset playground"
                  title="Reset playground"
                  onClick={reset}
                >
                  <RotateCcw size={15} />
                </button>
              </div>
              <div className="plain-connector" aria-hidden="true" />
              <OutputBlock
                settings={output}
                onChange={(patch) =>
                  setOutput((current) => ({ ...current, ...patch }))
                }
              />
              <div
                className="plain-connector result-connector"
                aria-hidden="true"
              />
            </div>
            <ResultView result={result} settings={output} />
            <section className="code-panel" aria-label="Generated code">
              <div className="code-panel-heading">
                <h2>Code</h2>
                <CopyButton value={code} label="Copy generated code">
                  <span>Copy</span>
                </CopyButton>
              </div>
              <HighlightedCode code={code} />
            </section>
          </div>
          <aside
            ref={outputRail}
            className="right-rail"
            aria-label="Output blocks"
          >
            <OutputLibrary selected={output.kind} onSelect={selectOutput} />
          </aside>
        </section>
        {hydrated &&
          createPortal(
            <DragOverlay dropAnimation={null}>
              {dragCard ? <DragCard snapshot={dragCard} /> : null}
            </DragOverlay>,
            document.body,
          )}
        {blocksOpen && (
          <FloatingPortal>
            <FloatingFocusManager
              context={blockMenuContext}
              modal={false}
              disabled={!blockMenuPositioned}
            >
              <div
                ref={blockMenuRefs.setFloating}
                className="block-menu"
                style={{
                  ...blockMenuStyles,
                  visibility: blockMenuPositioned ? "visible" : "hidden",
                  animation: blockMenuPositioned ? undefined : "none",
                }}
                aria-label="Add a color block"
                {...getBlockMenuProps()}
                id={blockMenuId}
              >
                {operationKinds.map((kind, index) => (
                  <button
                    key={kind}
                    ref={(node) => {
                      menuItems.current[index] = node;
                    }}
                    type="button"
                    role="menuitem"
                    tabIndex={activeMenuItem === index ? 0 : -1}
                    className="block-menu-item"
                    {...getBlockItemProps({ onClick: () => add(kind) })}
                  >
                    <span
                      className={`block-menu-swatch glass material-${OPERATION_META[kind].material}`}
                      aria-hidden="true"
                    />
                    <span>{OPERATION_META[kind].label}</span>
                    <Plus size={15} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
        <span className="sr-only" role="status" aria-live="polite">
          {announcement}
        </span>
      </DndContext>
    </MotionConfig>
  );
}
