import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { isSupabaseConfigured } from '../utils/supabase';
import { checkConnection, createRoom } from '../utils/roomApi';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connStatus, setConnStatus] = useState('checking'); // checking | ok | fail

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    checkConnection().then((result) => {
      setConnStatus(result.ok ? 'ok' : 'fail');
      if (!result.ok) setError(result.message);
    });
  }, []);

  const handleCreate = async () => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    setError('');
    try {
      const roomId = await createRoom();
      navigate(`/r/${roomId}`);
    } catch (err) {
      const msg = err.code === 'PGRST205'
        ? 'Supabase에 rooms/submissions 테이블이 없습니다. SQL Editor에서 supabase/schema.sql을 실행해주세요.'
        : err.message || '방을 만들지 못했습니다.';
      setError(msg);
      setConnStatus('fail');
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

  if (!isSupabaseConfigured) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={`${styles.connBox} ${styles.connFail}`}>
            ❌ .env 파일이 없어요
          </div>
          <h1 className={styles.title}>감상법 제비뽑기</h1>
          <div className={styles.setupBox}>
            <h2>Supabase 설정이 필요합니다</h2>
            <p>프로젝트 폴더에 .env 파일을 만들고 npm run dev 로 실행하세요.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        {connStatus === 'checking' && (
          <div className={`${styles.connBox} ${styles.connChecking}`}>연결 확인 중...</div>
        )}
        {connStatus === 'ok' && (
          <div className={`${styles.connBox} ${styles.connOk}`}>✅ Supabase 연결됨</div>
        )}
        {connStatus === 'fail' && (
          <div className={`${styles.connBox} ${styles.connFail}`}>
            ❌ Supabase 연결 안 됨
            <span className={styles.connHint}>npm run dev 로 실행했는지 확인</span>
          </div>
        )}

        <h1 className={styles.title}>감상법 제비뽑기</h1>
        <p className={styles.subtitle}>
          하나의 링크로 팀원들과 함께 감상법을 모으고 추첨하세요
        </p>

        {error && connStatus === 'fail' && <p className={styles.error}>{error}</p>}

        <button
          type="button"
          className={styles.createBtn}
          onClick={handleCreate}
          disabled={loading || connStatus !== 'ok'}
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
