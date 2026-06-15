import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { TEAM_NAMES } from '../config';
import styles from './MainPage.module.css';

export default function MainPage() {
  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>감상법 제비뽑기</h1>
        <p className={styles.subtitle}>
          팀별로 감상법을 작성하고, 추첨으로 다른 팀의 감상법을 받아보세요
        </p>

        <div className={styles.teamGrid}>
          {TEAM_NAMES.map((name, index) => (
            <Link
              key={index}
              to={`/team/${index + 1}`}
              className={styles.teamBtn}
            >
              <span className={styles.teamNumber}>{index + 1}</span>
              <span className={styles.teamName}>{name}</span>
            </Link>
          ))}
        </div>

        <Link to="/draw" className={styles.drawLink}>
          추첨하러 가기 →
        </Link>
      </div>
    </Layout>
  );
}
