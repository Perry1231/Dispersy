// Sidebar interactions.

const row = document.getElementById('row');

// Show / hide the sidebar.
document.getElementById('panelToggle').addEventListener('click', () => {
  row.classList.toggle('collapsed');
});

// "Dispersy" returns to the home screen (the empty work area for now).
document.getElementById('homeBtn').addEventListener('click', () => {
  document.querySelectorAll('.nav-item.is-active').forEach((el) => el.classList.remove('is-active'));
});

// Nav items keep a selected state.
document.querySelectorAll('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item.is-active').forEach((el) => el.classList.remove('is-active'));
    btn.classList.add('is-active');
  });
});
