import { useState } from 'react';
import { ROOM_PASSWORD } from '../config';
import styles from './PasswordGate.module.css';

export default function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ROOM_PASSWORD) {
      onUnlock();
      return;
    }
    setError('비밀번호가 틀렸습니다');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <p className={styles.tag}>&gt; ACCESS_GATE</p>
        <h1 className={styles.title}>입장 코드</h1>
        <p className={styles.desc}>공유받은 링크 · 비밀번호 입력 후 입장</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            inputMode="numeric"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="••••"
            className={styles.input}
            autoFocus
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn}>
            입장 →
          </button>
        </form>
      </div>
    </div>
  );
}
