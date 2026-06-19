import { useState, useEffect, useRef } from 'react';
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
    updateAllTeamNames,
    saveStatus,
  } = useRoom();

  const [localNames, setLocalNames] = useState(teamNames);
  const skipSync = useRef(false);

  useEffect(() => {
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    setLocalNames(teamNames);
  }, [teamNames]);

  useEffect(() => {
    if (JSON.stringify(localNames) === JSON.stringify(teamNames)) return undefined;
    const timer = setTimeout(() => {
      skipSync.current = true;
      updateAllTeamNames(localNames);
    }, 700);
    return () => clearTimeout(timer);
  }, [localNames, teamNames, updateAllTeamNames]);

  const handleNameChange = (index, value) => {
    setLocalNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleNameBlur = (index) => {
    const trimmed = localNames[index]?.trim();
    if (!trimmed) {
      setLocalNames((prev) => {
        const next = [...prev];
        next[index] = teamNames[index];
        return next;
      });
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>감상법 제비뽑기</h1>
        <p className={styles.subtitle}>우리 팀 이름을 바꾸고 입장하세요!</p>

        <div className={styles.statusBar}>
          <span>
            전체 제출 <strong>{submissions.length}개</strong>
          </span>
          {saveStatus === 'saving' && <span className={styles.saveHint}>저장 중...</span>}
          {saveStatus === 'saved' && <span className={styles.saveOk}>✓ 모두에게 반영됨</span>}
          {saveStatus === 'error' && (
            <span className={styles.saveErr}>저장 안 됨 — 다시 시도해 주세요</span>
          )}
          {drawResult && (
            <Link to={`/r/${roomId}/result`} className={styles.resultLink}>
              추첨 결과 보기
            </Link>
          )}
        </div>

        <div className={styles.teamGrid}>
          {Array.from({ length: TEAM_COUNT }, (_, index) => {
            const teamSubmissions = submissions.filter((s) => s.teamId === index + 1);

            return (
              <div key={index} className={styles.teamCard}>
                <span className={styles.teamNumber}>{index + 1}</span>
                <label className={styles.inputLabel}>팀 이름</label>
                <input
                  type="text"
                  className={styles.teamNameInput}
                  value={localNames[index] ?? `${index + 1}팀`}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  onBlur={() => handleNameBlur(index)}
                  aria-label={`${index + 1}팀 이름`}
                />
                <span className={styles.teamCount}>{teamSubmissions.length}개 제출</span>
                <Link to={`/r/${roomId}/team/${index + 1}`} className={styles.enterBtn}>
                  입장하기
                </Link>
              </div>
            );
          })}
        </div>

        <Link to={`/r/${roomId}/draw`} className={styles.drawLink}>
          추첨 결과
        </Link>
      </div>
    </Layout>
  );
}
