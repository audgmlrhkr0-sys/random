import styles from './MemoPad.module.css';

export default function MemoPad({ onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`${styles.memoPad} ${className}`}
      onClick={onClick}
      aria-label="메모지 작성하기"
    >
      <div className={styles.paper}>
        <div className={styles.lines}>
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className={styles.hint}>클릭하여 작성</span>
      </div>
    </button>
  );
}
