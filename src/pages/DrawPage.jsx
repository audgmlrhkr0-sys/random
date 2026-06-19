import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import PasswordGate from '../components/PasswordGate';
import { useRoom } from '../context/RoomContext';
import {
  DRAW_COUNT_PER_TEAM,
  MIN_TOTAL_FOR_DRAW,
  DRAW_PASSWORD,
  getDrawUnlockKey,
} from '../config';
import { performDraw, getRequiredSubmissionCount, getDrawStatusMessage } from '../utils/draw';
import styles from './DrawPage.module.css';

export default function DrawPage() {
  const navigate = useNavigate();
  const { roomId, submissions, drawResult, saveDrawResult, clearAllData, loading, getTeamName, teamNames } = useRoom();
  const [drawUnlocked, setDrawUnlocked] = useState(
    () => sessionStorage.getItem(getDrawUnlockKey(roomId)) === '1'
  );
  const [shuffling, setShuffling] = useState(false);
  const [error, setError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const required = getRequiredSubmissionCount();
  const statusMessage = getDrawStatusMessage(submissions, teamNames);
  const canDrawNow = !statusMessage;

  useEffect(() => {
    if (drawUnlocked && drawResult) {
      navigate(`/r/${roomId}/result`, { replace: true });
    }
  }, [drawUnlocked, drawResult, roomId, navigate]);

  const handleDrawUnlock = () => {
    sessionStorage.setItem(getDrawUnlockKey(roomId), '1');
    setDrawUnlocked(true);
  };

  const handleDraw = () => {
    setError('');
    setShuffling(true);

    setTimeout(async () => {
      const result = performDraw(submissions, teamNames);
      setShuffling(false);

      if (!result.success) {
        setError(result.error);
        return;
      }

      try {
        await saveDrawResult(result.result);
        navigate(`/r/${roomId}/result`);
      } catch (err) {
        setError(err.message || '결과 저장에 실패했습니다.');
      }
    }, 1500);
  };

  const handleReset = async () => {
    try {
      await clearAllData();
      setShowResetConfirm(false);
      setError('');
    } catch (err) {
      setError(err.message || '초기화에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <Layout showBack backTo={`/r/${roomId}`}>
        <div className={styles.container}>
          <p>불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!drawUnlocked) {
    return (
      <Layout showBack backTo={`/r/${roomId}`}>
        <PasswordGate
          expectedPassword={DRAW_PASSWORD}
          title="추첨 결과"
          desc="선생님만 아는 숫자를 입력하세요"
          submitLabel="들어가기"
          onUnlock={handleDrawUnlock}
        />
      </Layout>
    );
  }

  return (
    <Layout showBack backTo={`/r/${roomId}`}>
      <div className={styles.container}>
        <h1 className={styles.title}>추첨 결과</h1>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>전체 제출</span>
            <span className={styles.statValue}>{submissions.length}개</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>추첨 가능</span>
            <span className={styles.statValue}>{required}개 이상</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>팀당 배정</span>
            <span className={styles.statValue}>{DRAW_COUNT_PER_TEAM}개</span>
          </div>
        </div>

        {statusMessage && <div className={styles.warning}>⚠ {statusMessage}</div>}

        {error && <div className={styles.error}>{error}</div>}

        <div className={`${styles.pool} ${shuffling ? styles.shuffling : ''}`}>
          {submissions.slice(0, 20).map((s, i) => (
            <div
              key={s.id}
              className={styles.poolNote}
              style={{
                '--delay': `${i * 0.05}s`,
                '--x': `${(i % 5) * 18 - 36}px`,
                '--y': `${Math.floor(i / 5) * 14 - 28}px`,
              }}
            >
              <span>{getTeamName(s.teamId)}</span>
            </div>
          ))}
          {submissions.length > 20 && (
            <span className={styles.moreNotes}>+{submissions.length - 20}</span>
          )}
          {submissions.length === 0 && (
            <p className={styles.emptyPool}>아직 제출된 쪽지가 없어요</p>
          )}
        </div>

        <p className={styles.excludeNote}>※ 자기 팀 쪽지는 자동으로 빠져요</p>

        <button
          type="button"
          className={styles.drawBtn}
          onClick={handleDraw}
          disabled={!canDrawNow || shuffling}
        >
          {shuffling ? '추첨 중...' : '추첨 결과'}
        </button>

        <div className={styles.resetSection}>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => setShowResetConfirm(true)}
          >
            데이터 초기화
          </button>
        </div>

        {showResetConfirm && (
          <div className={styles.confirmBackdrop}>
            <div className={styles.confirmBox}>
              <p>제출한 모든 쪽지와 추첨 결과를 초기화할까요?</p>
              <div className={styles.confirmActions}>
                <button type="button" onClick={() => setShowResetConfirm(false)}>
                  취소
                </button>
                <button type="button" className={styles.confirmDelete} onClick={handleReset}>
                  초기화
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
