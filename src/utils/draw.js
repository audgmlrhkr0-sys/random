import {
  DRAW_COUNT_PER_TEAM,
  TEAM_COUNT,
  getExcludeOwnTeam,
} from '../config';
import { getSubmissions, saveDrawResult, saveSubmissions } from './storage';

export function fisherYatesShuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getRequiredSubmissionCount() {
  return TEAM_COUNT * DRAW_COUNT_PER_TEAM;
}

export function canDraw() {
  const submissions = getSubmissions();
  return submissions.length >= getRequiredSubmissionCount();
}

export function getSubmissionShortage() {
  const required = getRequiredSubmissionCount();
  const current = getSubmissions().length;
  return Math.max(0, required - current);
}

export function performDraw() {
  const allSubmissions = getSubmissions();
  const required = getRequiredSubmissionCount();

  if (allSubmissions.length < required) {
    return {
      success: false,
      error: `전체 쪽지가 부족합니다. ${required}개 이상 필요하며, 현재 ${allSubmissions.length}개입니다.`,
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

      if (getExcludeOwnTeam() && candidate.teamId === teamId) {
        pool.push(candidate);
        if (!pool.some((item) => item.teamId !== teamId)) {
          return {
            success: false,
            error: `${teamId}팀에게 배정할 다른 팀의 쪽지가 부족합니다.`,
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

  return { success: true, result };
}
