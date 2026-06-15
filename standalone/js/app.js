var app;

function navigate(path) {
  location.hash = path;
}

function getRoute() {
  var hash = location.hash.slice(1) || '/';
  if (hash.indexOf('/team/') === 0) {
    return { page: 'team', teamId: Number(hash.split('/')[2]) };
  }
  if (hash === '/draw') return { page: 'draw' };
  if (hash === '/result') return { page: 'result' };
  return { page: 'main' };
}

function layout(content, showBack, backTo) {
  var back = showBack
    ? '<a href="#" class="back-link" data-nav="' + backTo + '">← 메인으로</a>'
    : '';
  return '<div class="layout">' + back + '<main class="main">' + content + '</main></div>';
}

function renderMain() {
  var teams = TEAM_NAMES.map(function (name, i) {
    return (
      '<a href="#" class="team-btn" data-nav="/team/' + (i + 1) + '">' +
      '<span class="num">' + (i + 1) + '</span><span>' + name + '</span></a>'
    );
  }).join('');

  app.innerHTML = layout(
    '<div class="page-main">' +
    '<h1 class="page-title">감상법 제비뽑기</h1>' +
    '<p class="page-subtitle">팀별로 감상법을 작성하고, 추첨으로 다른 팀의 감상법을 받아보세요</p>' +
    '<div class="team-grid">' + teams + '</div>' +
    '<a href="#" class="draw-link-fixed" data-nav="/draw">추첨하러 가기 →</a>' +
    '</div>',
    false
  );
}

function renderTeam(teamId) {
  var teamIndex = teamId - 1;
  if (teamIndex < 0 || teamIndex >= TEAM_NAMES.length) {
    navigate('/');
    return;
  }

  var teamName = TEAM_NAMES[teamIndex];
  var count = getTeamSubmissionCount(teamId);
  var submissions = getTeamSubmissions(teamId);
  var needsMore = count < MIN_SUBMISSIONS_HINT;
  var folded = '';

  for (var i = 0; i < count; i++) {
    var rot = -5 + (i % 3) * 5;
    var off = i * 6;
    folded += '<div class="folded-note" style="transform:translateX(' + off + 'px) rotate(' + rot + 'deg);z-index:' + i + '"></div>';
  }

  var submittedList = '';
  if (submissions.length === 0) {
    submittedList = '<p class="submitted-empty">아직 쪽지가 없어요!<br>메모지를 눌러 작성해보세요 ✏️</p>';
  } else {
    submittedList = submissions.map(function (s, idx) {
      var preview = s.text.length > 60 ? s.text.slice(0, 60) + '…' : s.text;
      return (
        '<div class="submitted-item">' +
        '<p class="submitted-text"><strong>쪽지 ' + (idx + 1) + '</strong> ' + escapeHtml(preview) + '</p>' +
        '<button type="button" class="btn-delete" data-delete-id="' + s.id + '">삭제</button>' +
        '</div>'
      );
    }).join('');
  }

  app.innerHTML = layout(
    '<div class="team-header"><h1>' + teamName + '</h1>' +
    '<p class="team-count">제출한 감상법: <strong>' + count + '개</strong>' +
    (needsMore ? '<span class="team-hint"> (최소 ' + MIN_SUBMISSIONS_HINT + '개 이상 작성해주세요)</span>' : '') +
    '</p></div>' +
    '<div class="workspace">' +
    '<div class="memo-area">' +
    '<button type="button" class="memo-pad" id="open-modal">' +
    '<div class="memo-lines"><span></span><span></span><span></span><span></span></div>' +
    '<span class="memo-hint">클릭하여 작성</span></button>' +
    '<div class="pencil" aria-hidden="true"><div class="pencil-eraser"></div>' +
    '<div class="pencil-body"></div><div class="pencil-tip"></div></div>' +
    '<div class="folded-stack">' + folded + '</div></div>' +
    '<div class="submitted-panel"><h3>📝 내가 쓴 쪽지</h3>' + submittedList + '</div>' +
    '</div>' +
    '<div id="modal-root"></div>',
    true,
    '/'
  );

  document.getElementById('open-modal').onclick = function () {
    openWriteModal(teamId, teamName);
  };

  var deleteBtns = document.querySelectorAll('[data-delete-id]');
  for (var d = 0; d < deleteBtns.length; d++) {
    deleteBtns[d].onclick = function () {
      var id = this.getAttribute('data-delete-id');
      if (confirm('이 쪽지를 삭제할까요?')) {
        deleteSubmission(id);
        renderTeam(teamId);
        bindNavLinks();
      }
    };
  }
}

function openWriteModal(teamId, teamName) {
  var root = document.getElementById('modal-root');
  root.innerHTML =
    '<div class="modal-backdrop" id="modal-backdrop"><div class="modal" id="modal-inner">' +
    '<h2>' + teamName + ' — 감상법 작성</h2>' +
    '<p class="modal-guide">최소 3개 이상 작성해주세요</p>' +
    '<textarea id="memo-text" rows="6" placeholder="이 작품을 어떻게 감상하면 좋을지 적어주세요."></textarea>' +
    '<div class="modal-actions">' +
    '<button type="button" class="btn-cancel" id="modal-cancel">취소</button>' +
    '<button type="button" class="btn-submit" id="modal-submit" disabled>제출하기</button>' +
    '</div></div></div>';

  var textarea = document.getElementById('memo-text');
  var submitBtn = document.getElementById('modal-submit');
  var backdrop = document.getElementById('modal-backdrop');
  var inner = document.getElementById('modal-inner');

  textarea.focus();
  textarea.oninput = function () {
    submitBtn.disabled = !textarea.value.trim();
  };

  document.getElementById('modal-cancel').onclick = function () {
    root.innerHTML = '';
  };
  backdrop.onclick = function (e) {
    if (e.target === backdrop) root.innerHTML = '';
  };

  submitBtn.onclick = function () {
    var text = textarea.value.trim();
    if (!text) return;

    inner.innerHTML =
      '<div class="fold-anim-area"><div class="fold-paper" id="fold-paper"><p>' +
      escapeHtml(text) +
      '</p></div><p class="sent-text" id="sent-text" style="display:none">전송완료</p></div>';

    var paper = document.getElementById('fold-paper');
    setTimeout(function () {
      paper.className += ' folding';
    }, 50);

    setTimeout(function () {
      paper.className += ' folded';
      document.getElementById('sent-text').style.display = 'block';
    }, 700);

    setTimeout(function () {
      addSubmission({ teamId: teamId, text: text });
      root.innerHTML = '';
      renderTeam(teamId);
      bindNavLinks();
    }, 2200);
  };
}

function renderDraw() {
  var submissions = getSubmissions();
  var required = getRequiredSubmissionCount();
  var shortage = getSubmissionShortage();
  var canDraw = shortage === 0;
  var poolNotes = submissions.slice(0, 20).map(function (s) {
    return '<div class="pool-note">' + s.teamId + '팀</div>';
  }).join('');

  var excludeOwn = getExcludeOwnTeam();

  app.innerHTML = layout(
    '<div class="draw-page"><h1 class="draw-title">추첨</h1>' +
    '<p class="draw-subtitle">진행자 전용 화면</p>' +
    '<div class="stats">' +
    '<div class="stat-card"><span class="label">전체 제출</span><span class="value">' + submissions.length + '개</span></div>' +
    '<div class="stat-card"><span class="label">필요 수량</span><span class="value">' + required + '개</span></div>' +
    '<div class="stat-card"><span class="label">팀당 배정</span><span class="value">' + DRAW_COUNT_PER_TEAM + '개</span></div>' +
    '</div>' +
    (!canDraw ? '<div class="warning-box">⚠ 쪽지가 ' + shortage + '개 부족해요! (5팀 × 3개 = 15개 필요)</div>' : '') +
    '<div id="draw-error"></div>' +
    '<div class="pool" id="pool">' + (poolNotes || '<p style="color:var(--ink-light)">아직 제출된 쪽지가 없어요</p>') + '</div>' +
    '<label class="option-toggle' + (excludeOwn ? ' active' : '') + '" id="exclude-toggle">' +
    '<input type="checkbox" id="exclude-checkbox"' + (excludeOwn ? ' checked' : '') + ' />' +
    '자기 팀 쪽지 제외하기</label><br>' +
    '<button type="button" class="btn-draw" id="btn-draw"' + (canDraw ? '' : ' disabled') + '>추첨하기 🎲</button>' +
    '<div class="reset-section"><button type="button" class="btn-reset" id="btn-reset">데이터 초기화</button>' +
    '<p class="reset-hint">제출한 쪽지와 추첨 결과가 <strong>모두 삭제</strong>됩니다.<br>다음 회차 시작 전에만 눌러주세요.</p></div></div>',
    true,
    '/'
  );

  document.getElementById('exclude-checkbox').onchange = function (e) {
    setExcludeOwnTeam(e.target.checked);
    var toggle = document.getElementById('exclude-toggle');
    if (e.target.checked) toggle.className = 'option-toggle active';
    else toggle.className = 'option-toggle';
  };

  document.getElementById('exclude-toggle').onclick = function (e) {
    if (e.target.tagName !== 'INPUT') {
      var cb = document.getElementById('exclude-checkbox');
      cb.checked = !cb.checked;
      setExcludeOwnTeam(cb.checked);
      this.className = cb.checked ? 'option-toggle active' : 'option-toggle';
    }
  };

  document.getElementById('btn-draw').onclick = function () {
    var pool = document.getElementById('pool');
    var err = document.getElementById('draw-error');
    err.innerHTML = '';
    pool.className += ' shuffling';
    document.getElementById('btn-draw').disabled = true;
    document.getElementById('btn-draw').textContent = '추첨 중...';

    setTimeout(function () {
      var drawResult = performDraw();
      pool.className = pool.className.replace(' shuffling', '');
      if (!drawResult.success) {
        err.innerHTML = '<div class="error-box">' + drawResult.error + '</div>';
        document.getElementById('btn-draw').disabled = !canDraw;
        document.getElementById('btn-draw').textContent = '추첨하기';
        return;
      }
      navigate('/result');
    }, 1500);
  };

  document.getElementById('btn-reset').onclick = function () {
    if (confirm('제출한 모든 쪽지와 추첨 결과를 삭제할까요?\n\n삭제하면 되돌릴 수 없어요!')) {
      clearAllData();
      renderDraw();
      bindNavLinks();
    }
  };
}

function renderResult() {
  var result = getDrawResult();
  if (!result) {
    app.innerHTML = layout(
      '<div style="text-align:center;padding:4rem">' +
      '<p style="margin-bottom:1.5rem;color:var(--color-ink-light)">아직 추첨 결과가 없습니다.</p>' +
      '<a href="#" class="btn-primary" data-nav="/draw">추첨하러 가기</a></div>',
      true,
      '/'
    );
    return;
  }

  var showAuthor = SHOW_AUTHOR_TEAM;
  var sections = '';

  for (var i = 0; i < TEAM_COUNT; i++) {
    var teamId = i + 1;
    var notes = result[teamId] || [];
    var cards = notes.map(function (note, idx) {
      return (
        '<div class="note-card" data-reveal="' + teamId + '-' + idx + '">' +
        '<div class="note-folded"><span>쪽지 ' + (idx + 1) + '</span>' +
        '<small style="font-size:0.75rem;color:var(--color-ink-light)">클릭하여 펼치기</small></div></div>'
      );
    }).join('');

    sections += '<section class="result-section"><h2>' + TEAM_NAMES[i] + '</h2>' + cards + '</section>';
  }

  app.innerHTML = layout(
    '<h1 class="draw-title" style="text-align:center">추첨 결과</h1>' +
    '<label class="toggle-label"><input type="checkbox" id="show-author"' + (showAuthor ? ' checked' : '') + '> 작성 팀 표시</label>' +
    '<div class="result-grid">' + sections + '</div>' +
    '<div class="result-actions">' +
    '<a href="#" class="btn-primary" data-nav="/draw">다시 추첨</a>' +
    '<a href="#" class="btn-dark" data-nav="/">메인으로</a></div>',
    true,
    '/'
  );

  document.getElementById('show-author').onchange = function (e) {
    showAuthor = e.target.checked;
    var authors = document.querySelectorAll('.note-author');
    for (var a = 0; a < authors.length; a++) {
      authors[a].style.display = showAuthor ? 'block' : 'none';
    }
  };

  var cards = document.querySelectorAll('[data-reveal]');
  for (var c = 0; c < cards.length; c++) {
    (function (card) {
      card.onclick = function () {
        if (card.getAttribute('data-revealed')) return;
        var parts = card.getAttribute('data-reveal').split('-');
        var tId = Number(parts[0]);
        var idx = Number(parts[1]);
        var note = result[tId][idx];
        card.setAttribute('data-revealed', '1');
        card.innerHTML =
          '<div class="note-unfolded"><p>' + escapeHtml(note.text) + '</p>' +
          (note.authorTeamId
            ? '<span class="note-author" style="display:' + (showAuthor ? 'block' : 'none') + '">— ' + TEAM_NAMES[note.authorTeamId - 1] + '</span>'
            : '') +
          '</div>';
      };
    })(cards[c]);
  }
}

function escapeHtml(str) {
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function bindNavLinks() {
  var links = document.querySelectorAll('[data-nav]');
  for (var i = 0; i < links.length; i++) {
    links[i].onclick = function (e) {
      e.preventDefault();
      navigate(this.getAttribute('data-nav'));
    };
  }
}

function render() {
  var route = getRoute();
  if (route.page === 'team') renderTeam(route.teamId);
  else if (route.page === 'draw') renderDraw();
  else if (route.page === 'result') renderResult();
  else renderMain();
  bindNavLinks();
}

function boot() {
  try {
    app = document.getElementById('app');
    if (!app) return;
    if (!location.hash) location.hash = '/';
    render();
    window.addEventListener('hashchange', render);
  } catch (e) {
    if (app) {
      app.innerHTML = '<div style="padding:2rem;text-align:center"><h2>오류</h2><p>' + e.message + '</p></div>';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
