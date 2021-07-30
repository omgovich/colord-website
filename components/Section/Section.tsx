import React from 'react'
import cn from 'clsx'
import styles from './Section.module.css'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  compact?: boolean
  title?: string 
}

export const Section: React.FC<Props> = ({ className, children, title, compact, ...rest }) => {
  const classNameString = cn([
    styles.section,
    compact && styles.compact,
    className
  ])

  return (
    <section className={classNameString} {...rest}>
      {title && <h2 className={styles.title}>{title}</h2>}
      {children}
    </section>
  )
}