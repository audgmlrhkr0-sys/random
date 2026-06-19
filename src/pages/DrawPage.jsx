import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useRoom } from '../context/RoomContext';
import { DRAW_COUNT_PER_TEAM } from '../config';
import {
  performDraw,
  getRequiredSubmissionCount,
  getSubmissionShortage,
} from '../utils/draw';
import styles from './DrawPage.module.css';

export default function DrawPage() {
  const navigate = useNavigate();
  const {
    roomId,
    submissions,
    excludeOwnTeam,
    setExcludeOwnTeam,
    saveDrawResult,
    clearAllData,
    loading,
  } = useRoom();
  const [shuffling, setShuffling] = useState(false);
  const [error, setError] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const required = getRequiredSubmissionCount();
  const shortage = getSubmissionShortage(submissions);
  const canDrawNow = shortage === 0;

  const handleToggleExclude = async (checked) => {
    await setExcludeOwnTeam(checked);
  };

  const handleDraw = () => {
    setError('');
    setShuffling(true);

    setTimeout(async () => {
      const result = performDraw(submissions, excludeOwnTeam);
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

  return (
    <Layout showBack backTo={`/r/${roomId}`}>
      <div className={styles.container}>
        <h1 className={styles.title}>추첨</h1>
        <p className={styles.subtitle}>진행자 전용 화면 · 모든 기기에 실시간 반영</p>

        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>전체 제출</span>
            <span className={styles.statValue}>{submissions.length}개</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>필요 수량</span>
            <span className={styles.statValue}>{required}개</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>팀당 배정</span>
            <span className={styles.statValue}>{DRAW_COUNT_PER_TEAM}개</span>
          </div>
        </div>

        {!canDrawNow && (
          <div className={styles.warning}>
            ⚠ 쪽지가 {shortage}개 부족해요! (5팀 × 3개 = 15개 필요)
          </div>
        )}

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
              <span>{s.teamId}팀</span>
            </div>
          ))}
          {submissions.length > 20 && (
            <span className={styles.moreNotes}>+{submissions.length - 20}</span>
          )}
          {submissions.length === 0 && (
            <p className={styles.emptyPool}>아직 제출된 쪽지가 없어요</p>
          )}
        </div>

        <label className={`${styles.optionToggle} ${excludeOwnTeam ? styles.optionToggleActive : ''}`}>
          <input
            type="checkbox"
            checked={excludeOwnTeam}
            onChange={(e) => handleToggleExclude(e.target.checked)}
          />
          자기 팀 쪽지 제외하기
        </label>

        <button
          type="button"
          className={styles.drawBtn}
          onClick={handleDraw}
          disabled={!canDrawNow || shuffling}
        >
          {shuffling ? '추첨 중...' : '추첨하기 🎲'}
        </button>

        <div className={styles.resetSection}>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => setShowResetConfirm(true)}
          >
            데이터 초기화
          </button>
          <p className={styles.resetHint}>
            제출한 쪽지와 추첨 결과가 <strong>모두 삭제</strong>됩니다.
            <br />
            다음 회차 시작 전에만 눌러주세요.
          </p>
        </div>

        {showResetConfirm && (
          <div className={styles.confirmBackdrop}>
            <div className={styles.confirmBox}>
              <p>제출한 모든 쪽지와 추첨 결과를 삭제할까요?</p>
              <p style={{ fontSize: '0.85rem', color: '#6b7a8f', marginTop: '0.5rem' }}>
                삭제하면 되돌릴 수 없어요!
              </p>
              <div className={styles.confirmActions}>
                <button type="button" onClick={() => setShowResetConfirm(false)}>
                  취소
                </button>
                <button type="button" className={styles.confirmDelete} onClick={handleReset}>
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
