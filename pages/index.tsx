import { useEffect, useMemo, useRef, useState } from "react";
import { StarFilledIcon } from '@radix-ui/react-icons'
import Head from 'next/head'
import { colord } from "../utils/colord";
import { useStargazerCount } from '../hooks/useStargazerCount'
import Form from '../components/Form'
import Section from '../components/Section'
import styles from '../styles/index.module.css'

export default function Index() {
  const root = useRef<HTMLDivElement>(null)
  const [color, setColor] = useState('#dc143c')
  const stars = useStargazerCount()

  const background = useMemo(() => {
    const color2 = colord(color).alpha(1).desaturate(0.12).lighten(0.12)
    const color1 = color2.rotate(-57).saturate(0.16).lighten(0.03)
    const color3 = color2.rotate(64).saturate(0.39).darken(0.11)
    return `linear-gradient(125deg, ${color1.toHex()} 0%, ${color2.toHex()} 50%, ${color3.toHex()} 100%)`
  }, [color])

  useEffect(() => {
    if (!root.current) return

    const isLight = colord(color).luminance() > 0.3

    for (let lightness = 0; lightness <= 100; lightness += 10) {
      const value = isLight ? (100 - lightness) : lightness
      root.current.style.setProperty(`--lightness-${lightness}`, `${value}%`);
    }
  }, [color])

  return (
    <div ref={root} className={styles.page}>
      <Head>
        <title>Colord — JavaScript library for color manipulations and conversions</title>
        <meta name="description" content="A tiny yet powerful JavaScript tool for high-performance color manipulations and conversions" />
      </Head>

      <div className={styles.bg} style={{ background }}></div>

      <main className={styles.content}>
        <header className={styles.hero}>
          <svg className={styles.logo} width="138" height="108" viewBox="0 0 138 108" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28 24L52.5 45.5L69 0L85.5 46.9495L108 22.8624L110.5 58.789L138 44.0917L126 89H69H12L0 44.0917L28.5 59.5L28 24ZM126 108V92H12V108H126Z" />
          </svg>
          <h1 className={styles.heroTitle}>Colord</h1>
          <h2 className={styles.heroText}>A tiny yet powerful JavaScript tool for high-performance color manipulations and conversions</h2>
          <div className={styles.actions}>
            <a className={styles.button} href="https://github.com/omgovich/colord" target="_blank" rel="noreferrer">
              <span className={styles.buttonContent}>GitHub</span>
              <span className={styles.buttonContent}>
                <StarFilledIcon className={styles.buttonIcon} />
                {stars}
              </span>
            </a>
            <a className={styles.button} href="https://www.npmjs.com/package/colord" target="_blank" rel="noreferrer">
              <span className={styles.buttonContent}>NPM</span>
            </a>
          </div>
        </header>

        <Form color={color} onColorChange={setColor} />

        <article className={styles.article}>
          <h2 className={styles.articleTitle}>Getting Started</h2>

          <pre className={styles.code}>{`npm i colord`}</pre>
          <pre className={styles.code}>{`
import { colord } from "colord";

colord("#ff0000").grayscale().toRgbString();
colord("rgb(192, 192, 192)").isLight();
colord("hsl(0, 50%, 50%)").darken(0.25).toHex();
`.trim()}
          </pre>
          <div className={styles.actions}>
            <a className={styles.button} href="https://github.com/omgovich/colord#getting-started" target="_blank" rel="noreferrer">
              <span className={styles.buttonContent}>API docs</span>
            </a>
            <a className={styles.button} href="https://github.com/omgovich/colord#plugins" target="_blank" rel="noreferrer">
              <span className={styles.buttonContent}>Plugins</span>
            </a>
          </div>
        </article>

        <article className={styles.article}>
          <h2 className={styles.articleTitle}>Why Colord?</h2>
          <div className={styles.features}>
            <Section compact className={styles.feature} title="📦 Small">Just 1.7 KB gzipped (3x+ lighter than color and tinycolor2)</Section>
            <Section compact className={styles.feature} title="💨 Dependency-free">Fast CI and no vulnerability risks</Section>
            <Section compact className={styles.feature} title="🚀 Fast">3x+ faster than color and tinycolor2</Section>
            <Section compact className={styles.feature} title="😍 Simple">Chainable API and familiar patterns</Section>
            <Section compact className={styles.feature} title="🛡 Bulletproof">Written in strict TypeScript and has 100% test coverage</Section>
            <Section compact className={styles.feature} title="🗂 Typed">Ships with types included</Section>
            <Section compact className={styles.feature} title="🏗 Extendable">Built-in plugin system to add new functionality</Section>
            <Section compact className={styles.feature} title="📚 CSS-compliant">Strictly follows CSS Color Level specifications</Section>
            <Section compact className={styles.feature} title="👫 Works everywhere">Supports all browsers and Node.js</Section>
            <Section compact className={styles.feature} title="💪 Immutable">No need to worry about data mutations</Section>
          </div>
        </article>

        <footer className={styles.footer}>
          MIT Licensed. Developed by <a href="https://twitter.com/Omgovich" target="_blank" rel="noreferrer">Vlad Shilov</a> and <a href="https://github.com/omgovich/colord/graphs/contributors" target="_blank" rel="noreferrer">community</a>.
        </footer>
      </main>
    </div>
  )
}
