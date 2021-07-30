import { useMemo } from 'react'
import { colord, getFormat } from '../../utils/colord'
import Section from '../Section'
import * as Result from '../Result'
import ColorInput from '../ColorInput'
import styles from './Form.module.css'

interface Props {
  color: string
  onColorChange: (color: string) => void
}

export const Form = ({ color, onColorChange }: Props) => {
  const [instance, format] = useMemo(() => [colord(color), getFormat(color)], [color])

  return (
    <div className={styles.form}>
      <Section className={styles.inputSection}>
        <ColorInput value={color} onChange={onColorChange} />
      </Section>

      <Section title="Analysis" className={styles.analysisSection}>
        <Result.Root>
          <Result.Title>Is valid CSS value?</Result.Title>
          <Result.Value>{instance.isValid() ? 'Yes' : 'No'}</Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>Format</Result.Title>
          <Result.Value>{format?.toUpperCase() || '—'}</Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>Hue (0–359)</Result.Title>
          <Result.Value>{instance.hue() + ' deg'}</Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>Brightness</Result.Title>
          <Result.Value>
            {`${Math.round(instance.brightness() * 100)}% `}
            {instance.isDark() ? '(Dark)' : '(Light)'}
          </Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>Luminance</Result.Title>
          <Result.Value>
            {`${Math.round(instance.luminance() * 100)}%`}
          </Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>Contrast on white</Result.Title>
          <Result.Value>{`${instance.contrast()}:1`}</Result.Value>
        </Result.Root>
      </Section>

      <Section title="Conversion" className={styles.conversionSection}>
        <Result.Root>
          <Result.Title>HEX</Result.Title>
          <Result.Value>{instance.toHex()}</Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>RGB</Result.Title>
          <Result.Value>{instance.toRgbString()}</Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>HSL</Result.Title>
          <Result.Value>{instance.toHslString()}</Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>HWB</Result.Title>
          <Result.Value>{instance.toHwbString()}</Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>CMYK</Result.Title>
          <Result.Value>{instance.toCmykString()}</Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>LCH</Result.Title>
          <Result.Value>{instance.toLchString()}</Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>CSS keyword</Result.Title>
          <Result.Value>{instance.toName() || '—'}</Result.Value>
        </Result.Root>
      </Section>

      {/*
      <Section title="Tints and shades" className={styles.generationSection}>
        <Result.Root>
          <Result.Title>Grayscale</Result.Title>
          <Result.Value>
            <Palette hexes={[instance.grayscale().toHex()]} />
          </Result.Value>
        </Result.Root>
      </Section>

      <Section title="Harmonies" className={styles.generationSection}>
        <Result.Root>
          <Result.Title>Analogous</Result.Title>
          <Result.Value>
            <Palette hexes={instance.harmonies("analogous").map((c) => c.toHex())} />
          </Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>Complementary</Result.Title>
          <Result.Value>
            <Palette hexes={instance.harmonies("complementary").map((c) => c.toHex())} />
          </Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>Rectangle</Result.Title>
          <Result.Value>
            <Palette hexes={instance.harmonies("rectangle").map((c) => c.toHex())} />
          </Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>Split-complementary</Result.Title>
          <Result.Value>
            <Palette hexes={instance.harmonies("split-complementary").map((c) => c.toHex())} />
          </Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>Tetradic</Result.Title>
          <Result.Value>
            <Palette hexes={instance.harmonies("tetradic").map((c) => c.toHex())} />
          </Result.Value>
        </Result.Root>
        <Result.Root>
          <Result.Title>Triadic</Result.Title>
          <Result.Value>
            <Palette hexes={instance.harmonies("triadic").map((c) => c.toHex())} />
          </Result.Value>
        </Result.Root>
      </Section>
      */}
    </div>
  )
}