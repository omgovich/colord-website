import React from 'react'
import styles from './Palette.module.css'

interface Props {
  hexes: string[] 
}

export const Palette: React.FC<Props> = ({ hexes }: Props) => {
  return (
    <div className={styles.palette}>
      {hexes.map((hex, index) => (
        <div
          key={index}
          className={styles.swatch}
          style={{ backgroundColor: hex }}
          onClick={() => navigator.clipboard.writeText(hex)}
        />
      ))}
    </div>
  )
}