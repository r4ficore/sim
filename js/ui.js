// js/ui.js
// Etap 2: UI zarządza światem, turą i statystykami.
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
    statPopulation: document.getElementById('stat-population')
  };
}

function updateStatsPanel(statTickEl, statPopulationEl) {
  if (!statTickEl || !statPopulationEl || !simulation) return;

  const { tick, population } = simulation.getStats();
  statTickEl.textContent = String(tick);
  statPopulationEl.textContent = String(population);
}

function renderWorldIfAvailable() {
  const world = simulation?.getWorld();
  if (world) {
    renderer.renderWorld(world);
  }
}

function attachButtonActions(dom) {
  dom.btnStart?.addEventListener('click', () => {
    console.log('[ui] Start → tworzę nowy świat i losową populację (Etap 2).');
    simulation.startNew();
    renderWorldIfAvailable();
    updateStatsPanel(dom.statTick, dom.statPopulation);
  });

  dom.btnStep?.addEventListener('click', () => {
    console.log(
      '[ui] Step → wykonuję turę: metabolizm, ruch i sprawdzenie śmierci (Etap 2).'
    );
    simulation.stepOnce();
    renderWorldIfAvailable();
    updateStatsPanel(dom.statTick, dom.statPopulation);
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
    renderer.renderPlaceholder(defaultConfig.worldWidth, defaultConfig.worldHeight);
    updateStatsPanel(dom.statTick, dom.statPopulation);
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

  renderer.renderPlaceholder(defaultConfig.worldWidth, defaultConfig.worldHeight);
  updateStatsPanel(dom.statTick, dom.statPopulation);

  attachButtonActions(dom);

  console.log('[ui] Interfejs gotowy – czekamy na kolejne etapy.');
}
