import styles from './Pencil.module.css';

export default function Pencil({ className = '' }) {
  return (
    <div className={`${styles.pencil} ${className}`} aria-hidden="true">
      <div className={styles.body} />
      <div className={styles.tip} />
      <div className={styles.eraser} />
    </div>
  );
}
