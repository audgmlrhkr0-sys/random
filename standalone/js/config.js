var TEAM_NAMES = ['1팀', '2팀', '3팀', '4팀', '5팀'];
var TEAM_COUNT = 5;
var DRAW_COUNT_PER_TEAM = 3;
var SHOW_AUTHOR_TEAM = false;
var MIN_SUBMISSIONS_HINT = 3;

var STORAGE_KEYS = {
  submissions: 'appreciation_submissions',
  drawResult: 'appreciation_draw_result',
  excludeOwnTeam: 'appreciation_exclude_own_team',
};

function getExcludeOwnTeam() {
  try {
    var v = localStorage.getItem(STORAGE_KEYS.excludeOwnTeam);
    if (v === null) return false;
    return v === 'true';
  } catch (e) {
    return false;
  }
}

function setExcludeOwnTeam(value) {
  localStorage.setItem(STORAGE_KEYS.excludeOwnTeam, value ? 'true' : 'false');
}
