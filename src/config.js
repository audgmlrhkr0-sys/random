export const DEFAULT_TEAM_NAMES = ['1팀', '2팀', '3팀', '4팀', '5팀'];
export const TEAM_NAMES = DEFAULT_TEAM_NAMES;
export const TEAM_COUNT = 5;
export const DRAW_COUNT_PER_TEAM = 3;
export const SHOW_AUTHOR_TEAM = false;
export const MIN_SUBMISSIONS_HINT = 3;
export const ROOM_PASSWORD = '9650';

export const STORAGE_KEYS = {
  submissions: 'appreciation_submissions',
  drawResult: 'appreciation_draw_result',
  excludeOwnTeam: 'appreciation_exclude_own_team',
};

export function getExcludeOwnTeam() {
  try {
    const v = localStorage.getItem(STORAGE_KEYS.excludeOwnTeam);
    if (v === null) return false;
    return v === 'true';
  } catch {
    return false;
  }
}

export function setExcludeOwnTeam(value) {
  localStorage.setItem(STORAGE_KEYS.excludeOwnTeam, value ? 'true' : 'false');
}

export function getRoomUnlockKey(roomId) {
  return `room_unlock_${roomId}`;
}
