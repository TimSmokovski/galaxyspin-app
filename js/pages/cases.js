// ===== CASES PAGE =====
const ITEMS = [
  { emoji: '🎒', name: 'Рюкзак', stars: 500, rarity: 'common' },
  { emoji: '👾', name: 'Пришелец', stars: 2814, rarity: 'rare' },
  { emoji: '🧞', name: 'Джинн', stars: 5009, rarity: 'epic' },
  { emoji: '🌿', name: 'Листок', stars: 2404, rarity: 'rare' },
  { emoji: '🧪', name: 'Зелье', stars: 1361, rarity: 'rare' },
  { emoji: '🐻', name: 'Мишка', stars: 4653, rarity: 'epic' },
  { emoji: '🎃', name: 'Тыква', stars: 1257, rarity: 'uncommon' },
  { emoji: '🦊', name: 'Лиса', stars: 800, rarity: 'common' },
  { emoji: '🐉', name: 'Дракон', stars: 9999, rarity: 'legendary' },
  { emoji: '💎', name: 'Алмаз', stars: 7500, rarity: 'legendary' },
  { emoji: '🌊', name: 'Волна', stars: 600, rarity: 'common' },
  { emoji: '⚡', name: 'Молния', stars: 950, rarity: 'uncommon' },
];

const LIVE_WINS = [
  { user: 'Алекс', emoji: '🐉', stars: 9999 },
  { user: 'Мария', emoji: '🧞', stars: 5009 },
  { user: 'Иван', emoji: '💎', stars: 7500 },
  { user: 'Дима', emoji: '🐻', stars: 4653 },
  { user: 'Соня', emoji: '👾', stars: 2814 },
  { user: 'Коля', emoji: '🌿', stars: 2404 },
  { user: 'Оля', emoji: '⚡', stars: 950 },
];

function _rouletteStar(size) { return starImg(size); }
function _goldStar(size = 18) { return starImg(size); }

// ===== LIVE BAR =====
let liveItems = []; // новые сверху

function _liveTier(stars) {
  if (stars >= 5000) return '255,197,61';
  if (stars >= 1000) return '224,75,255';
  if (stars >= 500)  return '139,92,246';
  if (stars >= 200)  return '34,211,238';
  return '96,165,250';
}

function _shortNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',') + 'M';
  if (n >= 100000)  return Math.round(n / 1000) + 'K';
  return fmt(n);
}

function _liveKey(w) { return w.emoji + w.stars + w.name; }

async function initLiveBar() {
  const wins = await API.recentWins();
  if (wins && wins.length) liveItems = wins.slice(0, 15);
  renderLiveBar();
  setInterval(pollLiveBar, 6000);
}

async function pollLiveBar() {
  const wins = await API.recentWins();
  if (!wins || !wins.length) return;
  const topKey = liveItems.length ? _liveKey(liveItems[0]) : '';
  if (_liveKey(wins[0]) === topKey) return;

  const cutIdx = wins.findIndex(w => _liveKey(w) === topKey);
  const fresh = cutIdx === -1 ? wins.slice(0, 15) : wins.slice(0, cutIdx);
  if (!fresh.length) return;
  liveItems = [...fresh, ...liveItems].slice(0, 15);
  renderLiveBar(fresh.length);
}

function renderLiveBar(freshCount = 0) {
  const bar = document.getElementById('live-bar-items');
  if (!bar) return;
  if (!liveItems.length) {
    bar.innerHTML = '<span class="live-empty">Здесь появятся крупные выигрыши</span>';
    return;
  }
  bar.innerHTML = liveItems.map((w, i) => `
    <div class="live-item ${i < freshCount ? 'fresh' : ''}" style="--c:${_liveTier(w.stars)}" title="${esc(w.name)}">
      ${starImg(22)}<span>${_shortNum(w.stars)}</span>
    </div>`).join('');
}

// ===== HOME =====
const MODES = [
  { name: 'PvP',     desc: 'Сразись с другими за банк',     icon: 'i-pvp',    c: '255,138,61', open: 'openPvp()',      online: true },
  { name: 'Рулетка', desc: 'Умножай звёзды до ×10',          icon: 'i-wheel',  c: '124,92,255', open: 'openRoulette()' },
  { name: 'Краш',    desc: 'Забери до взрыва ракеты',        icon: 'i-rocket', c: '255,77,109', open: 'openCrash()',    online: true },
  { name: 'Слоты',   desc: 'Три в ряд — до ×50',             icon: 'i-slots',  c: '255,176,32', open: 'openSlots()' },
  { name: 'Сапёр',   desc: 'Открывай клетки, обходи мины',   icon: 'i-bomb',   c: '34,211,238', open: 'openMiner()' },
];

function renderCasesPage() {
  const page = document.getElementById('page-cases');
  page.innerHTML = `
    <div class="live">
      <div class="live-tag">LIVE</div>
      <div class="live-track"><div class="live-row" id="live-bar-items"></div></div>
    </div>

    <div class="hero" onclick="openFreeCase()">
      <div class="beam"></div>
      <div class="hero-floor"></div>
      <svg class="hero-gift"><use href="#i-gift"/></svg>
      <svg class="spark" style="right:150px;top:34px;animation-delay:.3s"><use href="#i-spark"/></svg>
      <svg class="spark" style="right:30px;top:60px;width:9px;height:9px;animation-delay:1.1s"><use href="#i-spark"/></svg>
      <svg class="spark" style="right:128px;top:128px;width:8px;height:8px;animation-delay:1.8s"><use href="#i-spark"/></svg>
      <div class="hero-bonus hidden" id="hero-bonus"></div>
      <div class="hero-text">
        <div class="eyebrow">КАЖДЫЙ ДЕНЬ</div>
        <h2>Бесплатный<br>кейс</h2>
        <p>До ${starImg(14)} 100 — раз в 24 часа</p>
        <button class="btn btn-gold">Открыть <span style="font-size:16px">→</span></button>
      </div>
    </div>

    <div class="sec"><h3>Режимы</h3></div>
    <div class="modes">
      ${MODES.map(m => `
        <div class="mode-card" style="--c:${m.c}" onclick="${m.open}">
          <svg class="mode-ico"><use href="#${m.icon}"/></svg>
          <div class="mode-info">
            <div class="mode-name">${m.name}</div>
            <div class="mode-desc">${m.desc}</div>
          </div>
          <div class="mode-side">${m.online ? '<span class="pill pill-online">Онлайн</span>' : '<span class="chev">›</span>'}</div>
        </div>`).join('')}
    </div>
  `;
  renderLiveBar();
  updateHeroBonus();
}

// ===== REEL (бесплатный кейс и рулетка) =====
const REEL_COPIES = 4;

function _reelHtml(trackId, cardsHtml) {
  return `
    <div class="reel">
      <div class="reel-win">
        <div class="reel-pointer top"></div><div class="reel-pointer bot"></div>
        <div class="reel-fade l"></div><div class="reel-fade r"></div>
        <div class="reel-track" id="${trackId}">${cardsHtml}</div>
      </div>
    </div>`;
}

// Длина одного повтора ленты в пикселях — берём из вёрстки, а не из констант
function _reelPeriod(track, n) {
  return track.children[n].offsetLeft - track.children[0].offsetLeft;
}

function _startReelIdle(track, n) {
  if (!track || track.children.length <= n) return;
  const period = _reelPeriod(track, n);
  track.style.transition = 'none';
  track.style.transform = '';
  track.style.setProperty('--drift', `-${period}px`);
  track.style.setProperty('--drift-t', `${Math.round(period / 60)}s`);
  track.classList.add('idle');
  track.closest('.reel')?.classList.remove('done');
}

function _reelCurrentX(track) {
  const t = getComputedStyle(track).transform;
  return t && t !== 'none' ? -new DOMMatrixReadOnly(t).m41 : 0;
}

// Смещение, при котором карточка idx стоит ровно под указателем
function _reelTargetX(track, idx) {
  const card = track.children[idx];
  return card.offsetLeft + card.offsetWidth / 2 - track.parentElement.clientWidth / 2;
}

// Прокрутить ленту так, чтобы под указателем оказалась карточка winIdx (индекс в одном повторе)
function _spinReel(track, n, winIdx, ms) {
  const reel = track.closest('.reel');
  reel.classList.remove('done');
  track.querySelectorAll('.hit').forEach(el => el.classList.remove('hit'));

  // Останавливаем «дрейф» на текущем месте и сдвигаем на целое число повторов назад — визуально без скачка
  const period = _reelPeriod(track, n);
  let x = _reelCurrentX(track) % period;
  track.classList.remove('idle');
  track.style.transition = 'none';
  track.style.transform = `translateX(${-x}px)`;
  void track.offsetWidth;

  // Выбираем повтор, до которого лента проедет хотя бы почти полный круг
  let idx = n + winIdx;
  if (_reelTargetX(track, idx) - x < period * 0.9) idx += n;
  const target = _reelTargetX(track, idx);

  track.style.transition = `transform ${ms}ms cubic-bezier(0.08, 0.82, 0.25, 1)`;
  track.style.transform = `translateX(${-target}px)`;

  // Результат показываем, когда лента реально остановилась; таймер — запасной вариант
  return new Promise(resolve => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      track.removeEventListener('transitionend', onEnd);
      track.children[idx]?.classList.add('hit');
      reel.classList.add('done');
      resolve();
    };
    const onEnd = (e) => { if (e.target === track && e.propertyName === 'transform') finish(); };
    track.addEventListener('transitionend', onEnd);
    setTimeout(finish, ms + 400);
  });
}

function _multLabel(m) { return '×' + String(m).replace('.', ','); }

// ===== PvP =====
const PVP_COLORS = ['#8b5cf6','#ff8a3d','#22d3ee','#fb4f72','#ffc53d','#34d399','#e04bff','#60a5fa','#f472b6','#a3e635'];

let pvpBetInput = 100;
let pvpRefreshTimer = null;
let pvpTickTimer = null;
let pvpLocalTimeLeft = null;
let _pvpBetMode = null; // 'new' | 'more' — секция ставки перерисовывается только при смене режима
let _pvpWatch = null;   // {round, players, mine} — раунд, который сейчас на экране

async function openPvp() {
  _pvpBetMode = null;
  _pvpWatch = null;
  showModal(`
    ${sheetHead('PvP', 'Больше ставка — выше шанс забрать банк')}
    <div id="pvp-lobby-content">
      <div id="pvp-live"><div class="empty">Загрузка…</div></div>
      <div id="pvp-bet"></div>
    </div>
  `);
  await pvpRefreshLobby();
  // API синхронизация каждые 5 сек
  pvpRefreshTimer = setInterval(pvpRefreshLobby, 5000);
  // Локальный тик каждую секунду
  pvpTickTimer = setInterval(pvpTick, 1000);
}

function pvpTick() {
  if (pvpLocalTimeLeft === null) return;
  pvpLocalTimeLeft = Math.max(0, pvpLocalTimeLeft - 1);
  const urgent = pvpLocalTimeLeft < 10;
  const valEl = document.querySelector('.pvp-timer-val');
  const fillEl = document.querySelector('.pvp-timer-fill');
  const timerEl = document.querySelector('.pvp-timer');
  const centerEl = document.getElementById('pvp-wheel-center');
  const centerVal = document.getElementById('pvp-center-val');
  if (valEl) valEl.textContent = pvpFormatTime(pvpLocalTimeLeft);
  if (fillEl) fillEl.style.width = `${(pvpLocalTimeLeft / 20) * 100}%`;
  if (centerVal) centerVal.textContent = pvpLocalTimeLeft;
  timerEl?.classList.toggle('urgent', urgent);
  centerEl?.classList.toggle('urgent', urgent);
}

function pvpFormatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function buildPvpWheel(players, timeLeft, playerCount) {
  let gradientParts = [];
  let cumulative = 0;
  if (players && players.length > 0) {
    players.forEach((p, i) => {
      const color = PVP_COLORS[i % PVP_COLORS.length];
      const end = Math.min(100, cumulative + parseFloat(p.chance));
      gradientParts.push(`${color} ${cumulative.toFixed(2)}% ${end.toFixed(2)}%`);
      cumulative = end;
    });
    if (cumulative < 99.9) {
      gradientParts.push(`rgba(255,255,255,0.06) ${cumulative.toFixed(2)}% 100%`);
    }
  }
  const style = gradientParts.length ? ` style="background:conic-gradient(from -90deg, ${gradientParts.join(', ')})"` : '';
  const hasTimer = timeLeft !== null && timeLeft !== undefined;
  const center = hasTimer
    ? `<b id="pvp-center-val">${timeLeft}</b><span>секунд</span>`
    : `<b>${playerCount ? '…' : '0'}</b><span>${playerCount ? 'ждём игрока' : 'нет ставок'}</span>`;
  return `
    <div class="pvp-arena">
      <div class="pvp-wheel-wrap">
        <div class="pvp-pointer"></div>
        <div class="pvp-wheel${gradientParts.length ? '' : ' pvp-wheel-empty'}"${style}></div>
        <div class="pvp-wheel-center ${hasTimer && timeLeft < 10 ? 'urgent' : ''}" id="pvp-wheel-center">${center}</div>
      </div>
    </div>`;
}

async function pvpRefreshLobby() {
  const lobby = await API.pvpLobby();
  const live = document.getElementById('pvp-live');
  if (!live) { clearInterval(pvpRefreshTimer); clearInterval(pvpTickTimer); return; }

  if (!lobby) {
    live.innerHTML = `<div class="empty">Ошибка соединения</div>`;
    return;
  }

  const myId = window.appState?.id;

  // Раунд на экране закончился: его разыграл этот запрос, сервер или другой игрок
  const last = lobby.auto_resolved
    || (_pvpWatch && lobby.round_id !== _pvpWatch.round && lobby.last_result?.round_id === _pvpWatch.round
        ? lobby.last_result : null);
  if (last && last.status !== 'refunded' && (lobby.auto_resolved || _pvpWatch.players >= 2)) {
    clearInterval(pvpRefreshTimer);
    clearInterval(pvpTickTimer);
    const iWon = last.winner_id == myId;
    if (iWon && window.appState) {
      window.appState.balance = (window.appState.balance || 0) + last.total_pot;
      updateBalance();
    }
    hideModal();
    showPvpWin(last, iWon);
    return;
  }
  if (last && last.status === 'refunded' && last.user_id == myId && _pvpWatch?.mine) {
    if (window.appState) window.appState.balance = (window.appState.balance || 0) + last.total_pot;
    updateBalance();
    showToast('Соперник не нашёлся — ставка вернулась на баланс');
  }

  const iAlreadyBet = lobby.players.some(p => p.user_id == myId);
  const playerCount = lobby.player_count || lobby.players.length;
  _pvpWatch = { round: lobby.round_id, players: playerCount, mine: iAlreadyBet };

  // Синхронизируем локальный таймер
  if (lobby.time_left !== null && lobby.time_left !== undefined) {
    pvpLocalTimeLeft = lobby.time_left;
  } else {
    pvpLocalTimeLeft = null;
  }
  const timeLeft = pvpLocalTimeLeft;

  // Статус таймера
  let timerHtml = '';
  if (timeLeft !== null && timeLeft !== undefined) {
    const pct = (timeLeft / 20) * 100;
    timerHtml = `
      <div class="pvp-timer ${timeLeft < 10 ? 'urgent' : ''}">
        <div class="pvp-timer-bar"><div class="pvp-timer-fill" style="width:${pct}%"></div></div>
        <div class="pvp-timer-label"><span>до розыгрыша</span><span class="pvp-timer-val">${pvpFormatTime(timeLeft)}</span></div>
      </div>`;
  } else if (playerCount < 2) {
    timerHtml = `<div class="pvp-waiting">Ждём второго игрока — розыгрыш начнётся автоматически</div>`;
  }

  live.innerHTML = `
    ${buildPvpWheel(lobby.players, timeLeft, playerCount)}

    <div class="pvp-bank-row">
      <div class="pvp-bank"><small>Банк</small>${starImg(18)}${fmt(lobby.total_pot)}</div>
      <span class="pill pill-soft pill-lg">${playerCount} / ${lobby.max_players || 10} игроков</span>
    </div>

    ${timerHtml}

    <div class="pvp-players">
      <div class="pvp-players-head"><span>Игроки</span><span>Ставка · шанс</span></div>
      ${playerCount === 0
        ? `<div class="empty" style="padding:14px">Пока никого нет. Будь первым!</div>`
        : lobby.players.map((p, i) => {
            const color = PVP_COLORS[i % PVP_COLORS.length];
            const me = p.user_id == myId;
            return `
              <div class="pvp-player-row ${me ? 'me' : ''}" style="--player-color:${color}">
                ${p.photo_url
                  ? `<img class="pvp-room-avatar" src="${esc(p.photo_url)}" alt="">`
                  : `<div class="pvp-room-avatar" style="background:${color}33;color:${color}">${esc(p.avatar)}</div>`}
                <div class="pvp-player-info">
                  <div class="pvp-room-name">${esc(p.name)}${me ? ' <span class="pvp-me-tag">ты</span>' : ''}</div>
                  <div class="pvp-chance-bar-wrap"><div class="pvp-chance-bar" style="width:${p.chance}%;background:${color}"></div></div>
                </div>
                <div class="pvp-player-right">
                  <div class="pvp-room-bet">${starImg(14)}${fmt(p.amount)}</div>
                  <div class="pvp-chance-label" style="color:${color}">${p.chance}%</div>
                </div>
              </div>`;
          }).join('')}
    </div>
  `;

  // Секцию ставки не перерисовываем каждые 5 сек — иначе сбивается ввод суммы
  const mode = iAlreadyBet ? 'more' : 'new';
  if (mode !== _pvpBetMode) {
    _pvpBetMode = mode;
    const bet = document.getElementById('pvp-bet');
    if (bet) bet.innerHTML = `
      ${iAlreadyBet ? `<div class="pvp-in-game">${svgIcon('i-check')} Ты в игре — можно докинуть звёзд</div>` : ''}
      <span class="label">${iAlreadyBet ? 'Докинуть звёзд' : 'Твоя ставка'}</span>
      <input class="input" id="pvp-bet-input" type="number" min="10"
        value="${pvpBetInput}" placeholder="Сумма" oninput="pvpBetInput=+this.value">
      <div class="chips chips-sm" style="margin-top:8px">
        ${[50,100,250,500,1000].map(b => `<button class="chip" data-pbet="${b}" onclick="pvpSetBet(${b})">${starImg(13)}${b}</button>`).join('')}
      </div>
      <div class="sheet-foot">
        <button class="btn btn-primary btn-xl btn-block" onclick="doPvpBet()"><span class="btn-t">${iAlreadyBet ? 'Докинуть' : 'Поставить'}</span></button>
      </div>`;
  }
}

function pvpSetBet(val) {
  pvpBetInput = val;
  const input = document.getElementById('pvp-bet-input');
  if (input) input.value = val;
  document.querySelectorAll('.chip[data-pbet]').forEach(c => c.classList.toggle('on', +c.dataset.pbet === val));
}

async function doPvpBet() {
  const amount = parseInt(document.getElementById('pvp-bet-input')?.value) || pvpBetInput;
  if (amount < 10) { showToast('Минимум 10 звёзд'); return; }
  const starsError = realStarsError(amount, 'в PvP');
  if (starsError) { showToast(starsError); return; }
  const res = await API.pvpBet(amount);
  await doPvpBetCheck(res);
}

async function doPvpBetCheck(res) {
  if (!res || res.__error) { showToast(res?.detail || 'Ошибка соединения'); return; }
  if (res.auto_resolved) {
    clearInterval(pvpRefreshTimer);
    const r = res.auto_resolved;
    hideModal();
    const iWon = r.winner_id == window.appState?.id;
    showPvpWin(r, iWon);
    return;
  }
  if (window.appState) window.appState.balance = res.new_balance;
  updateBalance();
  showToast('Ставка принята!');
  await pvpRefreshLobby();
}

// ===== БЕСПЛАТНЫЙ КЕЙС =====
const FREE_ITEMS = [
  { stars: 0,   label: '✕',      rarity: 'common',   color: '#e74c3c' },
  { stars: 5,   label: '⭐ 5',   rarity: 'common' },
  { stars: 10,  label: '⭐ 10',  rarity: 'common' },
  { stars: 15,  label: '⭐ 15',  rarity: 'common' },
  { stars: 20,  label: '⭐ 20',  rarity: 'common' },
  { stars: 30,  label: '⭐ 30',  rarity: 'uncommon' },
  { stars: 40,  label: '⭐ 40',  rarity: 'uncommon' },
  { stars: 50,  label: '⭐ 50',  rarity: 'uncommon' },
  { stars: 75,  label: '⭐ 75',  rarity: 'rare' },
  { stars: 90,  label: '⭐ 90',  rarity: 'rare' },
  { stars: 100, label: '⭐ 100', rarity: 'epic' },
];
const RARITY_C = { common: '96,165,250', uncommon: '139,92,246', rare: '224,75,255', epic: '255,197,61' };
const RARITY_LABEL = { common: 'обычный', uncommon: 'необычный', rare: 'редкий', epic: 'эпический' };
const LOSS_C = '120,112,140';

function _freeCardHtml(item) {
  const lose = item.stars === 0;
  return `
    <div class="rcard ${lose ? 'lose' : ''}" style="--c:${lose ? LOSS_C : RARITY_C[item.rarity]}">
      <span class="rc-mult">${lose ? 'пусто' : RARITY_LABEL[item.rarity]}</span>
      ${starImg(50)}
      <span class="rc-amt">${item.stars}</span>
    </div>`;
}

function openFreeCase() {
  const cards = Array.from({ length: REEL_COPIES }, () => FREE_ITEMS.map(_freeCardHtml).join('')).join('');
  showModal(`
    ${sheetHead('Бесплатный кейс', 'Раз в 24 часа — бесплатно')}
    ${_reelHtml('spin-track', cards)}
    <div class="result" id="spin-result"><span class="result-chip idle">Выпадет от 0 до 100 звёзд</span></div>
    <div class="sheet-foot">
      <button class="btn btn-gold btn-xl btn-block" id="btn-spin" onclick="doFreeSpin()"><span class="btn-t">Открыть бесплатно</span></button>
    </div>
  `);
  _startReelIdle(document.getElementById('spin-track'), FREE_ITEMS.length);
}

// Бонусные кейсы за пополнение — отметка на карточке бесплатного кейса
function updateHeroBonus() {
  const el = document.getElementById('hero-bonus');
  if (!el) return;
  const n = window.appState?.bonus_cases || 0;
  el.classList.toggle('hidden', n <= 0);
  el.innerHTML = n > 0 ? `${svgIcon('i-gift')}+${n} бонусный` : '';
}

async function doFreeSpin() {
  const btn = document.getElementById('btn-spin');
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-t">Открываем…</span>';

  const res = await API.openCase('free');

  if (!res || res.__error) {
    btn.disabled = false;
    btn.innerHTML = '<span class="btn-t">Открыть бесплатно</span>';
    showToast(res?.detail || 'Ошибка соединения');
    return;
  }

  // Находим предмет в списке для анимации по stars
  const winItem = FREE_ITEMS.find(i => i.stars === res.item?.stars) || FREE_ITEMS[0];
  const winIdx = FREE_ITEMS.indexOf(winItem);

  const track = document.getElementById('spin-track');
  if (track) await _spinReel(track, FREE_ITEMS.length, winIdx, 3600);

  const resultEl = document.getElementById('spin-result');
  if (resultEl) {
    resultEl.innerHTML = winItem.stars > 0
      ? `<span class="result-chip">${starImg(18)}+${winItem.stars} звёзд</span>`
      : `<span class="result-chip lose">Пусто — повезёт завтра</span>`;
  }
  if (btn.isConnected) {
    // Остался бонусный кейс за пополнение — его можно открыть сразу
    if ((res.bonus_cases || 0) > 0) {
      btn.disabled = false;
      btn.innerHTML = `<span class="btn-t">Открыть бонусный · ${res.bonus_cases}</span>`;
    } else {
      btn.innerHTML = '<span class="btn-t">Завтра снова</span>';
    }
  }
  if (res.new_balance !== undefined && window.appState) window.appState.balance = res.new_balance;
  updateBalance();
  updateHeroBonus();
  if (winItem.rarity === 'epic') showWin(winItem.stars, 'Бесплатный кейс');
}

// ===== РУЛЕТКА =====

// --- НАСТРОЙКИ АДМИНИСТРАТОРА ---
// Шанс проигрыша (0.0 – 1.0). Для изменения просто правь это значение:
//   ROULETTE_CONFIG.lossChance = 0.5  →  50% проигрышей
//   ROULETTE_CONFIG.lossChance = 0.9  →  90% проигрышей
const ROULETTE_CONFIG = { lossChance: 0.70 };

// Единая рулетка со всеми множителями
const ROULETTE_ITEMS = [
  { name: '×1.1', mult: 1.1, c: '45,212,191',  weight: 40 },
  { name: '×1.5', mult: 1.5, c: '96,165,250',  weight: 20 },
  { name: '×2',   mult: 2,   c: '139,92,246',  weight: 12 },
  { name: '×3',   mult: 3,   c: '224,75,255',  weight: 5  },
  { name: '×5',   mult: 5,   c: '255,77,109',  weight: 1  },
  { name: '×7',   mult: 7,   c: '255,138,61',  weight: 0.3},
  { name: '×10',  mult: 10,  c: '255,197,61',  weight: 0.1},
];

const LOSS_ITEM = { name: '×0', mult: 0, c: LOSS_C, stars: 0 };

let rouletteBet = 100;
let rouletteHistory = []; // множители последних спинов в этой сессии
let _rouletteSpinning = false;

// Визуально только 3 проигрыша в ленте; реальная вероятность задаётся lossChance
function getRouletteItems() {
  const winItems = ROULETTE_ITEMS.map(item => ({
    ...item,
    stars: Math.round(rouletteBet * item.mult),
  }));
  const total = 22;
  const lossAt = new Set([3, 11, 18]);
  const strip = [];
  let wi = 0;
  for (let i = 0; i < total; i++) {
    strip.push(lossAt.has(i) ? { ...LOSS_ITEM } : { ...winItems[wi++ % winItems.length] });
  }
  return strip;
}

function _rouletteColor(mult) {
  return (ROULETTE_ITEMS.find(i => i.mult === mult) || LOSS_ITEM).c;
}

function _rouletteCardHtml(item) {
  const lose = item.mult === 0;
  return `
    <div class="rcard ${lose ? 'lose' : ''}" style="--c:${item.c}" data-mult="${item.mult}">
      <span class="rc-mult">${_multLabel(item.mult)}</span>
      ${starImg(50)}
      <span class="rc-amt">${fmt(item.stars)}</span>
    </div>`;
}

function _rouletteBtnHtml() {
  return `<span class="btn-t">Крутить</span><span class="btn-sum">${starImg(18)}${fmt(rouletteBet)}</span>`;
}

function _rouletteHistHtml() {
  if (!rouletteHistory.length) return '';
  return `
    <span class="label">Твои последние игры</span>
    <div class="hist">
      ${rouletteHistory.slice(0, 6).map(m => `<div class="hist-item" style="--c:${_rouletteColor(m)}">${_multLabel(m)}</div>`).join('')}
    </div>`;
}

function _updateRouletteBetUI() {
  const inp = document.getElementById('roulette-custom-input');
  if (inp) inp.value = rouletteBet;
  document.querySelectorAll('.chip[data-rbet]').forEach(btn => {
    btn.classList.toggle('on', parseInt(btn.dataset.rbet) === rouletteBet);
  });
  document.querySelectorAll('#roulette-track .rcard').forEach(el => {
    el.querySelector('.rc-amt').textContent = fmt(rouletteBet * parseFloat(el.dataset.mult));
  });
  const spinBtn = document.getElementById('btn-roulette');
  if (spinBtn && !_rouletteSpinning) spinBtn.innerHTML = _rouletteBtnHtml();
}

function openRoulette() {
  const items = getRouletteItems();
  const cards = Array.from({ length: REEL_COPIES }, () => items.map(_rouletteCardHtml).join('')).join('');
  _rouletteSpinning = false;

  showModal(`
    ${sheetHead('Рулетка', 'Умножай звёзды до ×10')}
    ${_reelHtml('roulette-track', cards)}
    <div class="result" id="roulette-result"><span class="result-chip idle">Крути — выпадет от ×0 до ×10</span></div>
    <div class="odds">
      ${[LOSS_ITEM, ...ROULETTE_ITEMS].map(it => `<div class="odd" style="--c:${it.c}">${_multLabel(it.mult)}</div>`).join('')}
    </div>
    <span class="label">Ставка</span>
    <div class="chips">
      ${[50,100,250,500].map(b => `
        <button class="chip ${b === rouletteBet ? 'on' : ''}" data-rbet="${b}" onclick="setRouletteBet(${b})">${starImg(15)}${b}</button>
      `).join('')}
    </div>
    <div class="input-row" style="margin-top:8px">
      <input type="number" id="roulette-custom-input" class="input" placeholder="Своя ставка, от 10" min="10"
        value="${rouletteBet}" onkeydown="if(event.key==='Enter')applyCustomBet()">
      <button class="btn btn-ghost" onclick="applyCustomBet()">OK</button>
    </div>
    <div id="roulette-hist">${_rouletteHistHtml()}</div>
    <div class="sheet-foot">
      <button class="btn btn-primary btn-xl btn-block" id="btn-roulette" onclick="spinRoulette()">${_rouletteBtnHtml()}</button>
    </div>
  `);
  _startReelIdle(document.getElementById('roulette-track'), items.length);
}

function setRouletteBet(b) {
  if (_rouletteSpinning) return;
  rouletteBet = b;
  _updateRouletteBetUI();
}

function applyCustomBet() {
  if (_rouletteSpinning) return;
  const val = parseInt(document.getElementById('roulette-custom-input')?.value);
  if (!val || isNaN(val) || val < 10) { showToast('Минимум 10 звёзд'); return; }
  if (window.appState && val > window.appState.balance) { showToast('Недостаточно звёзд'); return; }
  rouletteBet = val;
  _updateRouletteBetUI();
}

async function spinRoulette() {
  if (_rouletteSpinning) return;
  if (!rouletteBet || isNaN(rouletteBet) || rouletteBet < 10) { showToast('Некорректная ставка'); return; }
  if (window.appState && window.appState.balance < rouletteBet) {
    showToast('Недостаточно звёзд!');
    return;
  }

  const btn = document.getElementById('btn-roulette');
  const resultEl = document.getElementById('roulette-result');
  _rouletteSpinning = true;
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-t">Крутим…</span>'; }
  if (resultEl) resultEl.innerHTML = '<span class="result-chip idle">Крутим…</span>';

  // Сервер определяет исход
  const res = await API.spinRoulette(rouletteBet);
  if (!res || res.__error) {
    _rouletteSpinning = false;
    if (btn) { btn.disabled = false; btn.innerHTML = _rouletteBtnHtml(); }
    if (resultEl) resultEl.innerHTML = '<span class="result-chip idle">Крути — выпадет от ×0 до ×10</span>';
    showToast(res?.detail || 'Ошибка соединения');
    return;
  }

  const items = getRouletteItems();
  const track = document.getElementById('roulette-track');

  // Находим позицию в стрипе по mult от сервера
  const serverMult = res.section.mult;
  let winIdx = items.findIndex(item => Math.abs(item.mult - serverMult) < 0.05);
  if (winIdx === -1) winIdx = items.findIndex(item => serverMult === 0 ? item.mult === 0 : item.mult > 0);
  if (winIdx === -1) winIdx = 0;
  const winItem = items[winIdx];

  if (track) await _spinReel(track, items.length, winIdx, 6000);

  _rouletteSpinning = false;
  if (window.appState) window.appState.balance = res.new_balance;
  updateBalance();

  rouletteHistory.unshift(winItem.mult);
  rouletteHistory = rouletteHistory.slice(0, 6);
  const histEl = document.getElementById('roulette-hist');
  if (histEl) histEl.innerHTML = _rouletteHistHtml();

  const resultNow = document.getElementById('roulette-result');
  if (resultNow) {
    resultNow.innerHTML = res.won > 0
      ? `<span class="result-chip">${starImg(18)}${_multLabel(winItem.mult)} · +${fmt(res.won)}</span>`
      : `<span class="result-chip lose">Не повезло — ×0. Ещё раз?</span>`;
  }
  const btnNow = document.getElementById('btn-roulette');
  if (btnNow) { btnNow.disabled = false; btnNow.innerHTML = _rouletteBtnHtml(); }

  if (res.won >= rouletteBet * 5) showWin(res.won, `Рулетка · ${_multLabel(winItem.mult)}`);
}

// ===== CRASH ===== (see full implementation at bottom of file)

// ===== SLOTS =====
const SLOT_EMOJIS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🃏', '7️⃣'];
let slotsBet = 50;

function _slotsBtnHtml() {
  return `<span class="btn-t">Крутить</span><span class="btn-sum">${starImg(18)}${fmt(slotsBet)}</span>`;
}

function openSlots() {
  const makeReel = (id, emoji) => `
    <div class="slot-reel" id="slot-${id}">
      <div class="slot-drum" id="slot-drum-${id}">
        <div class="slot-cell">${emoji}</div>
        <div class="slot-cell">${emoji}</div>
        <div class="slot-cell">${emoji}</div>
      </div>
    </div>`;
  showModal(`
    ${sheetHead('Слоты', 'Три в ряд — до ×50')}
    <div class="slots-machine">
      <div class="slots-display">${makeReel(0, '🍒')}${makeReel(1, '🍋')}${makeReel(2, '🍊')}</div>
    </div>
    <div class="slots-win" id="slots-win"><span class="result-chip idle">Собери три одинаковых символа</span></div>
    <span class="label">Ставка</span>
    <div class="chips">
      ${[25,50,100,250].map(b => `<button class="chip ${b === slotsBet ? 'on' : ''}" data-sbet="${b}" onclick="setSlotsBet(${b})">${starImg(15)}${b}</button>`).join('')}
    </div>
    <div class="sheet-foot">
      <button class="btn btn-gold btn-xl btn-block" id="btn-slots" onclick="doSlotsSpin()">${_slotsBtnHtml()}</button>
    </div>
  `);
}

function setSlotsBet(b) {
  const btn = document.getElementById('btn-slots');
  if (btn?.disabled) return;
  slotsBet = b;
  document.querySelectorAll('.chip[data-sbet]').forEach(c => c.classList.toggle('on', +c.dataset.sbet === b));
  if (btn) btn.innerHTML = _slotsBtnHtml();
}

const SLOT_MULT = { '💎': 50, '7️⃣': 20, '⭐': 15, '🍇': 10, '🍒': 8, '🍊': 6, '🍋': 5, '🃏': 4 };
const SLOT_DURATIONS = [1500, 2000, 2500];
const CELL_H = 80; // = высота .slot-cell в style.css

async function doSlotsSpin() {
  if ((window.appState?.balance ?? 0) < slotsBet) { showToast('Недостаточно звёзд'); return; }
  const btn = document.getElementById('btn-slots');
  btn.disabled = true;
  btn.innerHTML = '<span class="btn-t">Крутим…</span>';
  document.getElementById('slots-win').innerHTML = '<span class="result-chip idle">Удачи!</span>';

  // Сервер определяет исход
  const res = await API.spinSlots(slotsBet);
  if (!res || res.__error) {
    btn.disabled = false;
    btn.innerHTML = _slotsBtnHtml();
    document.getElementById('slots-win').innerHTML = '<span class="result-chip idle">Собери три одинаковых символа</span>';
    showToast(res?.detail || 'Ошибка соединения');
    return;
  }
  const results = res.reels;

  [0,1,2].forEach(i => {
    const drum = document.getElementById(`slot-drum-${i}`);
    if (!drum) return;

    const prefixLen = 24 + i * 4;
    const cells = Array.from({ length: prefixLen }, () =>
      SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]
    );
    cells.push(results[i]);
    cells.push(SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]);

    drum.innerHTML = cells.map(e => `<div class="slot-cell">${e}</div>`).join('');
    drum.style.transition = 'none';
    drum.style.transform = 'translateY(0)';
    void drum.offsetWidth;

    const targetY = -(prefixLen - 1) * CELL_H;
    requestAnimationFrame(() => {
      drum.style.transition = `transform ${SLOT_DURATIONS[i]}ms cubic-bezier(0.05, 0.85, 0.25, 1.0)`;
      drum.style.transform = `translateY(${targetY}px)`;
    });
  });

  setTimeout(() => {
    const winEl = document.getElementById('slots-win');
    if (winEl) {
      if (res.result === 'jackpot') {
        winEl.innerHTML = `<span class="result-chip">${starImg(18)}Джекпот! +${fmt(res.won)}</span>`;
      } else if (res.result === 'pair') {
        winEl.innerHTML = `<span class="result-chip">${starImg(18)}Выигрыш +${fmt(res.won)}</span>`;
      } else {
        winEl.innerHTML = '<span class="result-chip lose">Не повезло — ещё раз?</span>';
      }
    }
    if (window.appState) window.appState.balance = res.new_balance;
    updateBalance();
    if (btn.isConnected) { btn.disabled = false; btn.innerHTML = _slotsBtnHtml(); }
    if (res.result === 'jackpot') showWin(res.won, 'Слоты · джекпот');
  }, 2700);
}

// ===== CRASH GAME =====
let crashActive = false;
let crashInterval = null;
let crashMyBet = 100;
let crashRoundId = -1;
let crashInRound = false;

function _crashRocketHTML() {
  return `
    <svg class="crash-rocket-svg" viewBox="0 0 80 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cr-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#8f86c4"/>
          <stop offset="40%" stop-color="#ffffff"/>
          <stop offset="60%" stop-color="#ece7ff"/>
          <stop offset="100%" stop-color="#8f86c4"/>
        </linearGradient>
        <linearGradient id="cr-nose" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff7d95"/>
          <stop offset="100%" stop-color="#e02450"/>
        </linearGradient>
        <radialGradient id="cr-win" cx="35%" cy="30%">
          <stop offset="0%" stop-color="#d6c6ff"/>
          <stop offset="55%" stop-color="#8b5cf6"/>
          <stop offset="100%" stop-color="#2a1570"/>
        </radialGradient>
        <linearGradient id="cr-fl1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffb42a"/>
          <stop offset="55%" stop-color="#ff5a1f"/>
          <stop offset="100%" stop-color="rgba(255,90,31,0)"/>
        </linearGradient>
        <linearGradient id="cr-fl2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="45%" stop-color="#ffe27a"/>
          <stop offset="100%" stop-color="rgba(255,226,122,0)"/>
        </linearGradient>
      </defs>

      <!-- Flames -->
      <g class="cr-flames">
        <ellipse class="cr-fl-outer" cx="40" cy="177" rx="14" ry="25" fill="url(#cr-fl1)"/>
        <ellipse class="cr-fl-inner" cx="40" cy="170" rx="7"  ry="15" fill="url(#cr-fl2)"/>
      </g>

      <!-- Fins -->
      <path d="M21 128 L3 157 L21 149 Z" fill="url(#cr-nose)"/>
      <path d="M59 128 L77 157 L59 149 Z" fill="url(#cr-nose)"/>

      <!-- Body -->
      <rect x="21" y="65" width="38" height="90" rx="6" fill="url(#cr-body)"/>

      <!-- Nose cone -->
      <path d="M40 10 C29 26,21 46,21 65 L59 65 C59 46,51 26,40 10 Z" fill="url(#cr-nose)"/>
      <path d="M40 12 C35 26,30 42,29 62 C33 52,38 28,40 12 Z" fill="rgba(255,255,255,0.25)"/>

      <!-- Window -->
      <circle cx="40" cy="98" r="13" fill="#1b1030" stroke="#8b5cf6" stroke-width="2.5"/>
      <circle cx="40" cy="98" r="10" fill="url(#cr-win)"/>
      <ellipse cx="35.5" cy="93.5" rx="3.5" ry="2.5" fill="rgba(255,255,255,0.45)" transform="rotate(-25 35.5 93.5)"/>

      <!-- Bands -->
      <rect x="21" y="117" width="38" height="2" rx="1" fill="rgba(90,70,160,0.25)"/>
      <rect x="21" y="131" width="38" height="2" rx="1" fill="rgba(90,70,160,0.2)"/>

      <!-- Nozzle -->
      <path d="M27 152 L53 152 L56 163 L24 163 Z" fill="#2a2340"/>
      <path d="M31 158 L49 158 L51 163 L29 163 Z" fill="#3a3158"/>
    </svg>

    <!-- Explosion (shown on crash) -->
    <div class="cr-explosion" id="cr-explosion">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g stroke-linecap="round" opacity="0.9">
          <line x1="50" y1="50" x2="50" y2="7"  stroke="#ffb42a" stroke-width="5"/>
          <line x1="50" y1="50" x2="83" y2="17" stroke="#fb4f72" stroke-width="4"/>
          <line x1="50" y1="50" x2="93" y2="50" stroke="#ffb42a" stroke-width="5"/>
          <line x1="50" y1="50" x2="83" y2="83" stroke="#fb4f72" stroke-width="4"/>
          <line x1="50" y1="50" x2="50" y2="93" stroke="#ffb42a" stroke-width="5"/>
          <line x1="50" y1="50" x2="17" y2="83" stroke="#fb4f72" stroke-width="4"/>
          <line x1="50" y1="50" x2="7"  y2="50" stroke="#ffb42a" stroke-width="5"/>
          <line x1="50" y1="50" x2="17" y2="17" stroke="#fb4f72" stroke-width="4"/>
        </g>
        <circle cx="50" cy="50" r="22" fill="#ffb42a"/>
        <circle cx="50" cy="50" r="14" fill="#ffe27a"/>
        <circle cx="50" cy="50" r="7"  fill="white"/>
      </svg>
    </div>`;
}

function _crashBetControlsHTML() {
  return `
    <div class="input-row">
      <input class="input" id="crash-bet-input" type="number" min="10"
        value="${crashMyBet}" oninput="crashMyBet=+this.value">
      <button class="btn btn-primary" id="btn-crash-join" onclick="doCrashJoin()">Сесть в ракету</button>
    </div>
    <div class="chips chips-sm">
      ${[50,100,250,500,1000].map(b =>
        `<button class="chip" onclick="crashSetBet(${b})">${starImg(13)}${b}</button>`
      ).join('')}
    </div>`;
}

function openCrash() {
  crashActive = true;
  crashInRound = false;
  crashRoundId = -1;

  showModal(`
    ${sheetHead('Краш', 'Забери выигрыш до взрыва ракеты',
      '<div style="margin-top:8px"><span class="crash-round-badge" id="crash-round-badge">Раунд #—</span></div>')}

    <div class="crash-sky phase-waiting" id="crash-sky">
      <div class="crash-mult-overlay">
        <div class="crash-mult-val" id="crash-mult-val">1.00x</div>
      </div>
      <div class="crash-rocket-container" id="crash-rocket-container">
        ${_crashRocketHTML()}
      </div>
    </div>

    <div class="crash-fuel-wrap">
      <span class="crash-fuel-label">ТЯГА</span>
      <div class="crash-fuel-bar">
        <div class="crash-fuel-fill" id="crash-fuel-fill" style="width:100%;background:var(--green)"></div>
      </div>
      <span class="crash-fuel-pct" id="crash-fuel-pct">100%</span>
    </div>

    <div class="crash-status-bar" id="crash-status-bar">
      <div class="crash-countdown">
        <div class="crash-cd-label">ПОДКЛЮЧЕНИЕ…</div>
        <div class="crash-cd-val">—</div>
        <div class="crash-cd-track"><div class="crash-cd-fill" style="width:100%"></div></div>
      </div>
    </div>

    <span class="label">Пассажиры</span>
    <div class="crash-players-list" id="crash-players-list">
      <div class="crash-no-players">Пусто — займи место!</div>
    </div>

    <div class="crash-controls sheet-foot" id="crash-controls">${_crashBetControlsHTML()}</div>
  `);

  crashInterval = setInterval(crashPoll, 300);
  crashPoll();
}

function crashSetBet(v) {
  crashMyBet = v;
  const inp = document.getElementById('crash-bet-input');
  if (inp) inp.value = v;
}

async function doCrashJoin() {
  const starsError = realStarsError(crashMyBet, 'в Краше');
  if (starsError) { showToast(starsError); return; }
  const btn = document.getElementById('btn-crash-join');
  if (btn) { btn.disabled = true; btn.textContent = 'Садимся…'; }
  const res = await API.crashBet(crashMyBet);
  if (!res || res.__error) {
    showToast(res?.detail || 'Ошибка соединения');
    if (btn) { btn.disabled = false; btn.textContent = 'Сесть в ракету'; }
    return;
  }
  crashInRound = true;
  if (window.appState) window.appState.balance = res.new_balance;
  updateBalance();
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
  showToast('Вы на борту!');
}

async function doCrashCashout() {
  const btn = document.getElementById('btn-crash-cashout');
  if (btn) { btn.disabled = true; }
  const res = await API.crashCashout();
  if (!res || res.__error) {
    showToast(res?.detail || 'Слишком поздно!');
    return;
  }
  crashInRound = false;
  if (window.appState) window.appState.balance = res.new_balance;
  updateBalance();
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
  showToast(`Забрали ${fmt(res.won)} звёзд на ×${res.multiplier}`);
}

async function crashPoll() {
  if (!crashActive) return;
  const state = await API.crashState();
  if (!crashActive) return;

  if (!state || state.__error) {
    const bar = document.getElementById('crash-status-bar');
    if (bar) bar.innerHTML = `<div class="crash-watch-msg">Нет соединения с сервером…</div>`;
    const list = document.getElementById('crash-players-list');
    if (list) list.innerHTML = `<div class="crash-no-players">Нет соединения…</div>`;
    return;
  }

  const { phase, time_left, multiplier, crash_at, players, round_id } = state;

  if (round_id !== crashRoundId) {
    crashRoundId = round_id;
    if (phase === 'waiting') crashInRound = false;
  }

  _crashRenderRocket(phase, multiplier);
  _crashRenderMult(phase, multiplier, crash_at);
  _crashRenderFuel(multiplier);
  _crashRenderStatus(phase, time_left, crash_at);
  _crashRenderPlayers(players, phase);
  _crashRenderControls(phase, multiplier);

  const badge = document.getElementById('crash-round-badge');
  if (badge) badge.textContent = `Раунд #${round_id + 1}`;
}

function _crashRenderRocket(phase, multiplier) {
  const sky = document.getElementById('crash-sky');
  const wrap = document.getElementById('crash-rocket-container');
  if (!sky || !wrap) return;

  sky.className = 'crash-sky phase-' + phase;

  if (phase === 'waiting') {
    wrap.style.transform = 'translateX(-50%) translateY(0px)';
  } else if (phase === 'flying') {
    const lift = Math.min(115, Math.log(multiplier + 1) * 58);
    wrap.style.transform = `translateX(-50%) translateY(-${lift}px)`;
  } else {
    wrap.style.transform = 'translateX(-50%) translateY(-70px)';
  }
}

function _crashRenderMult(phase, multiplier, crash_at) {
  const el = document.getElementById('crash-mult-val');
  if (!el) return;
  const val = phase === 'crashed' ? crash_at : multiplier;
  el.textContent = val.toFixed(2) + 'x';
  el.className = 'crash-mult-val' +
    (phase === 'crashed' ? ' c-crashed' : phase === 'flying' ? ' c-flying' : '');
}

function _crashRenderFuel(multiplier) {
  const fill = document.getElementById('crash-fuel-fill');
  const pct = document.getElementById('crash-fuel-pct');
  if (!fill || !pct) return;
  const fuel = Math.max(2, Math.round(100 / Math.sqrt(multiplier)));
  fill.style.width = fuel + '%';
  fill.style.background = fuel > 60 ? 'var(--green)' : fuel > 30 ? 'var(--gold)' : 'var(--rose)';
  pct.textContent = fuel + '%';
}

function _crashRenderStatus(phase, time_left, crash_at) {
  const bar = document.getElementById('crash-status-bar');
  if (!bar) return;
  if (phase === 'waiting') {
    const pct = (time_left / 10) * 100;
    bar.innerHTML = `
      <div class="crash-countdown">
        <div class="crash-cd-label">СТАРТ ЧЕРЕЗ</div>
        <div class="crash-cd-val">${time_left}</div>
        <div class="crash-cd-track"><div class="crash-cd-fill" style="width:${pct}%"></div></div>
      </div>`;
  } else if (phase === 'flying') {
    bar.innerHTML = `<div class="crash-status-flying">РАКЕТА В ПОЛЁТЕ</div>`;
  } else {
    bar.innerHTML = `<div class="crash-status-crashed">ВЗРЫВ НА ${crash_at.toFixed(2)}x</div>`;
  }
}

function _crashRenderPlayers(players, phase) {
  const list = document.getElementById('crash-players-list');
  if (!list) return;
  if (!players.length) {
    list.innerHTML = '<div class="crash-no-players">Пусто — займи место!</div>';
    return;
  }
  list.innerHTML = players.map(p => {
    let st;
    if (p.cashed_out) {
      st = `<span class="crash-p-win">✓ ${p.cashout_mult.toFixed(2)}x</span>`;
    } else if (phase === 'crashed') {
      st = `<span class="crash-p-lose">✗</span>`;
    } else {
      st = `<span class="crash-p-fly">▲</span>`;
    }
    return `<div class="crash-player-item">
      <span class="crash-p-name">${esc(p.name)}</span>
      <span class="crash-p-bet">${starImg(13)}${fmt(p.bet)}</span>
      ${st}
    </div>`;
  }).join('');
}

function _crashCashoutBtnHtml(won) {
  return `<span class="btn-t">Забрать</span><span class="btn-sum">${starImg(18)}${fmt(won)}</span>`;
}

function _crashRenderControls(phase, multiplier) {
  const ctrl = document.getElementById('crash-controls');
  if (!ctrl) return;

  if (phase === 'waiting' && !crashInRound) {
    // Не перерисовывать если инпут уже отображён — иначе пользователь не сможет напечатать сумму
    if (document.getElementById('crash-bet-input')) return;
    ctrl.innerHTML = _crashBetControlsHTML();
  } else if (phase === 'waiting' && crashInRound) {
    if (ctrl.querySelector('.crash-on-board')) return;
    ctrl.innerHTML = `<div class="crash-on-board">Вы на борту! Ждём старта…</div>`;
  } else if (phase === 'flying' && crashInRound) {
    const won = Math.round(crashMyBet * multiplier);
    const btn = document.getElementById('btn-crash-cashout');
    if (btn) {
      btn.innerHTML = _crashCashoutBtnHtml(won);
      const hint = ctrl.querySelector('.crash-cashout-hint');
      if (hint) hint.textContent = `Множитель ${multiplier.toFixed(2)}x — жми, пока не взорвалась!`;
      return;
    }
    ctrl.innerHTML = `
      <button class="btn btn-gold btn-xl btn-block btn-cashout-pulse" id="btn-crash-cashout" onclick="doCrashCashout()">
        ${_crashCashoutBtnHtml(won)}
      </button>
      <div class="crash-cashout-hint">Множитель ${multiplier.toFixed(2)}x — жми, пока не взорвалась!</div>`;
  } else if (phase === 'flying') {
    if (ctrl.querySelector('.crash-watch-msg')) return;
    ctrl.innerHTML = `<div class="crash-watch-msg">Наблюдаете за полётом…</div>`;
  } else {
    if (ctrl.querySelector('.crash-next-round')) return;
    ctrl.innerHTML = `<div class="crash-next-round">Следующий раунд через несколько секунд…</div>`;
    if (crashInRound) crashInRound = false;
  }
}

// ===== MINER (САПЁР) =====
// Мины не предопределены — решение принимается при каждом клике (on-the-fly)
// Вероятность мины = (честная) × MINER_HOUSE, множитель = честный × MINER_CUT
const MINER_CELLS = 12; // 4 строки × 3 столбца
const MINER_HOUSE = 1.10; // накрутка вероятности мины (+10%)
const MINER_CUT   = 0.93; // выплата 93% от честного за каждый шаг

let _ms = null; // miner state

function openMiner() {
  showModal(`
    ${sheetHead('Сапёр', 'Открывай клетки и обходи мины')}
    <div id="miner-content"></div>
  `);
  _ms = null;
  _minerSetup();
}

function _minerSetup() {
  const bal = window.appState?.balance ?? 0;
  const curMines = window._minerMines || 3;
  document.getElementById('miner-content').innerHTML = `
    <span class="label">Количество мин</span>
    <div class="chips chips-sm" id="miner-mine-row">
      ${[1,2,3,4,5,6].map(m =>
        `<button class="chip miner-mine-btn${m === curMines ? ' on' : ''}" onclick="_minerPick(${m})">${m}</button>`
      ).join('')}
    </div>
    <span class="label">Ставка</span>
    <div class="input-row">
      <input id="miner-bet" class="input" type="number" min="10" max="${bal}" value="100">
      <button class="btn btn-ghost" onclick="document.getElementById('miner-bet').value=Math.max(10,Math.floor((window.appState?.balance??0)/2))">½</button>
      <button class="btn btn-ghost" onclick="document.getElementById('miner-bet').value=window.appState?.balance??0">MAX</button>
    </div>
    <div class="chips chips-sm" style="margin-top:8px">
      ${[50,100,250,500,1000].map(b =>
        `<button class="chip" onclick="document.getElementById('miner-bet').value=${b}">${starImg(13)}${b}</button>`
      ).join('')}
    </div>
    <div class="miner-grid" style="opacity:.55">
      ${'<div class="miner-cell miner-closed locked"></div>'.repeat(MINER_CELLS)}
    </div>
    <div class="sheet-foot">
      <button class="btn btn-primary btn-xl btn-block" onclick="_minerStart()"><span class="btn-t">Начать игру</span></button>
    </div>
  `;
  if (!window._minerMines) window._minerMines = 3;
}

function _minerPick(n) {
  window._minerMines = n;
  document.querySelectorAll('.miner-mine-btn').forEach((b, i) => {
    b.classList.toggle('on', i + 1 === n);
  });
}

function _minerStart() {
  const bet = parseInt(document.getElementById('miner-bet').value) || 0;
  const mines = window._minerMines || 3;
  if (bet < 10) return showToast('Минимальная ставка — 10 звёзд');
  if (bet > (window.appState?.balance ?? 0)) return showToast('Недостаточно звёзд');

  // Запрашиваем сервер на создание игры
  API.minerStart(bet, mines).then(res => {
    if (!res || res.__error) {
      showToast(res?.detail || 'Ошибка соединения');
      return;
    }
    // Обновляем баланс
    if (window.appState) window.appState.balance = res.new_balance;
    updateBalance();
    // Создаём локальное состояние игры
    _ms = {
      bet, mines, found: 0, mult: 1.0, active: true,
      cells: new Array(MINER_CELLS).fill(null),
      game_id: res.game_id,
    };
    _minerRender();
  }).catch(err => {
    console.error('Miner start error:', err);
    showToast('Ошибка сервера');
  });
}

function _minerClick(i) {
  if (!_ms?.active || !_ms.game_id || _ms.cells[i] !== null) return;

  // Отправляем клик на сервер
  API.minerClick(_ms.game_id, i).then(res => {
    if (!res || res.__error) {
      showToast(res?.detail || 'Ошибка соединения');
      return;
    }

    if (res.result === 'safe') {
      // Безопасно - обновляем состояние
      _ms.cells[i] = 'safe';
      _ms.found++;
      _ms.mult = res.mult;
      _minerRender();
    } else if (res.result === 'win') {
      // Все мины найдены - победа
      _ms.cells[i] = 'safe';
      _ms.found++;
      _ms.mult = res.mult;
      _ms.active = false;
      if (window.appState) window.appState.balance = res.new_balance;
      updateBalance();
      _minerRender();
      showWin(res.won, 'Сапёр · все клетки открыты');
    } else if (res.result === 'lose') {
      // Мина - проигрыш
      _ms.cells[i] = 'mine';
      _ms.active = false;
      // Открываем все мины
      _ms.cells = _ms.cells.map(c => c === null ? 'ghost' : c);
      _minerRender();
      if (window.Telegram?.WebApp?.HapticFeedback)
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
      setTimeout(() => showToast(`Подорвался! −${fmt(_ms.bet)} звёзд`), 120);
    }
  }).catch(err => {
    console.error('Miner click error:', err);
    showToast('Ошибка сервера');
  });
}

function _minerCashout() {
  if (!_ms?.active || !_ms.game_id || _ms.found === 0) return;

  API.minerCashout(_ms.game_id).then(res => {
    if (!res || res.__error) {
      showToast(res?.detail || 'Ошибка соединения');
      return;
    }

    _ms.active = false;
    if (window.appState) window.appState.balance = res.new_balance;
    updateBalance();
    _minerRender();
    showWin(res.won, `Сапёр · ×${_ms.mult.toFixed(2)}`);
  }).catch(err => {
    console.error('Miner cashout error:', err);
    showToast('Ошибка сервера');
  });
}

function _minerRender() {
  const el = document.getElementById('miner-content');
  if (!el || !_ms) return;
  const { mult, bet, found, mines, active, cells } = _ms;
  const potential = Math.floor(bet * mult);

  const grid = cells.map((c, i) => {
    if (c === 'safe')  return `<div class="miner-cell miner-safe">${svgIcon('i-gem')}</div>`;
    if (c === 'mine')  return `<div class="miner-cell miner-boom">${svgIcon('i-bomb')}</div>`;
    if (c === 'ghost') return `<div class="miner-cell miner-ghost">${svgIcon('i-bomb')}</div>`;
    if (!active)       return `<div class="miner-cell miner-closed locked"></div>`;
    return `<div class="miner-cell miner-closed" onclick="_minerClick(${i})"></div>`;
  }).join('');

  const bottom = active && found > 0
    ? `<button class="btn btn-gold btn-xl btn-block" onclick="_minerCashout()">
         <span class="btn-t">Забрать</span><span class="btn-sum">${starImg(18)}${fmt(potential)}</span>
       </button>`
    : !active
    ? `<button class="btn btn-ghost btn-xl btn-block" onclick="_minerSetup()"><span class="btn-t">Сыграть ещё</span></button>`
    : `<div class="miner-hint">Открывай клетки · мин на поле: ${mines}</div>`;

  el.innerHTML = `
    <div class="miner-top">
      <div>
        <div class="miner-big-mult">${mult.toFixed(2)}x</div>
        <div class="miner-small-label">множитель</div>
      </div>
      <div style="text-align:right">
        <div class="miner-potential">${starImg(18)}${fmt(potential)}</div>
        <div class="miner-small-label">ставка ${fmt(bet)} · мин ${mines}</div>
      </div>
    </div>
    <div class="miner-grid">${grid}</div>
    <div class="sheet-foot">${bottom}</div>
  `;
}
