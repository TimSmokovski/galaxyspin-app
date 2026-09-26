// ===== TASKS PAGE =====
const TASK_ICONS = {
  tg:     { id: 'i-tg',    c: '42,171,238' },
  yt:     { id: 'i-yt',    c: '255,59,48' },
  ig:     { id: 'i-ig',    c: '225,48,108' },
  link:   { id: 'i-link',  c: '139,92,246' },
  invite: { id: 'i-users', c: '52,211,153' },
};

async function renderTasksPage() {
  const page = document.getElementById('page-tasks');
  page.innerHTML = `
    <div class="page-head">
      <h1>Задания</h1>
      <p>Выполняй задания и получай звёзды на баланс.</p>
    </div>
    <div id="tasks-list"><div class="empty">Загрузка…</div></div>`;

  const tasks = await API.getTasks();
  const list = document.getElementById('tasks-list');
  if (!list) return;

  if (!tasks || tasks.__error || !tasks.length) {
    list.innerHTML = '<div class="empty">Заданий пока нет</div>';
    return;
  }

  const active = tasks.filter(t => !t.done);
  const done = tasks.filter(t => t.done);
  list.innerHTML = `
    ${active.length ? `<div class="group">${active.map(_taskCard).join('')}</div>` : ''}
    ${done.length ? `<div class="sec" style="padding-top:8px"><h3>Выполнено</h3></div><div class="group">${done.map(_taskCard).join('')}</div>` : ''}
  `;
}

function _taskHead(t, right = '') {
  const ic = TASK_ICONS[t.icon] || TASK_ICONS.link;
  return `
    <div class="task-row">
      <div class="task-ico" style="--c:${ic.c}">${svgIcon(ic.id)}</div>
      <div class="task-info">
        <div class="task-name">${esc(t.name)}</div>
        <div class="task-reward">${starImg(14)}+${fmt(t.reward)}</div>
      </div>
      ${t.done ? `<div class="task-check">${svgIcon('i-check')}</div>` : right}
    </div>`;
}

function _taskCard(t) {
  const done = t.done;

  if (t.type === 'invite_friends') {
    const prog = t.progress ?? 0;
    const pct = Math.round((prog / 3) * 100);
    return `
      <div class="task ${done ? 'done' : ''}">
        ${_taskHead(t)}
        ${!done ? `
          <div class="progress-meta"><span>Приглашено друзей</span><span>${prog}/3</span></div>
          <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="task-actions">
            <button class="btn btn-primary" onclick="completeTask(${t.id})" ${prog < 3 ? 'disabled' : ''}>${prog >= 3 ? 'Забрать награду' : `Пригласи ещё ${3 - prog}`}</button>
          </div>` : ''}
      </div>`;
  }

  if (t.type === 'channel_sub') {
    return `
      <div class="task ${done ? 'done' : ''}">
        ${_taskHead(t)}
        ${!done ? `
          <div class="task-actions">
            <a class="btn btn-ghost" href="${esc(t.url)}" target="_blank" onclick="openChannel('${esc(t.url)}')">Подписаться</a>
            <button class="btn btn-green" onclick="completeTask(${t.id})">Проверить</button>
          </div>` : ''}
      </div>`;
  }

  // Обычное задание
  return `
    <div class="task ${done ? 'done' : ''}">
      ${_taskHead(t, `<button class="btn btn-primary btn-sm" onclick="completeTask(${t.id})" ${t.url ? `data-url="${esc(t.url)}"` : ''}>${t.url ? 'Перейти' : 'Выполнить'}</button>`)}
    </div>`;
}

function openChannel(url) {
  if (tg?.openTelegramLink && url.includes('t.me')) {
    tg.openTelegramLink(url);
  }
}

let _taskCompleting = new Set();  // Debounce для задач

async function completeTask(taskId) {
  if (_taskCompleting.has(taskId)) return;  // Уже выполняется

  const btn = event?.target?.closest('button');
  const origText = btn?.textContent || '';
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  _taskCompleting.add(taskId);

  // Для обычных заданий с url — сначала открываем ссылку
  if (btn?.dataset?.url) {
    const url = btn.dataset.url;
    if (tg?.openTelegramLink && url.includes('t.me')) tg.openTelegramLink(url);
    else window.open(url, '_blank');
    await new Promise(r => setTimeout(r, 1500));
  }

  const res = await API.completeTask(taskId);
  _taskCompleting.delete(taskId);

  if (!res || res.__error) {
    showToast(res?.detail || 'Ошибка');
    if (btn) { btn.disabled = false; btn.textContent = origText; }
    return;
  }
  window.appState.balance = res.new_balance;
  updateBalance();
  showToast(`+${fmt(res.reward)} звёзд зачислено!`);
  renderTasksPage();
}
