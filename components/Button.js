import styles from '../styles/Button.module.css'

export function Button({
  buttonText,
  onClick
}) {
  return (
    <button
      className={styles.buttonStyle}
      onClick={onClick}
    >{buttonText}</button>
  )
}