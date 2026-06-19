import { supabase } from './supabase';

function mapSubmission(row) {
  return {
    id: row.id,
    teamId: row.team_id,
    text: row.text,
    createdAt: new Date(row.created_at).getTime(),
    drawnByTeam: row.drawn_by_team,
  };
}

export function generateRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i += 1) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export async function createRoom() {
  const roomId = generateRoomId();
  const { error } = await supabase.from('rooms').insert({ id: roomId });
  if (error) throw error;
  return roomId;
}

export async function ensureRoom(roomId) {
  const { data, error } = await supabase
    .from('rooms')
    .select('id')
    .eq('id', roomId)
    .maybeSingle();

  if (error) throw error;
  if (data) return true;

  const { error: insertError } = await supabase.from('rooms').insert({ id: roomId });
  if (insertError) throw insertError;
  return true;
}

export async function fetchRoomData(roomId) {
  const [roomRes, submissionsRes] = await Promise.all([
    supabase.from('rooms').select('*').eq('id', roomId).single(),
    supabase
      .from('submissions')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true }),
  ]);

  if (roomRes.error) throw roomRes.error;
  if (submissionsRes.error) throw submissionsRes.error;

  return {
    excludeOwnTeam: roomRes.data.exclude_own_team ?? false,
    drawResult: roomRes.data.draw_result ?? null,
    submissions: (submissionsRes.data ?? []).map(mapSubmission),
  };
}

export async function addSubmission(roomId, { teamId, text }) {
  const { data, error } = await supabase
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
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('room_id', roomId)
    .eq('id', submissionId);

  if (error) throw error;
}

export async function setExcludeOwnTeam(roomId, value) {
  const { error } = await supabase
    .from('rooms')
    .update({ exclude_own_team: value, updated_at: new Date().toISOString() })
    .eq('id', roomId);

  if (error) throw error;
}

export async function saveDrawResult(roomId, result) {
  const { error } = await supabase
    .from('rooms')
    .update({ draw_result: result, updated_at: new Date().toISOString() })
    .eq('id', roomId);

  if (error) throw error;
}

export async function clearRoom(roomId) {
  const { error: deleteError } = await supabase
    .from('submissions')
    .delete()
    .eq('room_id', roomId);

  if (deleteError) throw deleteError;

  const { error: updateError } = await supabase
    .from('rooms')
    .update({
      draw_result: null,
      exclude_own_team: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);

  if (updateError) throw updateError;
}

export function subscribeToRoom(roomId, onChange) {
  const channel = supabase
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
    supabase.removeChannel(channel);
  };
}
