// js/ui.js
import { defaultConfig } from './config.js';
import { Simulation } from './simulation.js';
import { WorldRenderer } from './renderer.js';

let simulation = null;
let renderer = null;

export function initUI() {
  console.log('[ui] initUI start');

  const canvas = document.getElementById('world-canvas');
  const btnStart = document.getElementById('btn-start');
  const btnStep = document.getElementById('btn-step');
  const btnStartAuto = document.getElementById('btn-start-auto');
  const btnPause = document.getElementById('btn-pause');
  const btnReset = document.getElementById('btn-reset');

  const statTick = document.getElementById('stat-tick');
  const statPopulation = document.getElementById('stat-population');

  if (!canvas) {
    console.error('[ui] Nie znaleziono canvasu!');
    return;
  }

  simulation = new Simulation();
  renderer = new WorldRenderer(canvas, defaultConfig.cellSize);

  // Na start – pusta siatka
  renderer.renderEmptyGrid(defaultConfig.worldWidth, defaultConfig.worldHeight);
  updateStats();

  function updateStats() {
    if (!simulation.world) {
      if (statTick) statTick.textContent = '0';
      if (statPopulation) statPopulation.textContent = '0';
      return;
    }

    if (statTick) {
      statTick.textContent = String(simulation.world.tick);
    }
    if (statPopulation) {
      statPopulation.textContent = String(simulation.world.creatures.length);
    }
  }

  function startWorld() {
    console.log('[ui] Tworzenie nowego świata...');
    simulation.createWorld();
    renderer.renderWorld(simulation.world);
    updateStats();
  }

  btnStart?.addEventListener('click', () => {
    console.log('[ui] Start clicked – tworzymy świat i rysujemy populację');
    startWorld();
  });

  btnStep?.addEventListener('click', () => {
    console.log('[ui] Step clicked – tura (na razie tylko tick++)');

    if (!simulation.world) {
      // jeśli ktoś kliknie Step przed Start → najpierw zbuduj świat
      startWorld();
      return;
    }

    simulation.step();
    renderer.renderWorld(simulation.world);
    updateStats();
  });

  btnStartAuto?.addEventListener('click', () => {
    console.log('[ui] Start AUTO clicked – autosymulacja będzie w późniejszym etapie');
  });

  btnPause?.addEventListener('click', () => {
    console.log('[ui] Pause clicked – pauza/autosymulacja dopiero w kolejnych etapach');
  });

  btnReset?.addEventListener('click', () => {
    console.log('[ui] Reset clicked – czyszczę świat');

    simulation = new Simulation();
    renderer.renderEmptyGrid(defaultConfig.worldWidth, defaultConfig.worldHeight);
    updateStats();
  });

  console.log('[ui] initUI done');
}
