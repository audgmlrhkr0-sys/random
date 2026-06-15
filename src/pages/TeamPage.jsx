import { useState, useCallback } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MemoPad from '../components/MemoPad';
import Pencil from '../components/Pencil';
import FoldedNote from '../components/FoldedNote';
import WriteModal from '../components/WriteModal';
import { TEAM_NAMES, MIN_SUBMISSIONS_HINT } from '../config';
import {
  addSubmission,
  deleteSubmission,
  getTeamSubmissions,
} from '../utils/storage';
import styles from './TeamPage.module.css';

export default function TeamPage() {
  const { teamId } = useParams();
  const teamIndex = Number(teamId) - 1;

  if (teamIndex < 0 || teamIndex >= TEAM_NAMES.length) {
    return <Navigate to="/" replace />;
  }

  const teamName = TEAM_NAMES[teamIndex];
  const [submissions, setSubmissions] = useState(() => getTeamSubmissions(teamId));
  const [modalOpen, setModalOpen] = useState(false);

  const refresh = useCallback(() => {
    setSubmissions(getTeamSubmissions(teamId));
  }, [teamId]);

  const handleSubmit = useCallback(
    (text) => {
      addSubmission({ teamId: Number(teamId), text });
      refresh();
    },
    [teamId, refresh]
  );

  const handleDelete = (id) => {
    if (confirm('이 쪽지를 삭제할까요?')) {
      deleteSubmission(id);
      refresh();
    }
  };

  const count = submissions.length;
  const needsMore = count < MIN_SUBMISSIONS_HINT;

  return (
    <Layout showBack backTo="/">
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.teamTitle}>{teamName}</h1>
          <p className={styles.count}>
            제출한 감상법: <strong>{count}개</strong>
            {needsMore && (
              <span className={styles.hint}>
                {' '}(최소 {MIN_SUBMISSIONS_HINT}개 이상 작성해주세요)
              </span>
            )}
          </p>
        </header>

        <div className={styles.workspace}>
          <div className={styles.memoArea}>
            <MemoPad onClick={() => setModalOpen(true)} />
            <Pencil className={styles.pencil} />
            <div className={styles.foldedStack}>
              {submissions.map((_, i) => (
                <FoldedNote key={i} index={i} />
              ))}
            </div>
          </div>

          <div className={styles.submittedPanel}>
            <h3>📝 내가 쓴 쪽지</h3>
            {submissions.length === 0 ? (
              <p className={styles.submittedEmpty}>
                아직 쪽지가 없어요!
                <br />
                메모지를 눌러 작성해보세요 ✏️
              </p>
            ) : (
              submissions.map((s, idx) => (
                <div key={s.id} className={styles.submittedItem}>
                  <p className={styles.submittedText}>
                    <strong>쪽지 {idx + 1}</strong> {s.text}
                  </p>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(s.id)}
                  >
                    삭제
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <WriteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        teamName={teamName}
      />
    </Layout>
  );
}
