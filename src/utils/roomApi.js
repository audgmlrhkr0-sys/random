import { supabase } from './supabase';
import { DEFAULT_TEAM_NAMES } from '../config';

function requireClient() {
  if (!supabase) {
    throw new Error('SERVICE_UNAVAILABLE');
  }
  return supabase;
}

function mapSubmission(row) {
  return {
    id: row.id,
    teamId: row.team_id,
    text: row.text,
    createdAt: new Date(row.created_at).getTime(),
    drawnByTeam: row.drawn_by_team,
  };
}

function parseTeamNames(raw) {
  if (Array.isArray(raw) && raw.length > 0) return raw;
  return [...DEFAULT_TEAM_NAMES];
}

export function generateRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function checkConnection() {
  const client = requireClient();
  const { error } = await client.from('rooms').select('id').limit(1);
  if (error) {
    return { ok: false, message: '연결할 수 없습니다. 잠시 후 다시 시도해 주세요.' };
  }
  return { ok: true, message: '연결됨' };
}

export async function createRoom() {
  const client = requireClient();
  const roomId = generateRoomId();
  const { error } = await client.from('rooms').insert({
    id: roomId,
    team_names: DEFAULT_TEAM_NAMES,
  });
  if (error) throw error;
  return roomId;
}

export async function ensureRoom(roomId) {
  const client = requireClient();
  const { data, error } = await client
    .from('rooms')
    .select('id')
    .eq('id', roomId)
    .maybeSingle();

  if (error) throw error;
  if (data) return true;

  const { error: insertError } = await client.from('rooms').insert({
    id: roomId,
    team_names: DEFAULT_TEAM_NAMES,
  });
  if (insertError) throw insertError;
  return true;
}

export async function fetchRoomData(roomId) {
  const client = requireClient();
  const [roomRes, submissionsRes] = await Promise.all([
    client.from('rooms').select('*').eq('id', roomId).single(),
    client
      .from('submissions')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true }),
  ]);

  if (roomRes.error) {
    if (roomRes.error.code === 'PGRST116') {
      return {
        excludeOwnTeam: false,
        drawResult: null,
        teamNames: [...DEFAULT_TEAM_NAMES],
        submissions: (submissionsRes.data ?? []).map(mapSubmission),
      };
    }
    throw roomRes.error;
  }
  if (submissionsRes.error) throw submissionsRes.error;

  return {
    excludeOwnTeam: roomRes.data.exclude_own_team ?? false,
    drawResult: roomRes.data.draw_result ?? null,
    teamNames: parseTeamNames(roomRes.data.team_names),
    submissions: (submissionsRes.data ?? []).map(mapSubmission),
  };
}

export async function updateTeamNames(roomId, teamNames) {
  const client = requireClient();
  const { data, error } = await client
    .from('rooms')
    .update({ team_names: teamNames, updated_at: new Date().toISOString() })
    .eq('id', roomId)
    .select('team_names')
    .single();

  if (error) {
    throw new Error('팀 이름을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
  return data?.team_names;
}

export async function addSubmission(roomId, { teamId, text }) {
  const client = requireClient();
  const { data, error } = await client
    .from('submissions')
    .insert({
      room_id: roomId,
      team_id: Number(teamId),
      text: text.trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return mapSubmission(data);
}

export async function deleteSubmission(roomId, submissionId) {
  const client = requireClient();
  const { error } = await client
    .from('submissions')
    .delete()
    .eq('room_id', roomId)
    .eq('id', submissionId);

  if (error) throw error;
}

export async function setExcludeOwnTeam(roomId, value) {
  const client = requireClient();
  const { error } = await client
    .from('rooms')
    .update({ exclude_own_team: value, updated_at: new Date().toISOString() })
    .eq('id', roomId);

  if (error) throw error;
}

export async function saveDrawResult(roomId, result) {
  const client = requireClient();
  const { error } = await client
    .from('rooms')
    .update({ draw_result: result, updated_at: new Date().toISOString() })
    .eq('id', roomId);

  if (error) throw error;
}

export async function clearRoom(roomId) {
  const client = requireClient();
  const { error: deleteError } = await client
    .from('submissions')
    .delete()
    .eq('room_id', roomId);

  if (deleteError) throw deleteError;

  const { error: updateError } = await client
    .from('rooms')
    .update({
      draw_result: null,
      exclude_own_team: false,
      team_names: DEFAULT_TEAM_NAMES,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  if (updateError) throw updateError;
}

export function subscribeToRoom(roomId, onChange) {
  const client = requireClient();
  const channel = client
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'submissions', filter: `room_id=eq.${roomId}` },
      onChange
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
      onChange
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
