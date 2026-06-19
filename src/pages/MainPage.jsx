import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useRoom } from '../context/RoomContext';
import { TEAM_NAMES } from '../config';
import styles from './MainPage.module.css';

export default function MainPage() {
  const { roomId, submissions, drawResult, loading, error } = useRoom();
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/r/${roomId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('아래 링크를 복사해서 공유하세요:', shareUrl);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.container}>
          <p>불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.container}>
          <p className={styles.error}>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>감상법 제비뽑기</h1>
        <p className={styles.subtitle}>
          팀별로 감상법을 작성하고, 추첨으로 다른 팀의 감상법을 받아보세요
        </p>

        <div className={styles.shareBox}>
          <p className={styles.shareLabel}>📎 이 링크를 팀원들에게 공유하세요</p>
          <div className={styles.shareRow}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              className={styles.shareInput}
              onFocus={(e) => e.target.select()}
            />
            <button type="button" className={styles.copyBtn} onClick={handleCopy}>
              {copied ? '복사됨!' : '복사'}
            </button>
          </div>
          <p className={styles.shareHint}>
            전체 제출: <strong>{submissions.length}개</strong>
            {drawResult && (
              <>
                {' '}
                ·{' '}
                <Link to={`/r/${roomId}/result`} className={styles.resultLink}>
                  추첨 결과 보기 →
                </Link>
              </>
            )}
          </p>
        </div>

        <div className={styles.teamGrid}>
          {TEAM_NAMES.map((name, index) => {
            const teamSubmissions = submissions.filter((s) => s.teamId === index + 1);
            return (
              <Link
                key={index}
                to={`/r/${roomId}/team/${index + 1}`}
                className={styles.teamBtn}
              >
                <span className={styles.teamNumber}>{index + 1}</span>
                <span className={styles.teamName}>{name}</span>
                <span className={styles.teamCount}>{teamSubmissions.length}개 제출</span>
              </Link>
            );
          })}
        </div>

        <Link to={`/r/${roomId}/draw`} className={styles.drawLink}>
          추첨하러 가기 →
        </Link>
      </div>
    </Layout>
  );
}
