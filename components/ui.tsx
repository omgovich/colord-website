"use client";

import Link from "next/link";
import { ArrowUpRight, Check, Copy, Github } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

const REPOSITORY = "https://github.com/omgovich/colord";
const CROWN =
  "M28 24L52.5 45.5L69 0L85.5 46.9495L108 22.8624L110.5 58.789L138 44.0917L126 89H69H12L0 44.0917L28.5 59.5L28 24ZM126 108V92H12V108H126Z";

export function Mark() {
  const id = useId();
  return (
    <svg className="shell-crown" viewBox="0 0 138 108" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2aa0f4" />
          <stop offset=".52" stopColor="#fb335f" />
          <stop offset="1" stopColor="#f3d100" />
        </linearGradient>
      </defs>
      <path d={CROWN} fill={`url(#${id})`} />
    </svg>
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
