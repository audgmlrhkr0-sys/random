import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useRoom } from '../context/RoomContext';
import { TEAM_COUNT } from '../config';
import styles from './MainPage.module.css';

export default function MainPage() {
  const {
    roomId,
    submissions,
    drawResult,
    teamNames,
    updateTeamName,
  } = useRoom();
  const [copied, setCopied] = useState(false);
  const [draftNames, setDraftNames] = useState({});

  const shareUrl = `${window.location.origin}${window.location.pathname}#/r/${roomId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('아래 링크를 복사해서 공유하세요:', shareUrl);
    }
  };

  const handleNameBlur = (index) => {
    const value = draftNames[index] ?? teamNames[index];
    setDraftNames((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    if (value.trim() !== teamNames[index]) {
      updateTeamName(index, value);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <p className={styles.tag}>&gt; CYBER_LOTTERY // SYNC_ON</p>
        <h1 className={styles.title}>감상법 제비뽑기</h1>
        <p className={styles.subtitle}>
          팀명을 수정하고 입장하세요 · 변경 사항은 모두에게 실시간 반영
        </p>

        <div className={styles.shareBox}>
          <p className={styles.shareLabel}>▸ 공유 링크 (입장 비밀번호: 9650)</p>
          <div className={styles.shareRow}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              className={styles.shareInput}
              onFocus={(e) => e.target.select()}
            />
            <button type="button" className={styles.copyBtn} onClick={handleCopy}>
              {copied ? '복사됨' : '복사'}
            </button>
          </div>
          <p className={styles.shareHint}>
            전체 제출: <strong>{submissions.length}개</strong>
            {drawResult && (
              <>
                {' · '}
                <Link to={`/r/${roomId}/result`} className={styles.resultLink}>
                  추첨 결과 →
                </Link>
              </>
            )}
          </p>
        </div>

        <div className={styles.teamGrid}>
          {Array.from({ length: TEAM_COUNT }, (_, index) => {
            const teamSubmissions = submissions.filter((s) => s.teamId === index + 1);
            const name = teamNames[index] ?? `${index + 1}팀`;

            return (
              <div key={index} className={styles.teamCard}>
                <span className={styles.teamNumber}>{index + 1}</span>
                <input
                  type="text"
                  className={styles.teamNameInput}
                  value={draftNames[index] ?? name}
                  onChange={(e) =>
                    setDraftNames((prev) => ({ ...prev, [index]: e.target.value }))
                  }
                  onBlur={() => handleNameBlur(index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.target.blur();
                  }}
                  aria-label={`${index + 1}팀 이름`}
                />
                <span className={styles.teamCount}>{teamSubmissions.length}개 제출</span>
                <Link to={`/r/${roomId}/team/${index + 1}`} className={styles.enterBtn}>
                  입장 →
                </Link>
              </div>
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
