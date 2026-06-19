import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useRoom } from '../context/RoomContext';
import { TEAM_COUNT } from '../config';
import styles from './ResultPage.module.css';

export default function ResultPage() {
  const navigate = useNavigate();
  const { roomId, drawResult, loading, getTeamName } = useRoom();
  const [showAuthor, setShowAuthor] = useState(true);
  const [revealedCards, setRevealedCards] = useState({});

  if (loading) {
    return (
      <Layout showBack backTo={`/r/${roomId}`}>
        <div className={styles.empty}>
          <p>불러오는 중...</p>
        </div>
      </Layout>
    );
  }

  if (!drawResult) {
    return (
      <Layout showBack backTo={`/r/${roomId}`}>
        <div className={styles.empty}>
          <p>아직 추첨 결과가 없습니다.</p>
          <Link to={`/r/${roomId}/draw`} className={styles.linkBtn}>
            추첨 결과
          </Link>
        </div>
      </Layout>
    );
  }

  const handleReveal = (teamId, index) => {
    const key = `${teamId}-${index}`;
    setRevealedCards((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <Layout showBack backTo={`/r/${roomId}`}>
      <div className={styles.container}>
        <h1 className={styles.title}>추첨 결과</h1>
        <p className={styles.syncHint}>모든 기기에서 같은 결과를 볼 수 있습니다</p>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={showAuthor}
            onChange={(e) => setShowAuthor(e.target.checked)}
          />
          작성 팀 표시
        </label>

        <div className={styles.teamGrid}>
          {Array.from({ length: TEAM_COUNT }, (_, i) => {
            const teamId = i + 1;
            const teamName = getTeamName(teamId);
            const notes = drawResult[teamId] ?? [];

            return (
              <section key={teamId} className={styles.teamSection}>
                <h2 className={styles.teamName}>{teamName}</h2>
                <div className={styles.notes}>
                  {notes.map((note, index) => {
                    const key = `${teamId}-${index}`;
                    const isRevealed = revealedCards[key];

                    return (
                      <div
                        key={note.id}
                        className={`${styles.noteCard} ${isRevealed ? styles.revealed : ''}`}
                        onClick={() => !isRevealed && handleReveal(teamId, index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isRevealed) handleReveal(teamId, index);
                        }}
                      >
                        {!isRevealed ? (
                          <div className={styles.foldedFront}>
                            <span>쪽지 {index + 1}</span>
                            {showAuthor && (
                              <small>{note.authorTeamName ?? getTeamName(note.authorTeamId)}</small>
                            )}
                            {!showAuthor && <small>클릭하여 펼치기</small>}
                          </div>
                        ) : (
                          <div className={styles.unfolded}>
                            <p className={styles.noteText}>{note.text}</p>
                            {showAuthor && (
                              <span className={styles.author}>
                                — {note.authorTeamName ?? getTeamName(note.authorTeamId)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.redrawBtn}
            onClick={() => navigate(`/r/${roomId}/draw`)}
          >
            추첨 결과
          </button>
          <Link to={`/r/${roomId}`} className={styles.homeBtn}>
            메인으로
          </Link>
        </div>
      </div>
    </Layout>
  );
}
