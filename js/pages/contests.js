// ===== CONTESTS PAGE =====
// Конкурсы создаёт админ: рейтинг по сумме ставок или пополнений за период,
// в срок бот сам начисляет призы победителям.
let _contestsRefreshTimer = null;
let _contestsTickTimer = null;

const CT_PLACE_C = { 1: '255,197,61', 2: '205,200,228', 3: '232,142,82' };
const CT_DEFAULT_C = '139,92,246';

function _ctPlaceC(place) { return CT_PLACE_C[place] || CT_DEFAULT_C; }

function _ctCountdown(seconds) {
  const s = Math.max(0, seconds);
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

async function renderContestsPage() {
  const page = document.getElementById('page-contests');
  page.innerHTML = `
    <div class="page-head">
      <h1>Конкурсы</h1>
      <p>Набирай больше всех за время конкурса — призы придут звёздами на баланс</p>
    </div>
    <div id="contests-list"><div class="empty">Загрузка…</div></div>
  `;
  await _loadContests();
  if (_contestsRefreshTimer) clearInterval(_contestsRefreshTimer);
  _contestsRefreshTimer = setInterval(_loadContests, 30000);
}

async function _loadContests() {
  const list = document.getElementById('contests-list');
  if (!list) { clearInterval(_contestsRefreshTimer); clearInterval(_contestsTickTimer); return; }
  const data = await API.getContests();
  if (!data || data.__error) {
    list.innerHTML = `<div class="empty">Не удалось загрузить конкурсы</div>`;
    return;
  }
  if (!data.length) {
    list.innerHTML = `
      <div class="card">
        <div class="empty-big">
          <svg class="empty-ico"><use href="#i-trophy"/></svg>
          <h3>Скоро</h3>
          <p>Конкурсов пока нет. Следите за обновлениями!</p>
        </div>
      </div>`;
    return;
  }
  const now = Date.now();
  list.innerHTML = data.map(c => c.status === 'active' ? _ctActiveHtml(c, now) : _ctFinishedHtml(c)).join('');
  if (_contestsTickTimer) clearInterval(_contestsTickTimer);
  _contestsTickTimer = setInterval(_ctTick, 1000);
}

function _ctTick() {
  const els = document.querySelectorAll('.ct-timer[data-end]');
  if (!els.length) { clearInterval(_contestsTickTimer); return; }
  els.forEach(el => {
    const left = Math.round((+el.dataset.end - Date.now()) / 1000);
    const t = _ctCountdown(left);
    for (const k of ['d', 'h', 'm', 's']) {
      const b = el.querySelector(`[data-u="${k}"]`);
      if (b) b.textContent = String(t[k]).padStart(k === 'd' ? 1 : 2, '0');
    }
    if (left <= 0) { el.removeAttribute('data-end'); setTimeout(_loadContests, 3000); }
  });
}

function _ctPrizesHtml(prizes) {
  return `
    <div class="ct-prizes">
      ${prizes.map((p, i) => `
        <div class="ct-prize" style="--c:${_ctPlaceC(i + 1)}">
          <small>${i + 1} место</small>
          <b>${starImg(14)}${fmt(p)}</b>
        </div>`).join('')}
    </div>`;
}

function _ctRowHtml(r, prize) {
  return `
    <div class="leader-item">
      <div class="leader-rank" style="color:rgb(${_ctPlaceC(r.place)})">${r.place}</div>
      <div class="leader-avatar">${avatarInner(r.photo_url, r.name)}</div>
      <div class="leader-info">
        <div class="leader-name">${esc(r.name)}${r.user_id == window.appState?.id ? ' <span class="pvp-me-tag">ты</span>' : ''}</div>
        <div class="leader-user">${prize ? `приз ${starImg(12)}${fmt(prize)}` : (r.username ? '@' + esc(r.username) : '&nbsp;')}</div>
      </div>
      <div class="leader-stars">${starImg(13)}${fmt(r.amount)}</div>
    </div>`;
}

function _ctActiveHtml(c, now) {
  const t = _ctCountdown(c.seconds_left);
  const me = c.me || { amount: 0, place: null };
  const need = Math.max(0, c.min_amount - me.amount);
  const pct = c.min_amount ? Math.min(100, (me.amount / c.min_amount) * 100) : 100;
  const what = c.metric === 'deposits' ? 'пополнений' : 'ставок';

  let meHtml;
  if (me.place) {
    const prize = c.prizes[me.place - 1];
    meHtml = `
      <div class="ct-me-row"><span>Ты на ${me.place} месте</span><b>${starImg(14)}${fmt(me.amount)}</b></div>
      <p>${prize ? `Сейчас это приз ${starImg(12)}${fmt(prize)} — держи позицию до конца!` : 'Чтобы попасть в призы, обгони игроков выше.'}</p>`;
  } else {
    meHtml = `
      <div class="ct-me-row"><span>Твой прогресс</span><b>${starImg(14)}${fmt(me.amount)} / ${fmt(c.min_amount)}</b></div>
      <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
      <p>Ещё ${starImg(12)}${fmt(need)} ${what} — и ты в рейтинге</p>`;
  }

  const top = c.top || [];
  return `
    <div class="card ct-card">
      <div class="ct-top">
        <div>
          <div class="card-title">${esc(c.title)}</div>
          <div class="card-sub">${esc(c.metric_label)} · в рейтинге от ${starImg(13)}${fmt(c.min_amount)}</div>
        </div>
        <span class="pill pill-online">идёт</span>
      </div>
      <div class="ct-timer" data-end="${now + c.seconds_left * 1000}">
        <div><b data-u="d">${t.d}</b><span>дн</span></div>
        <div><b data-u="h">${String(t.h).padStart(2, '0')}</b><span>ч</span></div>
        <div><b data-u="m">${String(t.m).padStart(2, '0')}</b><span>мин</span></div>
        <div><b data-u="s">${String(t.s).padStart(2, '0')}</b><span>сек</span></div>
      </div>
      ${_ctPrizesHtml(c.prizes)}
      <div class="ct-me">${meHtml}</div>
      <div class="lb-head ct-head"><span>№ · Игрок</span><span>Сумма ${what}</span></div>
      ${top.length
        ? top.map(r => _ctRowHtml(r, c.prizes[r.place - 1])).join('')
        : `<div class="empty" style="padding:14px">Пока никто не набрал ${starImg(13)}${fmt(c.min_amount)}. Будь первым!</div>`}
    </div>`;
}

function _ctFinishedHtml(c) {
  const winners = c.winners || [];
  return `
    <div class="card">
      <div class="ct-top">
        <div>
          <div class="card-title">${esc(c.title)}</div>
          <div class="card-sub">${esc(c.metric_label)} · итоги</div>
        </div>
        <span class="pill pill-soft">завершён</span>
      </div>
      <div class="lb-head ct-head"><span>Победители</span><span>Сумма</span></div>
      ${winners.length
        ? winners.map(w => _ctRowHtml(w, w.prize)).join('')
        : `<div class="empty" style="padding:14px">Никто не набрал порог — призы не разыграны</div>`}
    </div>`;
}
