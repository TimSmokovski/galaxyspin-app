// ===== CONTESTS PAGE =====
function renderContestsPage() {
  const page = document.getElementById('page-contests');

  page.innerHTML = `
    <div class="page-head">
      <h1>Розыгрыши</h1>
      <p>Выигрывайте подарки абсолютно бесплатно!</p>
    </div>
    <div class="card">
      <div class="empty-big">
        <svg class="empty-ico"><use href="#i-trophy"/></svg>
        <h3>Скоро</h3>
        <p>Розыгрыши появятся совсем скоро. Следите за обновлениями!</p>
      </div>
    </div>
  `;
}
