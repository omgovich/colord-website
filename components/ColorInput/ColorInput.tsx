import React, { useCallback, useMemo } from 'react'
import { colord, getFormat, random } from '../../utils/colord'
import { HexColorPicker } from 'react-colorful'
import * as Popover from '@radix-ui/react-popover';
import { UpdateIcon } from '@radix-ui/react-icons'
import styles from './ColorInput.module.css'

interface Props {
  value:  string
  onChange: (color: string) => void
}

const getRandomColor = (): string => {
  const k = Math.random()
  if (k > 0.75) return random().toHslString()
  if (k > 0.5) return random().toRgbString()
  return random().toHex()
}

export const ColorInput = ({ value, onChange }: Props) => {
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const hex = useMemo(() => {
    return getFormat(value) === 'hex' ? value : colord(value).toHex()
  }, [value])

  const handleRandomClick = useCallback(() => {
    onChange(getRandomColor())
  }, [onChange])

  return (
    <div className={styles.wrapper}>
      <Popover.Root>
        <Popover.Trigger className={styles.swatch} style={{ backgroundColor: hex }} />
        <Popover.Content className={styles.picker} sideOffset={4}>
          <HexColorPicker color={hex} onChange={onChange} />
        </Popover.Content>
      </Popover.Root>

      <input className={styles.input} type="text" value={value} onChange={handleInputChange} autoFocus />

      <button className={styles.randomButton} onClick={handleRandomClick}>
        <UpdateIcon className={styles.randomButtonIcon} />
        <span className={styles.randomButtonText}>Random</span>
      </button>
    </div>
  )
}