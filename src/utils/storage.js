import { STORAGE_KEYS } from './config';

export function getSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.submissions);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSubmissions(submissions) {
  localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions));
}

export function deleteSubmission(id) {
  saveSubmissions(getSubmissions().filter((s) => s.id !== id));
}

export function addSubmission({ teamId, text }) {
  const submissions = getSubmissions();
  const entry = {
    id: crypto.randomUUID(),
    teamId: Number(teamId),
    text: text.trim(),
    createdAt: Date.now(),
    drawnByTeam: null,
  };
  submissions.push(entry);
  saveSubmissions(submissions);
  return entry;
}

export function getDrawResult() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.drawResult);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDrawResult(result) {
  localStorage.setItem(STORAGE_KEYS.drawResult, JSON.stringify(result));
}

export function updateSubmissionsDrawn(submissions) {
  saveSubmissions(submissions);
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.submissions);
  localStorage.removeItem(STORAGE_KEYS.drawResult);
}

export function getTeamSubmissionCount(teamId) {
  return getSubmissions().filter((s) => s.teamId === Number(teamId)).length;
}

export function getTeamSubmissions(teamId) {
  return getSubmissions().filter((s) => s.teamId === Number(teamId));
}
