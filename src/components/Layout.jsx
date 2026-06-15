import styles from './Layout.module.css';
import { Link } from 'react-router-dom';

export default function Layout({ children, showBack = false, backTo = '/' }) {
  return (
    <div className={styles.layout}>
      {showBack && (
        <Link to={backTo} className={styles.backLink}>
          ← 메인으로
        </Link>
      )}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
