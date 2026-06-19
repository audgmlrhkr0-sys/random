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
  const [saveStatus, setSaveStatus] = useState('');
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
        ? '데이터를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.'
        : '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
      setError(msg);
    }
  }, [roomId]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError('데이터를 불러올 수 없습니다. 잠시 후 다시 시도해 주세요.');
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

  const updateAllTeamNames = useCallback(
    async (names) => {
      const next = names.map((n, i) =>
        (n?.trim() || DEFAULT_TEAM_NAMES[i] || `${i + 1}팀`)
      );
      setTeamNames(next);
      setSaveStatus('saving');
      try {
        await apiUpdateTeamNames(roomId, next);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
        await reload();
      } catch (err) {
        setSaveStatus('error');
        console.error(err.message || '팀 이름 저장 실패');
      }
    },
    [roomId, reload]
  );

  const updateTeamName = useCallback(
    (index, name) => updateAllTeamNames(
      teamNames.map((n, i) => (i === index ? name : n))
    ),
    [teamNames, updateAllTeamNames]
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
    updateAllTeamNames,
    saveStatus,
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
