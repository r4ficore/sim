// js/ui.js
// Etap 3: UI aktualizuje statystyki środowiska po każdym kroku.
// Etap 2: UI zarządza światem, turą i statystykami.
// Etap 1: UI zarządza światem i statyczną populacją.
import { defaultConfig } from './config.js';
import { Simulation } from './simulation.js';
import { WorldRenderer } from './renderer.js';

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
    statPoison: document.getElementById('stat-poison')
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

function setControlsState(dom, state) {
  const { btnStart, btnStep, btnStartAuto, btnPause, btnReset } = dom;

  if (state === 'initial') {
    btnStart?.removeAttribute('disabled');
    btnStep?.setAttribute('disabled', 'disabled');
    btnStartAuto?.setAttribute('disabled', 'disabled');
    btnPause?.setAttribute('disabled', 'disabled');
    btnReset?.setAttribute('disabled', 'disabled');
    return;
  }

  if (state === 'running') {
    btnStart?.setAttribute('disabled', 'disabled');
    btnStep?.removeAttribute('disabled');
    btnStartAuto?.setAttribute('disabled', 'disabled');
    btnPause?.setAttribute('disabled', 'disabled');
    btnReset?.removeAttribute('disabled');
  }

  if (state === 'stopped') {
    btnStart?.removeAttribute('disabled');
    btnStep?.setAttribute('disabled', 'disabled');
    btnStartAuto?.setAttribute('disabled', 'disabled');
    btnPause?.setAttribute('disabled', 'disabled');
    btnReset?.setAttribute('disabled', 'disabled');
  }
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

function setControlsState(dom, state) {
  const { btnStart, btnStep, btnStartAuto, btnPause, btnReset } = dom;

  if (state === 'initial') {
    btnStart?.removeAttribute('disabled');
    btnStep?.setAttribute('disabled', 'disabled');
    btnStartAuto?.setAttribute('disabled', 'disabled');
    btnPause?.setAttribute('disabled', 'disabled');
    btnReset?.setAttribute('disabled', 'disabled');
    return;
  }

  if (state === 'running') {
    btnStart?.setAttribute('disabled', 'disabled');
    btnStep?.removeAttribute('disabled');
    btnStartAuto?.setAttribute('disabled', 'disabled');
    btnPause?.setAttribute('disabled', 'disabled');
    btnReset?.removeAttribute('disabled');
  }

  if (state === 'stopped') {
    btnStart?.removeAttribute('disabled');
    btnStep?.setAttribute('disabled', 'disabled');
    btnStartAuto?.setAttribute('disabled', 'disabled');
    btnPause?.setAttribute('disabled', 'disabled');
    btnReset?.setAttribute('disabled', 'disabled');
  }
}

function attachButtonActions(dom) {
  dom.btnStart?.addEventListener('click', () => {
    console.log('[ui] Start → tworzę nowy świat i losową populację (Etap 3).');
    const world = simulation.startNew();
    renderWorldIfAvailable();
    updateStatsPanel(dom);
    console.log('[ui] Start → tworzę nowy świat i losową populację (Etap 2).');
    const world = simulation.startNew();
    console.log('[ui] Start → tworzę nowy świat i losową populację (Etap 1).');
    simulation.startNew();
    renderWorldIfAvailable();
    updateStatsPanel(dom.statTick, dom.statPopulation);
    if (world) {
      setControlsState(dom, 'running');
    }
  });

  dom.btnStep?.addEventListener('click', () => {
    console.log(
      '[ui] Step → wykonuję turę: metabolizm, ruch, środowisko i śmierć (Etap 3).'
      '[ui] Step → wykonuję turę: metabolizm, ruch i sprawdzenie śmierci (Etap 2).'
    );
    const world = simulation.stepOnce();
    if (!world) return;

    renderWorldIfAvailable();
    updateStatsPanel(dom);
    console.log('[ui] Step → logika tury pojawi się w Etapie 2.');
    simulation.stepOnce();
    renderWorldIfAvailable();
    updateStatsPanel(dom.statTick, dom.statPopulation);

    if (world.getAliveCount() === 0) {
      console.info('[ui] Wszystkie istoty zmarły – wróć do stanu początkowego.');
      setControlsState(dom, 'stopped');
    }
  });

  dom.btnStartAuto?.addEventListener('click', () => {
    console.log('[ui] Start AUTO → funkcja pojawi się w późniejszym etapie.');
    simulation.startAuto();
  });

  dom.btnPause?.addEventListener('click', () => {
    console.log('[ui] Pause → zatrzymam autosymulację gdy będzie gotowa.');
    simulation.stopAuto();
  });

  dom.btnReset?.addEventListener('click', () => {
    console.log('[ui] Reset → czyszczenie sceny do stanu początkowego.');
    simulation.reset();
    renderWorldIfAvailable();
    updateStatsPanel(dom);
    updateStatsPanel(dom.statTick, dom.statPopulation);
    setControlsState(dom, 'initial');
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

  setControlsState(dom, 'initial');
  renderWorldIfAvailable();
  updateStatsPanel(dom);
  updateStatsPanel(dom.statTick, dom.statPopulation);

  attachButtonActions(dom);

  console.log('[ui] Interfejs gotowy – środowisko aktywne od Etapu 3.');
}
