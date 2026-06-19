import { useState } from 'react';
import styles from './WriteModal.module.css';
import { MIN_SUBMISSIONS_HINT } from '../config';

export default function WriteModal({ isOpen, onClose, onSubmit, teamName }) {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('writing'); // writing | folding | sent
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    setPhase('folding');

    setTimeout(() => {
      setPhase('sent');
    }, 700);

    setTimeout(async () => {
      try {
        await onSubmit(text);
        setText('');
        setPhase('writing');
        onClose();
      } finally {
        setSubmitting(false);
      }
    }, 2200);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && phase === 'writing') {
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        {phase === 'writing' && (
          <>
            <h2 className={styles.title}>{teamName} — 감상법 작성</h2>
            <p className={styles.guide}>팀당 {MIN_SUBMISSIONS_HINT}개 이상 쪽지를 작성해주세요</p>
            <p className={styles.textareaHint}>한 쪽지에는 감상법을 하나만 적어주세요</p>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="예) 색감에 집중하며 천천히 둘러보기"
              rows={6}
              autoFocus
            />
            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                취소
              </button>
              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={!text.trim()}
              >
                제출하기
              </button>
            </div>
          </>
        )}

        {(phase === 'folding' || phase === 'sent') && (
          <div className={styles.animationArea}>
            <div
              className={`${styles.foldingPaper} ${phase === 'folding' ? styles.folding : ''} ${phase === 'sent' ? styles.folded : ''}`}
            >
              <p className={styles.previewText}>{text}</p>
            </div>
            {phase === 'sent' && (
              <p className={styles.sentText}>전송완료</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
