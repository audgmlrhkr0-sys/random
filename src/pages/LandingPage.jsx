import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { createRoom } from '../utils/roomApi';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const roomId = await createRoom();
      navigate(`/r/${roomId}`);
    } catch {
      setError('방을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const code = joinCode.trim().toLowerCase();
    if (!code) return;
    navigate(`/r/${code}`);
  };

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>감상법 제비뽑기</h1>
        <p className={styles.subtitle}>
          함께 다양한 감상법을 모으고 따라해 보세요!
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="button"
          className={styles.createBtn}
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? '방 만드는 중...' : '새 활동 시작하기'}
        </button>

        <div className={styles.divider}>또는</div>

        <form className={styles.joinForm} onSubmit={handleJoin}>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="방 코드 입력 (예: abc123)"
            maxLength={12}
            className={styles.joinInput}
          />
          <button type="submit" className={styles.joinBtn} disabled={!joinCode.trim()}>
            참여하기
          </button>
        </form>
      </div>
    </Layout>
  );
}
