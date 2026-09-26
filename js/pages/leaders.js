// ===== LEADERS PAGE =====
let timerInterval = null;

const PODIUM_C = { 1: '255,197,61', 2: '205,200,228', 3: '232,142,82' };

function _compactStars(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(2).replace('.', ',') + 'M';
  if (n >= 10000)   return Math.round(n / 1000) + 'K';
  return fmt(n);
}

function _renderLeadersList(leaders) {
  const podium = document.getElementById('lb-podium');
  const table = document.getElementById('lb-table');
  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);
  if (podium) podium.innerHTML = `
    ${renderTop3Item(top3[1], 2)}
    ${renderTop3Item(top3[0], 1)}
    ${renderTop3Item(top3[2], 3)}
  `;
  if (table) {
    table.innerHTML = rest.length
      ? `<div class="lb-head"><span>№ · Игрок</span><span>Баланс</span></div>${rest.map(renderLeaderItem).join('')}`
      : '';
    table.classList.toggle('hidden', !rest.length);
  }
}

let _leadersRefreshTimer = null;

async function renderLeadersPage() {
  const page = document.getElementById('page-leaders');

  page.innerHTML = `
    <div class="page-head">
      <h1>Лидеры</h1>
      <p>Топ-10 игроков по балансу звёзд</p>
    </div>
    <div class="podium" id="lb-podium"></div>
    <div class="lb-table" id="lb-table"><div class="empty" id="leaders-loading">Загрузка…</div></div>
  `;

  await _loadLeaders();

  if (_leadersRefreshTimer) clearInterval(_leadersRefreshTimer);
  _leadersRefreshTimer = setInterval(_loadLeaders, 30000);
}

async function _loadLeaders() {
  try {
    const data = await API.getLeaders();
    if (data && data.length) {
      _renderLeadersList(data);
    } else {
      const el = document.getElementById('leaders-loading');
      if (el) el.textContent = 'Пока никого нет';
    }
  } catch (e) {
    const el = document.getElementById('leaders-loading');
    if (el) el.textContent = 'Ошибка загрузки';
  }
}

function renderTop3Item(leader, rank) {
  if (!leader) return '<div class="podium-item" style="visibility:hidden"></div>';
  return `
    <div class="podium-item ${rank === 1 ? 'first' : ''}" style="--c:${PODIUM_C[rank]}">
      <div class="podium-rank">${rank}</div>
      <div class="podium-avatar">${avatarInner(leader.photo_url, leader.name)}</div>
      <div class="podium-name">${esc(leader.name)}</div>
      ${leader.username ? `<div class="podium-user">@${esc(leader.username)}</div>` : ''}
      <div class="podium-stars">${starImg(13)}${_compactStars(leader.stars)}</div>
    </div>
  `;
}

function renderLeaderItem(leader) {
  return `
    <div class="leader-item">
      <div class="leader-rank">${leader.rank}</div>
      <div class="leader-avatar">${avatarInner(leader.photo_url, leader.name)}</div>
      <div class="leader-info">
        <div class="leader-name">${esc(leader.name)}</div>
        ${leader.username ? `<div class="leader-user">@${esc(leader.username)}</div>` : ''}
      </div>
      <div class="leader-stars">${starImg(13)}${fmt(leader.stars)}</div>
    </div>
  `;
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  // Следующее воскресенье 00:00 UTC
  const now = new Date();
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + (7 - now.getUTCDay()));
  next.setUTCHours(0, 0, 0, 0);

  timerInterval = setInterval(() => {
    const diff = next - new Date();
    if (diff <= 0) { clearInterval(timerInterval); return; }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const d = document.getElementById('t-days');
    const h = document.getElementById('t-hours');
    const m = document.getElementById('t-mins');
    const s = document.getElementById('t-secs');
    if (d) d.textContent = days;
    if (h) h.textContent = hours;
    if (m) m.textContent = mins;
    if (s) s.textContent = secs;
  }, 1000);
}
