function getSubmissions() {
  try {
    var raw = localStorage.getItem(STORAGE_KEYS.submissions);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveSubmissions(submissions) {
  localStorage.setItem(STORAGE_KEYS.submissions, JSON.stringify(submissions));
}

function addSubmission(data) {
  var submissions = getSubmissions();
  var id = String(Date.now()) + '-' + Math.random().toString(36).slice(2);
  if (window.crypto && crypto.randomUUID) {
    id = crypto.randomUUID();
  }
  var entry = {
    id: id,
    teamId: Number(data.teamId),
    text: data.text.trim(),
    createdAt: Date.now(),
    drawnByTeam: null,
  };
  submissions.push(entry);
  saveSubmissions(submissions);
  return entry;
}

function deleteSubmission(id) {
  var submissions = getSubmissions().filter(function (s) {
    return s.id !== id;
  });
  saveSubmissions(submissions);
}

function getTeamSubmissions(teamId) {
  return getSubmissions().filter(function (s) {
    return s.teamId === Number(teamId);
  });
}

function getDrawResult() {
  try {
    var raw = localStorage.getItem(STORAGE_KEYS.drawResult);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveDrawResult(result) {
  localStorage.setItem(STORAGE_KEYS.drawResult, JSON.stringify(result));
}

function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.submissions);
  localStorage.removeItem(STORAGE_KEYS.drawResult);
}

function getTeamSubmissionCount(teamId) {
  return getTeamSubmissions(teamId).length;
}
