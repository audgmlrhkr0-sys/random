import {
  DRAW_COUNT_PER_TEAM,
  TEAM_COUNT,
  MIN_TOTAL_FOR_DRAW,
  MIN_SUBMISSIONS_PER_TEAM,
  EXCLUDE_OWN_TEAM_ALWAYS,
} from '../config';

export function fisherYatesShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRequiredSubmissionCount() {
  return MIN_TOTAL_FOR_DRAW;
}

export function canDraw(submissions) {
  if (submissions.length < MIN_TOTAL_FOR_DRAW) return false;
  for (let teamId = 1; teamId <= TEAM_COUNT; teamId += 1) {
    const count = submissions.filter((s) => s.teamId === teamId).length;
    if (count < MIN_SUBMISSIONS_PER_TEAM) return false;
  }
  return true;
}

function teamLabel(teamId, teamNames) {
  if (teamNames?.[teamId - 1]) return teamNames[teamId - 1];
  return `${teamId}팀`;
}

export function getDrawStatusMessage(submissions, teamNames = []) {
  const total = submissions.length;
  if (total < MIN_TOTAL_FOR_DRAW) {
    return `쪽지가 ${MIN_TOTAL_FOR_DRAW - total}개 더 필요해요! (전체 ${MIN_TOTAL_FOR_DRAW}개 이상)`;
  }
  for (let teamId = 1; teamId <= TEAM_COUNT; teamId += 1) {
    const count = submissions.filter((s) => s.teamId === teamId).length;
    if (count < MIN_SUBMISSIONS_PER_TEAM) {
      return `${teamLabel(teamId, teamNames)}이 ${MIN_SUBMISSIONS_PER_TEAM}개 미만이에요! (팀당 ${MIN_SUBMISSIONS_PER_TEAM}개 이상)`;
    }
  }
  return null;
}

export function getSubmissionShortage(submissions) {
  return canDraw(submissions) ? 0 : 1;
}

export function performDraw(allSubmissions, teamNames = []) {
  const excludeOwnTeam = EXCLUDE_OWN_TEAM_ALWAYS;

  if (!canDraw(allSubmissions)) {
    return {
      success: false,
      error: getDrawStatusMessage(allSubmissions, teamNames) || '추첨 조건을 확인해주세요.',
    };
  }

  let pool = fisherYatesShuffle(allSubmissions);
  const result = {};

  for (let teamId = 1; teamId <= TEAM_COUNT; teamId++) {
    const assigned = [];

    while (assigned.length < DRAW_COUNT_PER_TEAM) {
      if (pool.length === 0) {
        return {
          success: false,
          error: '추첨 풀이 부족합니다. 제출 수를 확인해주세요.',
        };
      }

      const candidate = pool.shift();

      if (excludeOwnTeam && candidate.teamId === teamId) {
        pool.push(candidate);
        if (!pool.some((item) => item.teamId !== teamId)) {
          return {
            success: false,
            error: `${teamLabel(teamId, teamNames)}에게 배정할 다른 팀의 쪽지가 부족합니다.`,
          };
        }
        continue;
      }

      assigned.push({
        id: candidate.id,
        text: candidate.text,
        authorTeamId: candidate.teamId,
        authorTeamName: teamLabel(candidate.teamId, teamNames),
      });
    }

    result[teamId] = assigned;
  }

  return { success: true, result };
}
