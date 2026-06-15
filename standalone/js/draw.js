function fisherYatesShuffle(array) {
  var arr = array.slice();
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function getRequiredSubmissionCount() {
  return TEAM_COUNT * DRAW_COUNT_PER_TEAM;
}

function getSubmissionShortage() {
  return Math.max(0, getRequiredSubmissionCount() - getSubmissions().length);
}

function performDraw() {
  var allSubmissions = getSubmissions();
  var required = getRequiredSubmissionCount();

  if (allSubmissions.length < required) {
    return {
      success: false,
      error: '전체 쪽지가 부족합니다. ' + required + '개 이상 필요하며, 현재 ' + allSubmissions.length + '개입니다.',
    };
  }

  var pool = fisherYatesShuffle(allSubmissions);
  var result = {};
  var teamId, assigned, candidate, t;

  for (teamId = 1; teamId <= TEAM_COUNT; teamId++) {
    assigned = [];

    while (assigned.length < DRAW_COUNT_PER_TEAM) {
      if (pool.length === 0) {
        return { success: false, error: '추첨 풀이 부족합니다.' };
      }

      candidate = pool.shift();

      if (getExcludeOwnTeam() && candidate.teamId === teamId) {
        pool.push(candidate);
        var hasOther = false;
        for (t = 0; t < pool.length; t++) {
          if (pool[t].teamId !== teamId) {
            hasOther = true;
            break;
          }
        }
        if (!hasOther) {
          return {
            success: false,
            error: teamId + '팀에게 배정할 다른 팀의 쪽지가 부족합니다.',
          };
        }
        continue;
      }

      assigned.push({
        id: candidate.id,
        text: candidate.text,
        authorTeamId: candidate.teamId,
      });
      candidate.drawnByTeam = teamId;
    }

    result[teamId] = assigned;
  }

  saveSubmissions(allSubmissions);
  saveDrawResult(result);
  return { success: true, result: result };
}
