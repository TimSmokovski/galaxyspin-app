// ===== PROFILE PAGE =====
let _refLink = null;

function _realBalance() {
  return Math.max(0, (window.appState?.balance || 0) - (window.appState?.demo_balance || 0));
}

async function renderProfilePage() {
  const page = document.getElementById('page-profile');

  // Подтягиваем свежие данные (баланс + demo_balance актуальные)
  const fresh = await API.getMe().catch(() => null);
  if (fresh && !fresh.__error) {
    window.appState = { ...window.appState, ...fresh };
    updateBalance();
  }
  const user = window.appState || MOCK.user;

  const refData = await API.getReferral().catch(() => null) || MOCK.referral;
  _refLink = refData.ref_link || `https://t.me/DC_GalaxySpinBot?start=ref_${user?.id || ''}`;
  const ref = refData;
  const realBalance = _realBalance();

  page.innerHTML = `
    <div class="card" style="margin-top:4px">
      <div class="me-card">
        <div class="me-avatar">${avatarInner(user.photo_url, user.name)}</div>
        <div>
          <div class="me-name">${esc(user.name || 'Игрок')}</div>
          <div class="me-balance">${starImg(16)}${fmt(user.balance)} звёзд</div>
          ${(user.demo_balance > 0) ? `<div class="me-demo">из них ${fmt(user.demo_balance)} демо — нельзя вывести</div>` : ''}
        </div>
      </div>
    </div>

    <div class="card ref-card">
      <h2>Приглашай друзей и получай <span class="hl">10%</span> от их пополнений</h2>
      <p>Реферальный бонус начисляется автоматически и навсегда — за каждого приглашённого друга.</p>
      <div class="ref-stats">
        <div class="ref-stat">
          <div class="ref-stat-val">${fmt(ref.friends)}</div>
          <div class="ref-stat-label">Друзей</div>
        </div>
        <div class="ref-stat">
          <div class="ref-stat-val">${starImg(18)}${fmt(ref.earned)}</div>
          <div class="ref-stat-label">Заработано</div>
        </div>
      </div>
      <div class="input-row">
        <button class="btn btn-primary" style="flex:1" onclick="doInvite()">Пригласить друга</button>
        <button class="btn btn-ghost btn-copy" onclick="copyLink()" title="Скопировать ссылку">${svgIcon('i-copy')}</button>
      </div>
    </div>

    <div class="card wd-card">
      <div class="card-title">Вывод звёзд</div>
      <div class="card-sub">Через Fragment · минимум 100 звёзд</div>
      <div class="wd-avail"><span>Доступно к выводу</span><b>${starImg(17)}${fmt(realBalance)}</b></div>
      <div class="stack">
        <input id="withdraw-amount" class="input" type="number" min="100" max="${realBalance}" placeholder="Сумма, от 100"
          oninput="onWithdrawInput()">
        <input id="withdraw-username" class="input" type="text" placeholder="Telegram username (без @)"
          oninput="onWithdrawInput()">
        <button id="withdraw-btn" class="btn btn-gold btn-xl btn-block" onclick="doWithdraw()" disabled>
          <span class="btn-t">Вывести</span>
        </button>
      </div>
      <div id="withdrawals-history"></div>
    </div>

    <div id="admin-btn-slot"></div>
  `;

  // Загружаем историю вывода
  API.myWithdrawals().then(list => {
    const el = document.getElementById('withdrawals-history');
    if (!el || !list || !list.length) return;
    const statusLabel = { pending: 'В обработке', done: 'Выведено', rejected: 'Отклонено' };
    el.innerHTML = `
      <div class="wd-hist-title">История заявок</div>
      ${list.map(w => `
        <div class="wd-item">
          <div>
            <div class="wd-item-sum">${starImg(14)}${fmt(w.amount)}</div>
            <div class="wd-item-date">${esc(w.created_at?.slice(0, 10))}</div>
          </div>
          <div class="wd-status ${esc(w.status)}">${statusLabel[w.status] || esc(w.status)}</div>
        </div>
      `).join('')}`;
  });

  // Проверяем на сервере — является ли текущий пользователь админом
  apiCall('GET', '/admin/check').then(res => {
    if (!res || res.__error) return;
    const slot = document.getElementById('admin-btn-slot');
    if (!slot) return;
    slot.innerHTML = `
      <div style="margin:0 16px 24px">
        <button class="btn btn-ghost btn-block" onclick="openAdminPanel()">Админ-панель</button>
      </div>`;
  });
}

function openAdminPanel() {
  const base = window.location.href.replace(/\/[^/]*$/, '');
  // Передаём initData через hash (без ограничений по длине)
  const initData = window.Telegram?.WebApp?.initData || '';
  window.location.href = `${base}/admin.html#${encodeURIComponent(initData)}`;
}

function doInvite() {
  const link = _refLink || `https://t.me/DC_GalaxySpinBot?start=ref_${window.appState?.id || ''}`;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Играй со мной в Galaxy Spin и получи бонус!')}`);
  } else {
    copyToClipboard(link);
    showToast('Ссылка скопирована!');
  }
}

function copyLink() {
  const link = _refLink || `https://t.me/DC_GalaxySpinBot?start=ref_${window.appState?.id || ''}`;
  copyToClipboard(link);
  showToast('Ссылка скопирована!');
}

function _withdrawBtnHtml(amount) {
  return amount
    ? `<span class="btn-t">Вывести</span><span class="btn-sum">${starImg(18)}${fmt(amount)}</span>`
    : `<span class="btn-t">Вывести</span>`;
}

function onWithdrawInput() {
  const amount = parseInt(document.getElementById('withdraw-amount')?.value);
  const username = (document.getElementById('withdraw-username')?.value || '').trim().replace(/^@/, '');
  const btn = document.getElementById('withdraw-btn');
  const valid = !isNaN(amount) && amount >= 100 && amount <= _realBalance() && username.length >= 3;
  if (!btn) return;
  btn.disabled = !valid;
  btn.innerHTML = _withdrawBtnHtml(valid ? amount : null);
}

let _withdrawInProgress = false;

async function doWithdraw() {
  if (_withdrawInProgress) return;  // Debounce

  const amount = parseInt(document.getElementById('withdraw-amount')?.value);
  const username = (document.getElementById('withdraw-username')?.value || '').trim().replace(/^@/, '');
  const btn = document.getElementById('withdraw-btn');
  if (!amount || !username || btn?.disabled) return;

  _withdrawInProgress = true;
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="btn-t">Отправляем…</span>'; }

  const res = await API.requestWithdrawal(amount, username);
  _withdrawInProgress = false;

  if (!res || res.__error) {
    showToast(res?.detail || 'Ошибка');
    if (btn) { btn.disabled = false; btn.innerHTML = _withdrawBtnHtml(amount); }
    return;
  }
  showToast(res.message || 'Заявка отправлена');
  window.appState.balance = (window.appState.balance || 0) - amount;
  updateBalance();
  renderProfilePage();
}

function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}
