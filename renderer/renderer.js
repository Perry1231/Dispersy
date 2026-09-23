// Dispersy renderer: views, tasks, model graphs, prompt box.

const state = {
  tasks: [],          // { id, name, models: [...] }
  selectedId: null,   // selected task id
  view: 'home',       // 'home' | 'graphs'
};

const MODELS = ['Model A', 'Model B', 'Model C'];

const $ = (id) => document.getElementById(id);
const row = $('row');
const homeView = $('homeView');
const graphsView = $('graphsView');
const graphsEmpty = $('graphsEmpty');
const graphWrap = $('graphWrap');
const graphSvg = $('graphSvg');
const promptBox = $('promptBox');
const promptInput = $('promptInput');
const taskList = $('taskList');
const graphsBtn = $('graphsBtn');
const newTaskBtn = $('newTaskBtn');
const modelsBtn = $('modelsBtn');
const modelsWindow = $('modelsWindow');

const NS = 'http://www.w3.org/2000/svg';

// ---------- Views ----------

// The prompt box lives inside the active view.
function movePrompt() {
  (state.view === 'home' ? homeView : graphsView).appendChild(promptBox);
}

function showView(view) {
  state.view = view;
  homeView.classList.toggle('hidden', view !== 'home');
  graphsView.classList.toggle('hidden', view !== 'graphs');
  movePrompt();
  if (view === 'graphs') renderGraphsView();
  updateNav();
}

function updateNav() {
  graphsBtn.classList.toggle('is-active', state.view === 'graphs');
}

// ---------- Tasks ----------

function createTask(name) {
  const task = { id: 'task-' + Date.now(), name, models: [...MODELS] };
  state.tasks.push(task);
  state.selectedId = task.id;
  renderTaskList();
  showView('graphs');
}

function selectedTask() {
  return state.tasks.find((t) => t.id === state.selectedId) || null;
}

function renderTaskList() {
  taskList.innerHTML = '';
  if (state.tasks.length === 0) return;

  const label = document.createElement('p');
  label.className = 'side-label';
  label.textContent = 'Tasks';
  taskList.appendChild(label);

  for (const task of state.tasks) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'side-btn task-item' + (task.id === state.selectedId ? ' is-active' : '');
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<circle cx="6" cy="6.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="18" cy="9.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<circle cx="10.5" cy="17.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<path d="M8.3 7.4l7.4 1.3M7 8.6l2.6 6.8M16.9 11.5l-4.9 4.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
      '</svg>';
    const name = document.createElement('span');
    name.className = 'task-name';
    name.textContent = task.name;
    btn.appendChild(name);
    btn.addEventListener('click', () => {
      state.selectedId = task.id;
      renderTaskList();
      showView('graphs');
    });
    taskList.appendChild(btn);
  }
}

// ---------- Graph ----------

// Each model is a node placed on a ring; nodes are connected to each other.
function renderGraphsView() {
  const task = selectedTask();
  if (!task) {
    graphsEmpty.classList.remove('hidden');
    graphWrap.classList.add('hidden');
    graphSvg.innerHTML = '';
    return;
  }

  graphsEmpty.classList.add('hidden');
  graphWrap.classList.remove('hidden');
  graphSvg.innerHTML = '';

  const n = task.models.length;
  const cx = 300;
  const cy = 190;
  const rx = 210;
  const ry = 130;
  const r = 26;

  const pos = task.models.map((_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  });

  // Edges: every node connected to the next one (a ring).
  for (let i = 0; i < n; i++) {
    const a = pos[i];
    const b = pos[(i + 1) % n];
    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);
    line.setAttribute('class', 'graph-edge');
    graphSvg.appendChild(line);
  }

  // Nodes + labels.
  task.models.forEach((model, i) => {
    const p = pos[i];
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', p.x);
    circle.setAttribute('cy', p.y);
    circle.setAttribute('r', r);
    circle.setAttribute('class', 'graph-node');
    graphSvg.appendChild(circle);

    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', p.x);
    label.setAttribute('y', p.y + r + 18);
    label.setAttribute('class', 'graph-node-label');
    label.textContent = model;
    graphSvg.appendChild(label);
  });
}

// ---------- Prompt ----------

function truncate(text, max) {
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}

promptBox.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = promptInput.value.trim();
  if (!text) return;
  promptInput.value = '';
  createTask(truncate(text, 32));
});

// ---------- Buttons ----------

$('panelToggle').addEventListener('click', () => row.classList.toggle('collapsed'));

$('homeBtn').addEventListener('click', () => showView('home'));

newTaskBtn.addEventListener('click', () => createTask('Task ' + (state.tasks.length + 1)));

graphsBtn.addEventListener('click', () => showView('graphs'));

// Search is a placeholder for now.
$('searchBtn').addEventListener('click', () => {});

// ---------- Models window ----------

// Toggles the centered window; content will be added later.
function toggleModelsWindow(force) {
  const open = typeof force === 'boolean' ? force : modelsWindow.classList.contains('hidden');
  modelsWindow.classList.toggle('hidden', !open);
  modelsBtn.classList.toggle('is-active', open);
}

modelsBtn.addEventListener('click', () => toggleModelsWindow());

// Close on Escape or on a click outside the window.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') toggleModelsWindow(false);
});

document.addEventListener('mousedown', (e) => {
  if (modelsWindow.classList.contains('hidden')) return;
  if (!modelsWindow.contains(e.target) && !modelsBtn.contains(e.target)) {
    toggleModelsWindow(false);
  }
});

// ---------- Init ----------

showView('home');
