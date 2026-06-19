import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { isSupabaseConfigured } from '../utils/supabase';
import {
  ensureRoom,
  fetchRoomData,
  addSubmission as apiAddSubmission,
  deleteSubmission as apiDeleteSubmission,
  setExcludeOwnTeam as apiSetExcludeOwnTeam,
  saveDrawResult as apiSaveDrawResult,
  clearRoom as apiClearRoom,
  subscribeToRoom,
} from '../utils/roomApi';

const RoomContext = createContext(null);

export function RoomProvider() {
  const { roomId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [drawResult, setDrawResult] = useState(null);
  const [excludeOwnTeam, setExcludeOwnTeamState] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!roomId || !isSupabaseConfigured) return;
    try {
      const data = await fetchRoomData(roomId);
      setSubmissions(data.submissions);
      setDrawResult(data.drawResult);
      setExcludeOwnTeamState(data.excludeOwnTeam);
      setError('');
    } catch (err) {
      setError(err.message || '데이터를 불러오지 못했습니다.');
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

  const value = {
    roomId,
    submissions,
    drawResult,
    excludeOwnTeam,
    loading,
    error,
    addSubmission,
    deleteSubmission,
    setExcludeOwnTeam,
    saveDrawResult,
    clearAllData,
    getTeamSubmissions: (teamId) =>
      submissions.filter((s) => s.teamId === Number(teamId)),
  };

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
