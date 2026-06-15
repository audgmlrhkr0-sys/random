import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { TEAM_NAMES, SHOW_AUTHOR_TEAM, TEAM_COUNT } from '../config';
import { getDrawResult } from '../utils/storage';
import styles from './ResultPage.module.css';

export default function ResultPage() {
  const navigate = useNavigate();
  const result = getDrawResult();
  const [showAuthor, setShowAuthor] = useState(SHOW_AUTHOR_TEAM);
  const [revealedCards, setRevealedCards] = useState({});

  if (!result) {
    return (
      <Layout showBack backTo="/">
        <div className={styles.empty}>
          <p>아직 추첨 결과가 없습니다.</p>
          <Link to="/draw" className={styles.linkBtn}>
            추첨하러 가기
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
    <Layout showBack backTo="/">
      <div className={styles.container}>
        <h1 className={styles.title}>추첨 결과</h1>

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
            const teamName = TEAM_NAMES[i] ?? `${teamId}팀`;
            const notes = result[teamId] ?? [];

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
                            <small>클릭하여 펼치기</small>
                          </div>
                        ) : (
                          <div className={styles.unfolded}>
                            <p className={styles.noteText}>{note.text}</p>
                            {showAuthor && note.authorTeamId && (
                              <span className={styles.author}>
                                — {TEAM_NAMES[note.authorTeamId - 1] ?? `${note.authorTeamId}팀`}
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
            onClick={() => navigate('/draw')}
          >
            다시 추첨
          </button>
          <Link to="/" className={styles.homeBtn}>
            메인으로
          </Link>
        </div>
      </div>
    </Layout>
  );
}
