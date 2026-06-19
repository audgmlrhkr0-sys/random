import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import PasswordGate from '../components/PasswordGate';
import { DEFAULT_TEAM_NAMES, getRoomUnlockKey } from '../config';
import { isSupabaseConfigured } from '../utils/supabase';
import {
  ensureRoom,
  fetchRoomData,
  addSubmission as apiAddSubmission,
  deleteSubmission as apiDeleteSubmission,
  setExcludeOwnTeam as apiSetExcludeOwnTeam,
  saveDrawResult as apiSaveDrawResult,
  clearRoom as apiClearRoom,
  updateTeamNames as apiUpdateTeamNames,
  subscribeToRoom,
} from '../utils/roomApi';

const RoomContext = createContext(null);

export function RoomProvider() {
  const { roomId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [drawResult, setDrawResult] = useState(null);
  const [teamNames, setTeamNames] = useState([...DEFAULT_TEAM_NAMES]);
  const [excludeOwnTeam, setExcludeOwnTeamState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem(getRoomUnlockKey(roomId)) === '1'
  );

  const reload = useCallback(async () => {
    if (!roomId || !isSupabaseConfigured) return;
    try {
      const data = await fetchRoomData(roomId);
      setSubmissions(data.submissions);
      setDrawResult(data.drawResult);
      setTeamNames(data.teamNames);
      setExcludeOwnTeamState(data.excludeOwnTeam);
      setError('');
    } catch (err) {
      const msg = err.code === 'PGRST205'
        ? 'Supabase에 rooms/submissions 테이블이 없습니다. SQL Editor에서 supabase/schema.sql을 실행해주세요.'
        : err.message || '데이터를 불러오지 못했습니다.';
      setError(msg);
    }
  }, [roomId]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError('Supabase 설정이 필요합니다.');
      return undefined;
    }

    let active = true;

    (async () => {
      try {
        await ensureRoom(roomId);
        if (active) await reload();
      } catch (err) {
        if (active) setError(err.message || '방을 불러오지 못했습니다.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    const unsubscribe = subscribeToRoom(roomId, () => {
      reload();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [roomId, reload]);

  const handleUnlock = useCallback(() => {
    sessionStorage.setItem(getRoomUnlockKey(roomId), '1');
    setUnlocked(true);
  }, [roomId]);

  const addSubmission = useCallback(
    async ({ teamId, text }) => {
      await apiAddSubmission(roomId, { teamId, text });
      await reload();
    },
    [roomId, reload]
  );

  const deleteSubmission = useCallback(
    async (submissionId) => {
      await apiDeleteSubmission(roomId, submissionId);
      await reload();
    },
    [roomId, reload]
  );

  const setExcludeOwnTeam = useCallback(
    async (value) => {
      setExcludeOwnTeamState(value);
      await apiSetExcludeOwnTeam(roomId, value);
    },
    [roomId]
  );

  const saveDrawResult = useCallback(
    async (result) => {
      await apiSaveDrawResult(roomId, result);
      await reload();
    },
    [roomId, reload]
  );

  const clearAllData = useCallback(async () => {
    await apiClearRoom(roomId);
    await reload();
  }, [roomId, reload]);

  const updateTeamName = useCallback(
    async (index, name) => {
      const trimmed = name.trim() || DEFAULT_TEAM_NAMES[index] || `${index + 1}팀`;
      const next = [...teamNames];
      next[index] = trimmed;
      setTeamNames(next);
      await apiUpdateTeamNames(roomId, next);
    },
    [roomId, teamNames]
  );

  const getTeamName = useCallback(
    (teamId) => teamNames[Number(teamId) - 1] ?? `${teamId}팀`,
    [teamNames]
  );

  const value = {
    roomId,
    submissions,
    drawResult,
    teamNames,
    excludeOwnTeam,
    loading,
    error,
    addSubmission,
    deleteSubmission,
    setExcludeOwnTeam,
    saveDrawResult,
    clearAllData,
    updateTeamName,
    getTeamName,
    getTeamSubmissions: (teamId) =>
      submissions.filter((s) => s.teamId === Number(teamId)),
  };

  if (loading) {
    return (
      <Layout>
        <p style={{ color: 'var(--cyber-text-dim)', padding: '3rem' }}>불러오는 중...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <p style={{ color: 'var(--cyber-danger)', padding: '3rem' }}>{error}</p>
      </Layout>
    );
  }

  if (!unlocked) {
    return (
      <Layout>
        <PasswordGate onUnlock={handleUnlock} />
      </Layout>
    );
  }

  return (
    <RoomContext.Provider value={value}>
      <Outlet />
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const ctx = useContext(RoomContext);
  if (!ctx) {
    throw new Error('useRoom must be used within RoomProvider');
  }
  return ctx;
}
