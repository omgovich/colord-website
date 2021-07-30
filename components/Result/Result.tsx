import React from 'react'
import styles from './Result.module.css'

export const Root: React.FC = (props) => <div {...props} className={styles.result} />
export const Title: React.FC = (props) => <div {...props} className={styles.resultTitle} />
export const Value: React.FC = (props) => <div {...props} className={styles.resultValue} />