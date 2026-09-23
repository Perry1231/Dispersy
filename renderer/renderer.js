// Renderer-процес. Поки що — тільки показ версії в статус-барі.

if (window.dispersy) {
  window.dispersy.onAppInfo((info) => {
    const el = document.getElementById('app-version');
    if (el) el.textContent = `v${info.version} · ${info.platform}`;
  });
}
