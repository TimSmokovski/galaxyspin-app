// ===== MAIN APP =====
window.appState = {
  id: null,
  name: 'Игрок',
  avatar: '?',
  balance: 0,
  demo_balance: 0,
};

const APP_BG = '#07060b';

// Init Telegram Web App
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor(APP_BG);
  tg.setBackgroundColor(APP_BG);
  if (tg.isVersionAtLeast?.('7.10')) tg.setBottomBarColor(APP_BG);

  const user = tg.initDataUnsafe?.user;
  if (user) {
    window.appState.id = user.id;
    window.appState.name = user.first_name || 'Игрок';
    window.appState.photo_url = user.photo_url || null;
    window.appState.avatar = (user.first_name || 'И')[0].toUpperCase();
  }
}

// ===== UI HELPERS =====
const STAR_SRC = 'assets/tg_star.png';

function starImg(size = 18) {
  return `<img class="star" src="${STAR_SRC}" alt="" style="width:${size}px">`;
}

// Экранирование пользовательских строк (имена, юзернеймы) перед вставкой в innerHTML
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmt(n) {
  return Math.round(Number(n) || 0).toLocaleString('ru-RU');
}

function svgIcon(id, cls = '') {
  return `<svg class="ico ${cls}"><use href="#${id}"/></svg>`;
}

// Аватар: фото или первая буква имени
function avatarInner(photo, name) {
  return photo
    ? `<img src="${esc(photo)}" alt="">`
    : `<span>${esc((name || 'И')[0].toUpperCase())}</span>`;
}

function balanceChip() {
  return `<div class="balance" onclick="hideModal();showDepositModal()">
    ${starImg(19)}<span class="modal-hdr-balance">${fmt(window.appState?.balance)}</span><span class="plus">+</span>
  </div>`;
}

// Шапка шторки: ручка, заголовок, подзаголовок и баланс справа
function sheetHead(title, sub = '', extra = '') {
  return `
    <div class="modal-close-bar"><div class="modal-close-handle"></div></div>
    <div class="sheet-head">
      <div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}${extra}</div>
      ${balanceChip()}
    </div>`;
}

// ===== NAVIGATION =====
const PAGE_RENDERERS = {
  cases:    renderCasesPage,
  contests: renderContestsPage,
  tasks:    renderTasksPage,
  leaders:  renderLeadersPage,
  profile:  renderProfilePage,
};

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const pageEl = document.getElementById(`page-${page}`);
  const navBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
  if (pageEl) { pageEl.classList.remove('hidden'); pageEl.scrollTop = 0; }
  if (navBtn) navBtn.classList.add('active');

  if (PAGE_RENDERERS[page]) PAGE_RENDERERS[page]();

  if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

// ===== MODAL =====
function showModal(html) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  content.innerHTML = html;
  content.scrollTop = 0;
  overlay.classList.remove('hidden');

  overlay.onclick = (e) => {
    if (e.target === overlay) hideModal();
  };
}

function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  if (typeof crashActive !== 'undefined') {
    crashActive = false;
    if (crashInterval) clearInterval(crashInterval);
  }
  if (typeof pvpRefreshTimer !== 'undefined' && pvpRefreshTimer) {
    clearInterval(pvpRefreshTimer);
    pvpRefreshTimer = null;
  }
  if (typeof pvpTickTimer !== 'undefined' && pvpTickTimer) {
    clearInterval(pvpTickTimer);
    pvpTickTimer = null;
  }
  if (typeof pvpLocalTimeLeft !== 'undefined') pvpLocalTimeLeft = null;
}

// ===== WIN SCREEN (spotlight) =====
function _winSparks(overlay, count, palette) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'confetti';
    const size = 8 + Math.random() * 12;
    s.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;color:${palette[i % palette.length]};` +
      `animation-delay:${Math.random() * 0.6}s;animation-duration:${1.4 + Math.random()}s;`;
    s.innerHTML = '<svg style="width:100%;height:100%"><use href="#i-spark"/></svg>';
    overlay.appendChild(s);
  }
}

const _WIN_SPARKS = `
  <svg class="spark" style="left:18%;top:30%;width:14px;height:14px;animation-delay:.2s"><use href="#i-spark"/></svg>
  <svg class="spark" style="right:16%;top:27%;width:18px;height:18px;animation-delay:.9s"><use href="#i-spark"/></svg>
  <svg class="spark" style="left:26%;top:50%;width:10px;height:10px;animation-delay:1.5s"><use href="#i-spark"/></svg>
  <svg class="spark" style="right:22%;top:47%;width:12px;height:12px;animation-delay:.5s;color:#d9c8ff"><use href="#i-spark"/></svg>
  <svg class="spark" style="left:10%;top:41%;width:8px;height:8px;animation-delay:2s;color:#d9c8ff"><use href="#i-spark"/></svg>`;

// won — сколько звёзд выиграно, caption — плашка под суммой (например «Рулетка · ×10»)
function showWin(won, caption = '', label = 'ВЫИГРЫШ') {
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

  const overlay = document.createElement('div');
  overlay.className = 'win-overlay';
  overlay.innerHTML = `
    <div class="win-bg"></div><div class="win-beam"></div><div class="win-lamp"></div>
    ${_WIN_SPARKS}
    <div class="win-content">
      <div class="win-label">${label}</div>
      <img class="win-star" src="${STAR_SRC}" alt="">
      <div class="win-amt">+${fmt(won)}</div>
      ${caption ? `<div class="win-meta"><span class="pill pill-soft pill-lg">${caption}</span></div>` : ''}
      <div class="win-note">Звёзды уже на балансе</div>
    </div>
    <div class="win-actions">
      <button class="btn btn-gold btn-xl btn-block"><span class="btn-t">Забрать</span></button>
    </div>`;
  overlay.querySelector('.win-actions button').onclick = () => overlay.remove();
  _winSparks(overlay, 24, ['#ffc53d', '#ffe6a3', '#b69cff', '#ffffff']);

  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 6000);
}

// ===== PVP WIN SCREEN =====
function showPvpWin(res, iWon) {
  if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred(iWon ? 'success' : 'error');

  const overlay = document.createElement('div');
  overlay.className = 'win-overlay' + (iWon ? '' : ' violet');
  overlay.innerHTML = `
    <div class="win-bg"></div><div class="win-beam"></div><div class="win-lamp"></div>
    ${iWon ? _WIN_SPARKS : ''}
    <div class="win-content">
      <div class="win-label ${iWon ? '' : 'muted'}">${iWon ? 'ТЫ ПОБЕДИЛ' : 'ПОБЕДИТЕЛЬ РАУНДА'}</div>
      <div class="win-avatar">${avatarInner(res.winner_photo, res.winner_name)}</div>
      <div class="win-name">${esc(res.winner_name)}</div>
      <div class="win-pot">${starImg(36)}${iWon ? '+' : ''}${fmt(res.total_pot)}</div>
      <div class="win-stats">
        <div class="win-stat"><b>×${esc(res.coefficient)}</b><span>коэффициент</span></div>
        <div class="win-stat"><b>${esc(res.chance)}%</b><span>шанс победы</span></div>
      </div>
    </div>
    <div class="win-actions">
      <button class="btn ${iWon ? 'btn-gold' : 'btn-ghost'} btn-xl btn-block"><span class="btn-t">${iWon ? 'Забрать' : 'Закрыть'}</span></button>
    </div>`;
  overlay.querySelector('.win-actions button').onclick = () => overlay.remove();
  if (iWon) _winSparks(overlay, 28, ['#ffc53d', '#ffe6a3', '#b69cff', '#ffffff']);

  document.body.appendChild(overlay);
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

// ===== DEPOSIT MODAL =====
let _depositAmount = null;
const DEPOSIT_PACKAGES = [50, 100, 250, 500, 1000];

function showDepositModal() {
  _depositAmount = null;
  showModal(`
    <div class="modal-close-bar"><div class="modal-close-handle"></div></div>
    <div class="sheet-center">
      <h2>Пополнить баланс</h2>
      <p>Выбери пакет или введи свою сумму</p>
    </div>
    <div class="dep-grid">
      ${DEPOSIT_PACKAGES.map(amt => `
        <button class="dep-pkg" id="dep-pkg-${amt}" onclick="setDepositAmount(${amt})">${starImg(22)}${fmt(amt)}</button>
      `).join('')}
    </div>
    ${_depositBonusHtml()}
    <span class="label">Своя сумма · от 50 до 100 000</span>
    <input id="deposit-input" class="input" type="number" min="50" max="100000" placeholder="Например: 300"
      oninput="onDepositInput(this)">
    <button id="deposit-confirm-btn" class="btn btn-primary btn-xl btn-block" style="margin-top:16px" onclick="confirmDeposit()" disabled>
      <span class="btn-t">Пополнить</span>
    </button>
    <div class="muted-note">Оплата звёздами Telegram</div>
  `);
}

// Бонус за пополнение: от deposit_bonus_min ⭐ — ещё один бесплатный кейс, раз в день
function _depositBonusMin() { return window.appState?.deposit_bonus_min || 100; }

function _depositBonusHtml() {
  const min = _depositBonusMin();
  const ready = window.appState?.deposit_bonus_ready !== false;
  return `
    <div class="dep-bonus${ready ? '' : ' used'}" id="dep-bonus">
      <svg class="dep-bonus-ico"><use href="#i-gift"/></svg>
      <div class="dep-bonus-text">
        <b>+1 бесплатный кейс</b>
        <span>${ready
          ? `Пополни от ${starImg(13)}${fmt(min)} — и открой кейс ещё раз. Раз в день`
          : 'Бонус за сегодня уже получен — возвращайся завтра'}</span>
      </div>
      <div class="dep-bonus-check">${svgIcon('i-check')}</div>
    </div>`;
}

function _updateDepositBonus(amount) {
  const ready = window.appState?.deposit_bonus_ready !== false;
  document.getElementById('dep-bonus')?.classList.toggle('on', ready && !!amount && amount >= _depositBonusMin());
}

function setDepositAmount(amount) {
  _depositAmount = amount;
  const input = document.getElementById('deposit-input');
  if (input) input.value = amount;
  _highlightDepositPkg(amount);
  _updateDepositBtn(amount);
  _updateDepositBonus(amount);
}

function onDepositInput(input) {
  const val = parseInt(input.value);
  _depositAmount = (!isNaN(val) && val >= 50 && val <= 100000) ? val : null;
  _highlightDepositPkg(_depositAmount);
  _updateDepositBtn(_depositAmount);
  _updateDepositBonus(_depositAmount);
}

function _highlightDepositPkg(amount) {
  DEPOSIT_PACKAGES.forEach(a => {
    document.getElementById(`dep-pkg-${a}`)?.classList.toggle('on', a === amount);
  });
}

function _depositBtnHtml(amount) {
  return amount
    ? `<span class="btn-t">Пополнить</span><span class="btn-sum">${starImg(18)}${fmt(amount)}</span>`
    : `<span class="btn-t">Пополнить</span>`;
}

function _updateDepositBtn(amount) {
  const btn = document.getElementById('deposit-confirm-btn');
  if (!btn) return;
  const ok = !!(amount && amount >= 50);
  btn.disabled = !ok;
  btn.innerHTML = _depositBtnHtml(ok ? amount : null);
}

async function confirmDeposit() {
  if (!_depositAmount || _depositAmount < 50) return;
  const btn = document.getElementById('deposit-confirm-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-t">Отправляем…</span>'; }

  const res = await API.createInvoice(_depositAmount);
  if (!res || res.__error) {
    showToast('Ошибка — попробуй ещё раз');
    if (btn) { btn.disabled = false; btn.innerHTML = _depositBtnHtml(_depositAmount); }
    return;
  }
  hideModal();

  if (res.invoice_link && tg?.openInvoice) {
    tg.openInvoice(res.invoice_link, async (status) => {
      if (status === 'paid') {
        const before = window.appState?.bonus_cases || 0;
        // Зачисление приходит через webhook — даём серверу секунду
        await new Promise(r => setTimeout(r, 1200));
        const me = await API.getMe();
        if (me && !me.__error) {
          window.appState = { ...window.appState, ...me };
          updateBalance();
          if (typeof updateHeroBonus === 'function') updateHeroBonus();
        }
        showToast((me?.bonus_cases || 0) > before
          ? 'Оплачено! 🎁 +1 бесплатный кейс на главной'
          : 'Оплачено! Баланс пополнен');
      } else if (status === 'cancelled') {
        showToast('Оплата отменена');
      } else if (status === 'failed') {
        showToast('Ошибка оплаты');
      }
    });
  } else {
    showToast('Счёт отправлен — проверь Telegram');
  }
}

// ===== BALANCE =====
// Обычные звёзды — без демо (демо выдаёт админ, их нельзя вывести и ставить в PvP/Краше)
function realBalance() {
  return Math.max(0, (window.appState?.balance || 0) - (window.appState?.demo_balance || 0));
}

// Текст ошибки, если ставку в PvP/Краше не покрыть обычными звёздами; иначе null
function realStarsError(amount, where) {
  if (amount <= realBalance()) return null;
  if (amount <= (window.appState?.balance || 0)) return `Демо-звёзды нельзя ставить ${where} — только обычные`;
  return 'Недостаточно звёзд';
}

function updateBalance() {
  const el = document.getElementById('user-balance');
  if (el) el.textContent = fmt(window.appState.balance);
  // Обновляем баланс во всех открытых модалках
  document.querySelectorAll('.modal-hdr-balance').forEach(e => {
    e.textContent = fmt(window.appState?.balance);
  });
}

function _setTopbarAvatar() {
  const el = document.getElementById('user-avatar');
  if (!el) return;
  el.innerHTML = avatarInner(window.appState.photo_url, window.appState.name);
}

// ===== INIT =====
function showApp() {
  document.getElementById('loader').classList.add('hidden');
  document.getElementById('main').classList.remove('hidden');
}

async function init() {
  // Применяем реферала если пришли по реф-ссылке (fire & forget)
  const _refParam = new URLSearchParams(window.location.search).get('ref')
    || (tg?.initDataUnsafe?.start_param?.startsWith('ref_')
        ? tg.initDataUnsafe.start_param.replace('ref_', '')
        : null);
  if (_refParam) API.applyRef(_refParam);

  // Проверяем бан до показа приложения
  const userData = await Promise.race([
    API.getMe(),
    new Promise(r => setTimeout(() => r(null), 3000)),
  ]);

  if (userData?.__banned) return; // оставляем лоадер навсегда

  // Применяем реальные данные ДО рендера, чтобы не мигал баланс
  if (userData) {
    window.appState = { ...window.appState, ...userData };
  }

  // Проверяем права админа (fire & forget, результат сохраняем в appState)
  apiCall('GET', '/admin/check').then(res => {
    window.appState.isAdmin = !!(res && !res.__error);
  }).catch(() => {});

  try {
    _setTopbarAvatar();
    updateBalance();
    renderCasesPage();
    initLiveBar();
  } catch (e) {
    console.error('Render error:', e);
    document.getElementById('page-cases').innerHTML = `<div class="empty" style="color:var(--rose)">Ошибка: ${esc(e.message)}</div>`;
  }

  showApp();
}

init();
