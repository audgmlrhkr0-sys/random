export const DEFAULT_TEAM_NAMES = ['1팀', '2팀', '3팀', '4팀', '5팀'];
export const TEAM_NAMES = DEFAULT_TEAM_NAMES;
export const TEAM_COUNT = 5;
export const DRAW_COUNT_PER_TEAM = 2;
export const MIN_SUBMISSIONS_HINT = 2;
export const MIN_SUBMISSIONS_PER_TEAM = 2;
export const MIN_TOTAL_FOR_DRAW = 10;
export const EXCLUDE_OWN_TEAM_ALWAYS = true;
export const SHOW_AUTHOR_TEAM = false;
export const ROOM_PASSWORD = '9650';
export const DRAW_PASSWORD = '0000';
export const DEFAULT_ROOM_ID = 'gamsang';

export const STORAGE_KEYS = {
  submissions: 'appreciation_submissions',
  drawResult: 'appreciation_draw_result',
  excludeOwnTeam: 'appreciation_exclude_own_team',
};

export function getRoomUnlockKey(roomId) {
  return `room_unlock_${roomId}`;
}

export function getDrawUnlockKey(roomId) {
  return `draw_unlock_${roomId}`;
}

export function getExcludeOwnTeam() {
  return EXCLUDE_OWN_TEAM_ALWAYS;
}

export function setExcludeOwnTeam() {
  /* 항상 자기 팀 제외 */
}
