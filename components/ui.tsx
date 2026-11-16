"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Copy, Github } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const REPOSITORY = "https://github.com/omgovich/colord";
export function Mark() {
  return (
    <img
      className="shell-crown"
      src="/brand/colord-crown-h2.svg"
      width={440}
      height={280}
      alt=""
      aria-hidden="true"
    />
  );
}

export function Brand({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      href="/"
      className={`shell-brand${footer ? " shell-brand-footer" : ""}`}
      aria-label="colord home"
    >
      <Mark />
      <span>colord</span>
    </Link>
  );
}

export function CopyButton({
  value,
  className = "",
  children,
  label = "Copy to clipboard",
}: {
  value: string;
  className?: string;
  children?: ReactNode;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function copy() {
    clearTimeout(timer.current);
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("error");
    }
    timer.current = setTimeout(() => setState("idle"), 2200);
  }
  return (
    <button
      type="button"
      className={`copy-button shell-copy-button ${className}`}
      onClick={copy}
      aria-label={state === "copied" ? "Copied to clipboard" : label}
      data-copy-state={state}
      title={
        state === "error"
          ? "Clipboard unavailable. Select the text to copy it."
          : undefined
      }
    >
      {children}
      <span className="shell-copy-icon" aria-hidden="true">
        {state === "copied" ? <Check size={16} /> : <Copy size={16} />}
      </span>
      <span className="sr-only" role="status">
        {state === "copied"
          ? "Copied to clipboard"
          : state === "error"
            ? "Clipboard unavailable. Select and copy the text."
            : ""}
      </span>
    </button>
  );
}

function InstallCommand({ footer = false }: { footer?: boolean }) {
  return (
    <CopyButton
      value="npm i colord"
      className={`shell-install${footer ? " shell-install-footer" : ""}`}
      label="Copy npm install command"
    >
      <code>
        <span aria-hidden="true">$ </span>npm i colord
      </code>
    </CopyButton>
  );
}

export function Header() {
  return (
    <header className="shell-header shell-wrap">
      <div className="shell-header-identity">
        <Brand />
        <p className="shell-tagline">
          Powerful color tools.
          <br className="shell-tagline-break" /> Ridiculously small.
        </p>
      </div>
      <nav className="shell-header-nav" aria-label="Main navigation">
        <a
          className="shell-docs-link"
          href={`${REPOSITORY}#api`}
          target="_blank"
          rel="noreferrer"
        >
          <span className="shell-docs-desktop">API docs</span>
          <span className="shell-docs-mobile">Docs</span>
          <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
        </a>
        <a
          className="shell-github-link"
          href={REPOSITORY}
          target="_blank"
          rel="noreferrer"
          aria-label="colord on GitHub"
        >
          <Github size={19} strokeWidth={1.7} />
        </a>
        <InstallCommand />
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="shell-footer shell-wrap">
      <div className="shell-footer-top">
        <div className="shell-footer-identity">
          <Brand footer />
          <p>
            Made by{" "}
            <a
              href="https://github.com/omgovich"
              target="_blank"
              rel="noreferrer"
            >
              Vlad Shilov
            </a>{" "}
            &amp; the open source community.
          </p>
        </div>
        <div className="shell-footer-actions">
          <nav aria-label="Footer navigation">
            <a href={`${REPOSITORY}#api`} target="_blank" rel="noreferrer">
              API docs{" "}
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
            </a>
            <a href={REPOSITORY} target="_blank" rel="noreferrer">
              GitHub{" "}
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href="https://www.npmjs.com/package/colord"
              target="_blank"
              rel="noreferrer"
            >
              npm <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
            </a>
          </nav>
          <InstallCommand footer />
        </div>
      </div>
      <a
        className="shell-license"
        href={`${REPOSITORY}/blob/master/LICENSE.md`}
        target="_blank"
        rel="noreferrer"
      >
        Open source · MIT licensed
      </a>
    </footer>
  );
}
