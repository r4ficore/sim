// js/ui.js
// Etapy 4–5: UI obsługuje rozmnażanie, walkę oraz autosymulację.
import { defaultConfig } from './config.js';
import { Simulation } from './simulation.js';
import { WorldRenderer } from './renderer.js';

const CONTROL_STATE = {
  INITIAL: 'initial',
  MANUAL: 'manual',
  AUTO: 'auto',
  FINISHED: 'finished'
};

let simulation = null;
let renderer = null;

function getDomElements() {
  return {
    canvas: document.getElementById('world-canvas'),
    btnStart: document.getElementById('btn-start'),
    btnStep: document.getElementById('btn-step'),
    btnStartAuto: document.getElementById('btn-start-auto'),
    btnPause: document.getElementById('btn-pause'),
    btnReset: document.getElementById('btn-reset'),
    statTick: document.getElementById('stat-tick'),
    statPopulation: document.getElementById('stat-population'),
    statFood: document.getElementById('stat-food'),
    statPoison: document.getElementById('stat-poison'),
    inputSpeed: document.getElementById('input-speed'),
    speedValue: document.getElementById('speed-value')
  };
}

function updateStatsPanel({ statTick, statPopulation, statFood, statPoison }) {
  if (!simulation) return;

  const { tick, population, food, poison } = simulation.getStats();

  if (statTick) statTick.textContent = String(tick);
  if (statPopulation) statPopulation.textContent = String(population);
  if (statFood) statFood.textContent = String(food);
  if (statPoison) statPoison.textContent = String(poison);
}

function renderWorldIfAvailable() {
  const world = simulation?.getWorld();
  if (world) {
    renderer.renderWorld(world);
  } else {
    const config = simulation?.getConfig() ?? defaultConfig;
    renderer.renderPlaceholder(config.worldWidth, config.worldHeight);
  }
}

function updateSpeedDisplay({ inputSpeed, speedValue }) {
  if (!simulation || !inputSpeed) return;

  const speed = simulation.getAutoSpeed();
  inputSpeed.value = String(speed);
  if (speedValue) {
    speedValue.textContent = speed.toFixed(1);
  }
}

function setupSpeedControl(dom) {
  const { inputSpeed } = dom;
  if (!inputSpeed) return;

  const min = defaultConfig.autoSpeedMin ?? 0.5;
  const max = defaultConfig.autoSpeedMax ?? 8;
  const step = defaultConfig.autoSpeedStep ?? 0.5;

  inputSpeed.min = String(min);
  inputSpeed.max = String(max);
  inputSpeed.step = String(step);
  inputSpeed.value = String(simulation.getAutoSpeed());

  inputSpeed.addEventListener('input', (event) => {
    const newSpeed = parseFloat(event.target.value);
    simulation.setSpeed(newSpeed);
    updateSpeedDisplay(dom);
  });
}

function setControlsState(dom, state) {
  const { btnStart, btnStep, btnStartAuto, btnPause, btnReset, inputSpeed } = dom;

  switch (state) {
    case CONTROL_STATE.INITIAL:
      btnStart?.removeAttribute('disabled');
      btnStep?.setAttribute('disabled', 'disabled');
      btnStartAuto?.setAttribute('disabled', 'disabled');
      btnPause?.setAttribute('disabled', 'disabled');
      btnReset?.setAttribute('disabled', 'disabled');
      inputSpeed?.setAttribute('disabled', 'disabled');
      break;
    case CONTROL_STATE.MANUAL:
      btnStart?.setAttribute('disabled', 'disabled');
      btnStep?.removeAttribute('disabled');
      btnStartAuto?.removeAttribute('disabled');
      btnPause?.setAttribute('disabled', 'disabled');
      btnReset?.removeAttribute('disabled');
      inputSpeed?.removeAttribute('disabled');
      break;
    case CONTROL_STATE.AUTO:
      btnStart?.setAttribute('disabled', 'disabled');
      btnStep?.setAttribute('disabled', 'disabled');
      btnStartAuto?.setAttribute('disabled', 'disabled');
      btnPause?.removeAttribute('disabled');
      btnReset?.removeAttribute('disabled');
      inputSpeed?.removeAttribute('disabled');
      break;
    case CONTROL_STATE.FINISHED:
      btnStart?.removeAttribute('disabled');
      btnStep?.setAttribute('disabled', 'disabled');
      btnStartAuto?.setAttribute('disabled', 'disabled');
      btnPause?.setAttribute('disabled', 'disabled');
      btnReset?.removeAttribute('disabled');
      inputSpeed?.setAttribute('disabled', 'disabled');
      break;
    default:
      break;
  }
}

function attachButtonActions(dom) {
  dom.btnStart?.addEventListener('click', () => {
    console.log('[ui] Start → tworzę nowy świat, populację oraz środowisko (Etap 4).');
    const world = simulation.startNew();
    renderWorldIfAvailable();
    updateStatsPanel(dom);
    updateSpeedDisplay(dom);
    if (world) {
      setControlsState(dom, CONTROL_STATE.MANUAL);
    }
  });

  dom.btnStep?.addEventListener('click', () => {
    console.log(
      '[ui] Step → metabolizm, ruch, środowisko, rozmnażanie i walka (Etap 4).' 
    );
    const world = simulation.stepOnce();
    if (!world) return;

    renderWorldIfAvailable();
    updateStatsPanel(dom);

    if (world.getAliveCount() === 0) {
      console.info('[ui] Wszystkie istoty zmarły – rozpocznij nowy świat lub zresetuj.');
      setControlsState(dom, CONTROL_STATE.FINISHED);
    }
  });

  dom.btnStartAuto?.addEventListener('click', () => {
    console.log('[ui] Start AUTO → uruchamiam autosymulację (Etap 5).');
    const started = simulation.startAuto(
      () => {
        renderWorldIfAvailable();
        updateStatsPanel(dom);
      },
      () => {
        renderWorldIfAvailable();
        updateStatsPanel(dom);
        const world = simulation.getWorld();
        if (world && world.getAliveCount() > 0) {
          setControlsState(dom, CONTROL_STATE.MANUAL);
        } else {
          setControlsState(dom, CONTROL_STATE.FINISHED);
        }
      }
    );

    if (started && simulation.isAutoRunning()) {
      setControlsState(dom, CONTROL_STATE.AUTO);
    }
  });

  dom.btnPause?.addEventListener('click', () => {
    if (!simulation.isAutoRunning()) {
      console.info('[ui] Pause → autotryb już jest zatrzymany.');
      return;
    }

    console.log('[ui] Pause → zatrzymuję autosymulację (Etap 5).');
    const stopped = simulation.stopAuto();
    if (!stopped) {
      return;
    }

    const world = simulation.getWorld();
    if (world && world.getAliveCount() > 0) {
      setControlsState(dom, CONTROL_STATE.MANUAL);
    } else {
      setControlsState(dom, CONTROL_STATE.FINISHED);
    }
    renderWorldIfAvailable();
    updateStatsPanel(dom);
  });

  dom.btnReset?.addEventListener('click', () => {
    console.log('[ui] Reset → czyszczenie sceny do stanu początkowego.');
    simulation.reset();
    renderWorldIfAvailable();
    updateStatsPanel(dom);
    updateSpeedDisplay(dom);
    setControlsState(dom, CONTROL_STATE.INITIAL);
  });
}

export function initUI() {
  const dom = getDomElements();

  if (!dom.canvas) {
    console.error('[ui] Nie znaleziono elementu canvas!');
    return;
  }

  simulation = new Simulation(defaultConfig);
  renderer = new WorldRenderer(dom.canvas, defaultConfig.cellSize);

  setupSpeedControl(dom);
  setControlsState(dom, CONTROL_STATE.INITIAL);
  renderWorldIfAvailable();
  updateStatsPanel(dom);
  updateSpeedDisplay(dom);

  attachButtonActions(dom);

  console.log('[ui] Interfejs gotowy – rozmnażanie, walka i autotryb włączone.');
}
