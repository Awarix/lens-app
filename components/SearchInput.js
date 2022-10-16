import styles from '../styles/SearchInput.module.css'

export function SearchInput({
  placeholder, onChange, value, onKeyDown = null
}) {
  return (
    <input
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      className={styles.inputStyle}
      onKeyDown={onKeyDown}
    />
  )
}
