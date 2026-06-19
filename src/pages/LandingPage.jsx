import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { isSupabaseConfigured } from '../utils/supabase';
import { createRoom } from '../utils/roomApi';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          <h1 className={styles.title}>감상법 제비뽑기</h1>
          <div className={styles.setupBox}>
            <h2>Supabase 설정이 필요합니다</h2>
            <p>
              여러 기기가 하나의 링크로 함께 쓰려면 Supabase를 연결해야 합니다.
            </p>
            <ol>
              <li>
                <a href="https://supabase.com" target="_blank" rel="noreferrer">
                  supabase.com
                </a>
                에서 무료 프로젝트 생성
              </li>
              <li>
                SQL Editor에서 <code>supabase/schema.sql</code> 실행
              </li>
              <li>
                Table Editor에서 <strong>rooms</strong>, <strong>submissions</strong> 테이블
                Realtime 활성화
              </li>
              <li>
                프로젝트 Settings → API에서 URL과 anon key 복사
              </li>
              <li>
                <code>.env.example</code>을 <code>.env</code>로 복사 후 값 입력
              </li>
              <li>
                <code>npm run dev</code> 재시작
              </li>
            </ol>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <h1 className={styles.title}>감상법 제비뽑기</h1>
        <p className={styles.subtitle}>
          하나의 링크로 팀원들과 함께 감상법을 모으고 추첨하세요
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
