// Dispersy renderer: views, tasks, model graphs, prompt box.

const state = {
  tasks: [],          // { id, name, models, createdAt, useCount, pinned, archived, positions }
  selectedId: null,   // selected task id
  view: 'home',       // 'home' | 'graphs'
  listMode: 'active', // 'active' | 'archive'
  sortBy: 'created',  // 'created' | 'used'
};

const MODELS = ['Model A', 'Model B', 'Model C'];

// Models picked while no task is selected — attached to the next created task.
let pendingModels = [];
let taskSeq = 0;
let hintTimer = 0;

const $ = (id) => document.getElementById(id);
const row = $('row');
const homeView = $('homeView');
const graphsView = $('graphsView');
const graphsEmpty = $('graphsEmpty');
const emptyTitle = $('emptyTitle');
const emptySub = $('emptySub');
const graphWrap = $('graphWrap');
const graphSvg = $('graphSvg');
const promptBox = $('promptBox');
const promptInput = $('promptInput');
const taskList = $('taskList');
const sideLabel = $('sideLabel');
const sortBtn = $('sortBtn');
const sortPop = $('sortPop');
const archiveToggleBtn = $('archiveToggleBtn');
const graphsBtn = $('graphsBtn');
const newTaskBtn = $('newTaskBtn');
const modelsBtn = $('modelsBtn');
const modelsOverlay = $('modelsOverlay');
const modelsWindow = $('modelsWindow');
const modelsClose = $('modelsClose');
const pickerBtn = $('modelPickerBtn');
const pickerCount = $('pickerCount');
const modelPop = $('modelPop');
const modelPopTitle = $('modelPopTitle');
const modelPopList = $('modelPopList');
const modelPopHint = $('modelPopHint');

const NS = 'http://www.w3.org/2000/svg';

// ---------- Icons ----------

const ICONS = {
  graph:
    '<circle cx="6" cy="6.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<circle cx="18" cy="9.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<circle cx="10.5" cy="17.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M8.3 7.4l7.4 1.3M7 8.6l2.6 6.8M16.9 11.5l-4.9 4.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
  pin:
    '<path d="M9 3.5h6l-.8 6.4 3.2 3.6H6.6l3.2-3.6L9 3.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M12 13.5V21" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  archive:
    '<path d="M2.5 3h19v5h-19z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M4.5 8v12.5h15V8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M10 12.5h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  restore:
    '<path d="M4.5 10v10.5h15V10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M12 15.5V4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
    '<path d="m8.5 8 3.5-3.5L15.5 8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  edit:
    '<path d="M17 3.5a2.1 2.1 0 0 1 3 3L8 18.5l-4 1 1-4L17 3.5Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  trash:
    '<path d="M3.5 6h17" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
    '<path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M5.5 6l1 13.5a1.5 1.5 0 0 0 1.5 1.4h8a1.5 1.5 0 0 0 1.5-1.4l1-13.5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M10 10.5v6M14 10.5v6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  gear:
    '<circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  plus:
    '<path d="M12 5.5v13M5.5 12h13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  check:
    '<path d="m5 13 4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
};

const icon = (name) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + '</svg>';

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
  updatePickerBadge();
  if (!modelPop.classList.contains('hidden')) renderModelPop();
}

function updateNav() {
  graphsBtn.classList.toggle('is-active', state.view === 'graphs');
}

// ---------- Tasks ----------

function createTask(name, models = []) {
  taskSeq += 1;
  const task = {
    id: 'task-' + Date.now() + '-' + taskSeq,
    name,
    models: [...models],
    createdAt: Date.now(),
    useCount: 1,
    pinned: false,
    archived: false,
    positions: {}, // model name -> { x, y } in graph coordinates
  };
  state.tasks.push(task);
  state.selectedId = task.id;
  renderTaskList();
  showView('graphs');
  return task;
}

function selectedTask() {
  return state.tasks.find((t) => t.id === state.selectedId) || null;
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  if (state.selectedId === id) {
    const next = state.tasks.find((t) => !t.archived);
    state.selectedId = next ? next.id : null;
  }
  renderTaskList();
  renderGraphsView();
}

function setArchived(task, archived) {
  task.archived = archived;
  renderTaskList();
}

// Tasks shown in the sidebar for the current list mode; pinned ones stay on top.
function visibleTasks() {
  const inArchive = state.listMode === 'archive';
  const list = state.tasks.filter((t) => t.archived === inArchive);
  const by = (a, b) => (state.sortBy === 'used' ? b.useCount - a.useCount : b.createdAt - a.createdAt);
  if (inArchive) return list.sort(by);
  return list.sort((a, b) => Number(b.pinned) - Number(a.pinned) || by(a, b));
}

function renderTaskList() {
  const archivedMode = state.listMode === 'archive';
  sideLabel.textContent = archivedMode ? 'Archive' : 'Tasks';
  archiveToggleBtn.classList.toggle('is-active', archivedMode);
  archiveToggleBtn.title = archivedMode ? 'Back to tasks' : 'Archived tasks';
  updateSortPop();

  taskList.innerHTML = '';
  const list = visibleTasks();
  if (list.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'side-empty';
    empty.textContent = archivedMode ? 'No archived tasks yet' : 'No tasks yet';
    taskList.appendChild(empty);
  } else {
    for (const task of list) taskList.appendChild(buildTaskItem(task));
  }

  updatePickerBadge();
  if (!modelPop.classList.contains('hidden')) renderModelPop();
}

function buildTaskItem(task) {
  const archivedMode = state.listMode === 'archive';
  const item = document.createElement('div');
  item.className = 'side-btn task-item' + (task.id === state.selectedId ? ' is-active' : '');
  item.innerHTML = icon('graph');

  const name = document.createElement('span');
  name.className = 'task-name';
  name.textContent = task.name;
  item.appendChild(name);

  if (task.pinned && !archivedMode) {
    const mark = document.createElement('span');
    mark.className = 'task-pin-mark';
    mark.title = 'Pinned';
    mark.innerHTML = icon('pin');
    item.appendChild(mark);
  }

  item.addEventListener('click', (e) => {
    if (e.target.closest('.task-actions')) return;
    task.useCount += 1;
    state.selectedId = task.id;
    renderTaskList();
    showView('graphs');
  });

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const addAction = (iconName, title, handler, extraClass = '') => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'task-action' + extraClass;
    btn.title = title;
    btn.setAttribute('aria-label', title);
    btn.innerHTML = icon(iconName);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handler();
    });
    actions.appendChild(btn);
  };

  if (archivedMode) {
    addAction('restore', 'Unarchive', () => setArchived(task, false));
    addAction('trash', 'Delete', () => deleteTask(task.id));
  } else {
    addAction('pin', task.pinned ? 'Unpin' : 'Pin to top', () => {
      task.pinned = !task.pinned;
      renderTaskList();
    }, task.pinned ? ' is-on' : '');
    addAction('archive', 'Archive', () => setArchived(task, true));
    addAction('edit', 'Rename', () => startRename(task, item, name));
    addAction('trash', 'Delete', () => deleteTask(task.id));
  }

  item.appendChild(actions);
  return item;
}

// Swaps the task name for an inline input; Enter/blur saves, Escape cancels.
function startRename(task, item, nameEl) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-rename';
  input.value = task.name;
  nameEl.replaceWith(input);
  input.focus();
  input.select();

  let done = false;
  const finish = (save) => {
    if (done) return;
    done = true;
    const value = input.value.trim();
    if (save && value) task.name = value;
    renderTaskList();
  };

  input.addEventListener('click', (e) => e.stopPropagation());
  input.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') finish(true);
    else if (e.key === 'Escape') finish(false);
  });
  input.addEventListener('blur', () => finish(true));
}

// ---------- Graph ----------

// Live state of the rendered graph; reset on every re-render.
let graphNodes = [];   // { model, base, offset, target, el, label }
let graphEdges = [];   // { a, b, el }
let graphApply = null; // positions updater of the current render
let drag = null;       // { node, startSvg, startBase }
let animFrame = null;  // repulsion animation loop

const NODE_R = 26;
const VB_W = 600;
const VB_H = 400;

function stopGraphAnim() {
  if (animFrame != null) {
    cancelAnimationFrame(animFrame);
    animFrame = null;
  }
}

// Nodes appear only when the task has connected models.
function renderGraphsView() {
  stopGraphAnim();
  drag = null;
  graphNodes = [];
  graphEdges = [];
  graphApply = null;

  const task = selectedTask();
  if (!task || task.models.length === 0) {
    graphsEmpty.classList.remove('hidden');
    graphWrap.classList.add('hidden');
    graphSvg.innerHTML = '';
    emptyTitle.textContent = task ? 'No models connected' : 'No task selected';
    emptySub.textContent = task
      ? 'Use the models button on the prompt bar to connect models.'
      : 'Start a new task to see its graph.';
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

  graphNodes = task.models.map((model, i) => {
    const saved = task.positions[model];
    if (saved) {
      return { model, base: { ...saved }, offset: { x: 0, y: 0 }, target: { x: 0, y: 0 }, el: null, label: null };
    }
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return {
      model,
      base: { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) },
      offset: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      el: null,
      label: null,
    };
  });

  // Edges: every node connected to the next one (a ring; two nodes share one line).
  if (n >= 2) {
    const edgeCount = n === 2 ? 1 : n;
    for (let i = 0; i < edgeCount; i++) {
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('class', 'graph-edge');
      graphSvg.appendChild(line);
      graphEdges.push({ a: graphNodes[i], b: graphNodes[(i + 1) % n], el: line });
    }
  }

  for (const node of graphNodes) {
    const circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('r', NODE_R);
    circle.setAttribute('class', 'graph-node');
    graphSvg.appendChild(circle);

    const label = document.createElementNS(NS, 'text');
    label.setAttribute('class', 'graph-node-label');
    label.textContent = node.model;
    graphSvg.appendChild(label);

    node.el = circle;
    node.label = label;
    attachNodeDrag(node);
  }

  graphApply = applyGraphPositions;
  applyGraphPositions();
}

function applyGraphPositions() {
  for (const node of graphNodes) {
    const x = node.base.x + node.offset.x;
    const y = node.base.y + node.offset.y;
    node.el.setAttribute('cx', x);
    node.el.setAttribute('cy', y);
    node.label.setAttribute('x', x);
    node.label.setAttribute('y', Math.min(y + NODE_R + 18, VB_H - 8));
  }
  for (const edge of graphEdges) {
    edge.el.setAttribute('x1', edge.a.base.x + edge.a.offset.x);
    edge.el.setAttribute('y1', edge.a.base.y + edge.a.offset.y);
    edge.el.setAttribute('x2', edge.b.base.x + edge.b.offset.x);
    edge.el.setAttribute('y2', edge.b.base.y + edge.b.offset.y);
  }
}

function toSvgPoint(clientX, clientY) {
  const ctm = graphSvg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

// Draggable nodes: edges follow the dragged node; nearby nodes are pushed away
// slightly while it approaches and spring back after the drag ends.
function attachNodeDrag(node) {
  const INFLUENCE = 280;   // radius in which neighbours react (start early, before contact)
  const PUSH = 60;         // maximum push distance
  const ELASTIC = 280;     // beyond this distance connected neighbours are pulled along
  const ELASTIC_K = 0.15;  // pull strength per unit of stretch
  const ELASTIC_MAX = 56;  // maximum pull distance

  // Neighbours joined by an edge (they follow the dragged node when it goes far).
  const linked = new Set();
  for (const edge of graphEdges) {
    if (edge.a === node) linked.add(edge.b);
    if (edge.b === node) linked.add(edge.a);
  }

  node.el.addEventListener('pointerdown', (e) => {
    if (drag) return;
    e.preventDefault();
    // Synthetic events (tests) have no active pointer, so capture can fail.
    try { node.el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    drag = { node, startSvg: toSvgPoint(e.clientX, e.clientY), startBase: { ...node.base } };
    node.el.classList.add('dragging');
    startGraphAnim();
  });

  node.el.addEventListener('pointermove', (e) => {
    if (!drag || drag.node !== node) return;
    const p = toSvgPoint(e.clientX, e.clientY);
    node.base.x = Math.min(VB_W - NODE_R - 6, Math.max(NODE_R + 6, drag.startBase.x + (p.x - drag.startSvg.x)));
    node.base.y = Math.min(VB_H - NODE_R - 6, Math.max(NODE_R + 6, drag.startBase.y + (p.y - drag.startSvg.y)));

    for (const other of graphNodes) {
      if (other === node) continue;
      const dx = other.base.x - node.base.x;
      const dy = other.base.y - node.base.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < INFLUENCE) {
        // Nearby: move away from the dragged node.
        const f = (1 - dist / INFLUENCE) * PUSH;
        other.target.x = (dx / dist) * f;
        other.target.y = (dy / dist) * f;
      } else if (linked.has(other) && dist > ELASTIC) {
        // Far away: the connection stretches and pulls the neighbour along a bit.
        const pull = Math.min((dist - ELASTIC) * ELASTIC_K, ELASTIC_MAX);
        other.target.x = -(dx / dist) * pull;
        other.target.y = -(dy / dist) * pull;
      } else {
        other.target.x = 0;
        other.target.y = 0;
      }
    }
    // The dragged node follows the pointer immediately, not on the next frame.
    if (graphApply) graphApply();
    startGraphAnim();
  });

  const end = () => {
    if (!drag || drag.node !== node) return;
    drag = null;
    node.el.classList.remove('dragging');
    for (const other of graphNodes) {
      other.target.x = 0;
      other.target.y = 0;
    }
    const task = selectedTask();
    if (task) {
      for (const nd of graphNodes) task.positions[nd.model] = { x: nd.base.x, y: nd.base.y };
    }
    startGraphAnim();
  };
  node.el.addEventListener('pointerup', end);
  node.el.addEventListener('pointercancel', end);
}

// Smoothly moves neighbour offsets toward their targets; runs only while needed.
function startGraphAnim() {
  if (animFrame != null) return;
  const step = () => {
    let active = drag != null;
    for (const node of graphNodes) {
      node.offset.x += (node.target.x - node.offset.x) * 0.45;
      node.offset.y += (node.target.y - node.offset.y) * 0.45;
      if (Math.abs(node.target.x - node.offset.x) < 0.15 && Math.abs(node.target.y - node.offset.y) < 0.15) {
        node.offset.x = node.target.x;
        node.offset.y = node.target.y;
      } else {
        active = true;
      }
    }
    if (graphApply) graphApply();
    animFrame = active ? requestAnimationFrame(step) : null;
  };
  animFrame = requestAnimationFrame(step);
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
  createTask(truncate(text, 32), pendingModels);
  pendingModels = [];
});

// ---------- Model picker (prompt bar) ----------

// On the graphs view the picker edits the selected task's models; on the home
// view it prepares models for the task the next prompt will create.
function pickerTask() {
  return state.view === 'graphs' ? selectedTask() : null;
}

function toggleModelPop(force) {
  const open = typeof force === 'boolean' ? force : modelPop.classList.contains('hidden');
  modelPop.classList.toggle('hidden', !open);
  pickerBtn.classList.toggle('is-open', open);
  if (open) renderModelPop();
}

function renderModelPop() {
  const task = pickerTask();
  const active = task ? task.models : pendingModels;
  modelPopTitle.textContent = task ? 'Models — ' + truncate(task.name, 18) : 'Models — new task';
  modelPopTitle.title = task ? task.name : '';

  modelPopList.innerHTML = '';
  for (const model of MODELS) {
    const row = document.createElement('div');
    row.className = 'model-row';

    const name = document.createElement('span');
    name.className = 'model-name';
    name.textContent = model;
    row.appendChild(name);

    const added = active.includes(model);
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'add-btn' + (added ? ' is-added' : '');
    add.innerHTML = icon(added ? 'check' : 'plus');
    add.appendChild(document.createTextNode(added ? 'Added' : 'Add'));
    add.addEventListener('click', () => {
      if (task) {
        const idx = task.models.indexOf(model);
        if (idx === -1) task.models.push(model);
        else task.models.splice(idx, 1);
        if (state.view === 'graphs' && state.selectedId === task.id) renderGraphsView();
      } else {
        const idx = pendingModels.indexOf(model);
        if (idx === -1) pendingModels.push(model);
        else pendingModels.splice(idx, 1);
      }
      renderModelPop();
      updatePickerBadge();
    });    row.appendChild(add);

    const gear = document.createElement('button');
    gear.type = 'button';
    gear.className = 'gear-btn';
    gear.title = 'Model settings';
    gear.setAttribute('aria-label', 'Model settings');
    gear.innerHTML = icon('gear');
    gear.addEventListener('click', () => {
      modelPopHint.classList.remove('hidden');
      clearTimeout(hintTimer);
      hintTimer = setTimeout(() => modelPopHint.classList.add('hidden'), 1800);
    });
    row.appendChild(gear);

    modelPopList.appendChild(row);
  }
}

function updatePickerBadge() {
  const task = pickerTask();
  const count = (task ? task.models : pendingModels).length;
  pickerCount.textContent = String(count);
  pickerCount.classList.toggle('hidden', count === 0);
}

pickerBtn.addEventListener('click', () => toggleModelPop());

// ---------- Task sorting ----------

function updateSortPop() {
  for (const opt of sortPop.querySelectorAll('.sort-option')) {
    opt.classList.toggle('is-current', opt.dataset.sort === state.sortBy);
  }
}

sortBtn.addEventListener('click', () => {
  const open = sortPop.classList.contains('hidden');
  sortPop.classList.toggle('hidden', !open);
  sortBtn.classList.toggle('is-open', open);
  if (open) updateSortPop();
});

for (const opt of sortPop.querySelectorAll('.sort-option')) {
  opt.addEventListener('click', () => {
    state.sortBy = opt.dataset.sort;
    updateSortPop();
    sortPop.classList.add('hidden');
    sortBtn.classList.remove('is-open');
    renderTaskList();
  });
}

archiveToggleBtn.addEventListener('click', () => {
  state.listMode = state.listMode === 'active' ? 'archive' : 'active';
  renderTaskList();
});

// ---------- Buttons ----------

$('panelToggle').addEventListener('click', () => row.classList.toggle('collapsed'));

$('homeBtn').addEventListener('click', () => showView('home'));

newTaskBtn.addEventListener('click', () => {
  createTask('Task ' + (state.tasks.length + 1), pendingModels);
  pendingModels = [];
});

graphsBtn.addEventListener('click', () => showView('graphs'));

// Search is a placeholder for now.
$('searchBtn').addEventListener('click', () => {});

// ---------- Models window ----------

// Toggles the centered window over a blurred backdrop; content added later.
function toggleModelsWindow(force) {
  const open = typeof force === 'boolean' ? force : modelsOverlay.classList.contains('hidden');
  modelsOverlay.classList.toggle('hidden', !open);
  modelsBtn.classList.toggle('is-active', open);
}

modelsBtn.addEventListener('click', () => toggleModelsWindow());

modelsClose.addEventListener('click', () => toggleModelsWindow(false));

// Close popups and the models window on Escape.
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  toggleModelsWindow(false);
  toggleModelPop(false);
  sortPop.classList.add('hidden');
  sortBtn.classList.remove('is-open');
});

// Close the popups when clicking anywhere outside of them.
document.addEventListener('pointerdown', (e) => {
  if (!modelPop.classList.contains('hidden') && !modelPop.contains(e.target) && !pickerBtn.contains(e.target)) {
    toggleModelPop(false);
  }
  if (!sortPop.classList.contains('hidden') && !sortPop.contains(e.target) && !sortBtn.contains(e.target)) {
    sortPop.classList.add('hidden');
    sortBtn.classList.remove('is-open');
  }
});

modelsOverlay.addEventListener('mousedown', (e) => {
  if (e.target === modelsOverlay) toggleModelsWindow(false);
});

// ---------- Init ----------

renderTaskList();
showView('home');
