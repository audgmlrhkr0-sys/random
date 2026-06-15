import styles from './FoldedNote.module.css';

export default function FoldedNote({ index = 0 }) {
  const offset = index * 6;
  const rotation = -5 + (index % 3) * 5;

  return (
    <div
      className={styles.folded}
      style={{
        transform: `translateX(${offset}px) rotate(${rotation}deg)`,
        zIndex: index,
      }}
      aria-hidden="true"
    >
      <div className={styles.crease} />
    </div>
  );
}
