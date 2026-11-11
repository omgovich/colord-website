"use client";

import { ArrowUpRight, Star } from "lucide-react";
import { useEffect, useRef } from "react";

const benchmarks = [
  { name: "colord", operations: 12_563_332, display: "12.56M" },
  { name: "tinycolor2", operations: 1_377_870, display: "1.38M" },
  { name: "chroma-js", operations: 1_277_114, display: "1.28M" },
  { name: "ac-colors", operations: 1_176_078, display: "1.18M" },
  { name: "color", operations: 1_073_550, display: "1.07M" },
];
const adopters = [
  { name: "GitLab", url: "https://gitlab.com" },
  { name: "WordPress", url: "https://wordpress.org" },
  { name: "PixiJS", url: "https://pixijs.com" },
  { name: "cssnano", url: "https://cssnano.github.io/cssnano/" },
  { name: "Stylelint", url: "https://stylelint.io" },
  { name: "pdf.net", url: "https://pdf.net" },
];
export function ProofSection() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = section.current;
    if (
      !node ||
      !window.IntersectionObserver ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    node.classList.add("shell-proof-awaiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.classList.add("shell-proof-visible");
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <section
      className="shell-proof shell-wrap"
      ref={section}
      aria-label="Small library, widely used"
    >
      <article className="shell-proof-panel shell-adoption">
        <a
          className="shell-downloads"
          href="https://www.npmjs.com/package/colord"
          target="_blank"
          rel="noreferrer"
          aria-label="91.2 million monthly downloads on npm"
        >
          <span className="shell-download-number">91.2M</span>
          <span className="shell-download-label">downloads every month</span>
        </a>
        <a
          className="shell-stars"
          href="https://github.com/omgovich/colord"
          target="_blank"
          rel="noreferrer"
        >
          <Star size={17} strokeWidth={1.5} /> 1.9k stars on GitHub{" "}
          <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
        </a>
        <div className="shell-adopters">
          <p>
            Used in <strong>9.5M+ projects</strong>
          </p>
          <div className="shell-adopter-grid">
            {adopters.map((adopter) => (
              <a
                key={adopter.name}
                href={adopter.url}
                target="_blank"
                rel="noreferrer"
              >
                {adopter.name}
              </a>
            ))}
          </div>
        </div>
        <p className="shell-foundations">
          TypeScript included · Immutable API
          <br />
          CSS-compliant · MIT licensed
        </p>
      </article>
      <article
        className="shell-proof-panel shell-benchmark"
        aria-label="Bundle size and performance"
      >
        <dl className="shell-facts-ribbon">
          <div>
            <dt>Brotli</dt>
            <dd>1.8 kB</dd>
          </div>
          <div>
            <dt>dependencies</dt>
            <dd>0</dd>
          </div>
          <div>
            <dt>types included</dt>
            <dd>TS</dd>
          </div>
          <div>
            <dt>test coverage</dt>
            <dd>100%</dd>
          </div>
        </dl>
        <ol
          className="shell-benchmark-list"
          aria-label="Operations per second comparison"
        >
          {benchmarks.map((benchmark, index) => (
            <li
              key={benchmark.name}
              className={index === 0 ? "shell-benchmark-colord" : undefined}
            >
              <div className="shell-benchmark-label">
                <span>{benchmark.name}</span>
                <span>{benchmark.display} ops/s</span>
              </div>
              <div className="shell-benchmark-track" aria-hidden="true">
                <div
                  className="shell-benchmark-fill"
                  style={{
                    width: `${(benchmark.operations / benchmarks[0].operations) * 100}%`,
                    animationDelay: `${index * 65}ms`,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
        <p className="shell-benchmark-environment">
          Node 22 · GitHub-hosted runner
        </p>
      </article>
    </section>
  );
}
export default ProofSection;
