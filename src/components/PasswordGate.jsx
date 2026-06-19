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
    setError('비밀번호가 틀렸어요! 다시 입력해 보세요');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <h1 className={styles.title}>비밀번호 입력</h1>
        <p className={styles.desc}>선생님이 알려준 숫자를 입력하세요</p>
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
            들어가기
          </button>
        </form>
      </div>
    </div>
  );
}
