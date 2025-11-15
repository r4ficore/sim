// js/ui.js
// UI z panelem konfiguracji, autosymulacją oraz inspekcją organizmów.
import { defaultConfig } from './config.js';
import { Simulation } from './simulation.js';
import { WorldRenderer } from './renderer.js';

const CONTROL_STATE = {
  INITIAL: 'initial',
  MANUAL: 'manual',
  AUTO: 'auto',
  FINISHED: 'finished'
};

const CONFIG_FIELD_DEFINITIONS = [
  { id: 'input-world-width', key: 'worldWidth', type: 'int', min: 10, max: 120, affectsCanvas: true },
  { id: 'input-world-height', key: 'worldHeight', type: 'int', min: 10, max: 120, affectsCanvas: true },
  { id: 'input-initial-population', key: 'initialPopulation', type: 'int', min: 0, max: 400 },
  { id: 'input-initial-energy-min', key: 'initialEnergyMin', type: 'int', min: 1, max: 400 },
  { id: 'input-initial-energy-max', key: 'initialEnergyMax', type: 'int', min: 1, max: 500 },
  { id: 'input-metabolism', key: 'metabolismCost', type: 'float', min: 0, max: 25 },
  { id: 'input-food-spawn', key: 'foodSpawnAttempts', type: 'int', min: 0, max: 50 },
  { id: 'input-poison-spawn', key: 'poisonSpawnAttempts', type: 'int', min: 0, max: 50 },
  { id: 'input-max-food', key: 'maxFoodOnMap', type: 'int', min: 0, max: 800 },
  { id: 'input-max-poison', key: 'maxPoisonOnMap', type: 'int', min: 0, max: 800 },
  { id: 'input-reproduction-threshold', key: 'reproductionEnergyThreshold', type: 'int', min: 0, max: 400 },
  { id: 'input-reproduction-cost', key: 'reproductionEnergyCost', type: 'int', min: 0, max: 400 },
  { id: 'input-reproduction-cooldown', key: 'reproductionCooldownTicks', type: 'int', min: 0, max: 200 },
  { id: 'input-reproduction-offspring', key: 'reproductionOffspringEnergy', type: 'int', min: 1, max: 400 },
  { id: 'input-fight-penalty', key: 'fightEnergyPenalty', type: 'int', min: 0, max: 400 },
  { id: 'input-fight-reward', key: 'fightEnergyReward', type: 'int', min: 0, max: 400 },
  { id: 'input-auto-speed-default', key: 'autoTicksPerSecond', type: 'float', min: 0.1, max: 20 }
];

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
    btnConfigDefaults: document.getElementById('btn-config-defaults'),
    statTick: document.getElementById('stat-tick'),
    statPopulation: document.getElementById('stat-population'),
    statFood: document.getElementById('stat-food'),
    statPoison: document.getElementById('stat-poison'),
    inputSpeed: document.getElementById('input-speed'),
    speedValue: document.getElementById('speed-value'),
    configForm: document.getElementById('config-form'),
    selectedId: document.getElementById('selected-id'),
    selectedSex: document.getElementById('selected-sex'),
    selectedGeneration: document.getElementById('selected-generation'),
    selectedAge: document.getElementById('selected-age'),
    selectedEnergy: document.getElementById('selected-energy'),
    geneVision: document.getElementById('gene-vision'),
    geneFood: document.getElementById('gene-food'),
    genePoison: document.getElementById('gene-poison'),
    geneMate: document.getElementById('gene-mate'),
    geneCrowd: document.getElementById('gene-crowd'),
    geneLowEnergy: document.getElementById('gene-low-energy'),
    geneReproduce: document.getElementById('gene-reproduce')
  };
}

function getCurrentConfigSnapshot() {
  if (simulation) {
    return simulation.getConfig();
  }
  return { ...defaultConfig };
}

function sanitizeValue(fieldDef, rawValue) {
  if (rawValue === '' || rawValue === null || rawValue === undefined) {
    return null;
  }

  const parsed = fieldDef.type === 'float' ? parseFloat(rawValue) : parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  let value = parsed;
  if (typeof fieldDef.min === 'number') {
    value = Math.max(fieldDef.min, value);
  }
  if (typeof fieldDef.max === 'number') {
    value = Math.min(fieldDef.max, value);
  }
  if (fieldDef.type === 'int') {
    value = Math.round(value);
  }
  return value;
}

function populateConfigForm(dom, sourceConfig) {
  const { configForm } = dom;
  if (!configForm) return;

  CONFIG_FIELD_DEFINITIONS.forEach((field) => {
    const input = configForm.querySelector(`#${field.id}`);
    if (!input) return;

    const value = sourceConfig[field.key];
    if (value !== undefined && value !== null) {
      input.value = String(value);
    }
  });
}

function readConfigOverrides(dom, options = {}) {
  const { configForm } = dom;
  const { commitValues = true } = options;
  const currentConfig = getCurrentConfigSnapshot();
  const overrides = {};

  if (!configForm) {
    return overrides;
  }

  CONFIG_FIELD_DEFINITIONS.forEach((field) => {
    const input = configForm.querySelector(`#${field.id}`);
    if (!input) return;

    const sanitized = sanitizeValue(field, input.value);
    const fallback = currentConfig[field.key] ?? defaultConfig[field.key];
    const finalValue = sanitized ?? fallback;

    overrides[field.key] = finalValue;

    if (!commitValues) {
      return;
    }

    if (sanitized !== null && Number.isFinite(sanitized)) {
      input.value = String(sanitized);
    } else if (Number.isFinite(finalValue)) {
      input.value = String(finalValue);
    }
  });

  if (commitValues) {
    if (
      overrides.initialEnergyMin !== undefined &&
      overrides.initialEnergyMax !== undefined &&
      overrides.initialEnergyMin > overrides.initialEnergyMax
    ) {
      const temp = overrides.initialEnergyMin;
      overrides.initialEnergyMin = overrides.initialEnergyMax;
      overrides.initialEnergyMax = temp;
      const minInput = configForm.querySelector('#input-initial-energy-min');
      const maxInput = configForm.querySelector('#input-initial-energy-max');
      if (minInput) minInput.value = String(overrides.initialEnergyMin);
      if (maxInput) maxInput.value = String(overrides.initialEnergyMax);
    }

    if (overrides.worldWidth !== undefined && overrides.worldHeight !== undefined) {
      const maxPopulation = overrides.worldWidth * overrides.worldHeight;
      if (overrides.initialPopulation !== undefined) {
        overrides.initialPopulation = Math.max(
          0,
          Math.min(overrides.initialPopulation, maxPopulation)
        );
        const popInput = configForm.querySelector('#input-initial-population');
        if (popInput) {
          popInput.value = String(overrides.initialPopulation);
        }
      }
      if (overrides.maxFoodOnMap !== undefined) {
        overrides.maxFoodOnMap = Math.min(overrides.maxFoodOnMap, maxPopulation);
        const foodInput = configForm.querySelector('#input-max-food');
        if (foodInput) {
          foodInput.value = String(overrides.maxFoodOnMap);
        }
      }
      if (overrides.maxPoisonOnMap !== undefined) {
        overrides.maxPoisonOnMap = Math.min(overrides.maxPoisonOnMap, maxPopulation);
        const poisonInput = configForm.querySelector('#input-max-poison');
        if (poisonInput) {
          poisonInput.value = String(overrides.maxPoisonOnMap);
        }
      }
    }
  }

  return overrides;
}

function updateStatsPanel(dom) {
  if (!simulation) return;

  const { statTick, statPopulation, statFood, statPoison } = dom;
  const { tick, population, food, poison } = simulation.getStats();

  if (statTick) statTick.textContent = String(tick);
  if (statPopulation) statPopulation.textContent = String(population);
  if (statFood) statFood.textContent = String(food);
  if (statPoison) statPoison.textContent = String(poison);
}

function updateSelectedCreaturePanel(dom, creature) {
  const {
    selectedId,
    selectedSex,
    selectedGeneration,
    selectedAge,
    selectedEnergy,
    geneVision,
    geneFood,
    genePoison,
    geneMate,
    geneCrowd,
    geneLowEnergy,
    geneReproduce
  } = dom;

  if (!creature) {
    if (selectedId) selectedId.textContent = '—';
    if (selectedSex) selectedSex.textContent = '—';
    if (selectedGeneration) selectedGeneration.textContent = '—';
    if (selectedAge) selectedAge.textContent = '—';
    if (selectedEnergy) selectedEnergy.textContent = '—';
    if (geneVision) geneVision.textContent = '—';
    if (geneFood) geneFood.textContent = '—';
    if (genePoison) genePoison.textContent = '—';
    if (geneMate) geneMate.textContent = '—';
    if (geneCrowd) geneCrowd.textContent = '—';
    if (geneLowEnergy) geneLowEnergy.textContent = '—';
    if (geneReproduce) geneReproduce.textContent = '—';
    return;
  }

  const genes = creature.genes ?? {};
  if (selectedId) selectedId.textContent = String(creature.id);
  if (selectedSex) selectedSex.textContent = creature.sex ?? '—';
  if (selectedGeneration) selectedGeneration.textContent = String(creature.generation ?? 1);
  if (selectedAge) selectedAge.textContent = String(creature.age ?? 0);
  if (selectedEnergy) selectedEnergy.textContent = String(Math.round(creature.energy ?? 0));
  if (geneVision) geneVision.textContent = String(genes.visionRange ?? '—');
  if (geneFood) geneFood.textContent = String(genes.foodAttraction ?? '—');
  if (genePoison) genePoison.textContent = String(genes.poisonAversion ?? '—');
  if (geneMate) geneMate.textContent = String(genes.mateAttraction ?? '—');
  if (geneCrowd) geneCrowd.textContent = String(genes.crowdingAversion ?? '—');
  if (geneLowEnergy) geneLowEnergy.textContent = String(genes.lowEnergyThreshold ?? '—');
  if (geneReproduce) geneReproduce.textContent = String(genes.reproduceEnergyThreshold ?? '—');
}

function renderPlaceholderFromForm(dom) {
  const overrides = readConfigOverrides(dom, { commitValues: false });
  const width = overrides.worldWidth ?? defaultConfig.worldWidth;
  const height = overrides.worldHeight ?? defaultConfig.worldHeight;
  renderer.renderPlaceholder(width, height);
  updateSelectedCreaturePanel(dom, null);
}

function renderWorldIfAvailable(dom) {
  const world = simulation?.getWorld();
  if (world) {
    renderer.renderWorld(world, simulation.getSelectedCreature());
    return true;
  }
  renderPlaceholderFromForm(dom);
  return false;
}

function updateSpeedDisplay(dom) {
  if (!simulation) return;

  const { inputSpeed, speedValue } = dom;
  if (!inputSpeed) return;

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

function setupConfigForm(dom) {
  populateConfigForm(dom, getCurrentConfigSnapshot());

  dom.btnConfigDefaults?.addEventListener('click', () => {
    populateConfigForm(dom, defaultConfig);
    if (!simulation.getWorld()) {
      renderPlaceholderFromForm(dom);
    } else {
      readConfigOverrides(dom);
    }
  });

  dom.configForm?.addEventListener('input', (event) => {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    const field = CONFIG_FIELD_DEFINITIONS.find((item) => item.id === event.target.id);
    readConfigOverrides(dom, { commitValues: false });
    if (!simulation.getWorld() && field?.affectsCanvas) {
      renderPlaceholderFromForm(dom);
    }
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

function attachCanvasSelection(dom) {
  const { canvas } = dom;
  if (!canvas) return;

  canvas.addEventListener('click', (event) => {
    if (!simulation.getWorld()) {
      updateSelectedCreaturePanel(dom, null);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const cellSize = renderer.getCellSize();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;

    const gridX = Math.floor(canvasX / cellSize);
    const gridY = Math.floor(canvasY / cellSize);

    const selected = simulation.selectCreatureAt(gridX, gridY);
    renderWorldIfAvailable(dom);
    updateSelectedCreaturePanel(dom, selected);
  });
}

function attachButtonActions(dom) {
  dom.btnStart?.addEventListener('click', () => {
    console.log('[ui] Start → tworzę nowy świat zgodnie z bieżącą konfiguracją (DNA aktywne).');
    const overrides = readConfigOverrides(dom);
    const world = simulation.startNew(overrides);
    renderWorldIfAvailable(dom);
    updateStatsPanel(dom);
    updateSpeedDisplay(dom);
    updateSelectedCreaturePanel(dom, null);
    if (world) {
      setControlsState(dom, CONTROL_STATE.MANUAL);
    }
  });

  dom.btnStep?.addEventListener('click', () => {
    console.log('[ui] Step → metabolizm, środowisko, zachowania kierunkowe i walka.');
    const world = simulation.stepOnce();
    if (!world) return;

    renderWorldIfAvailable(dom);
    updateStatsPanel(dom);
    updateSelectedCreaturePanel(dom, simulation.getSelectedCreature());

    if (world.getAliveCount() === 0) {
      console.info('[ui] Wszystkie istoty zmarły – rozpocznij nowy świat lub zresetuj.');
      setControlsState(dom, CONTROL_STATE.FINISHED);
    }
  });

  dom.btnStartAuto?.addEventListener('click', () => {
    console.log('[ui] Start AUTO → uruchamiam autosymulację.');
    const started = simulation.startAuto(
      () => {
        renderWorldIfAvailable(dom);
        updateStatsPanel(dom);
        updateSelectedCreaturePanel(dom, simulation.getSelectedCreature());
      },
      () => {
        renderWorldIfAvailable(dom);
        updateStatsPanel(dom);
        updateSelectedCreaturePanel(dom, simulation.getSelectedCreature());
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

    console.log('[ui] Pause → zatrzymuję autosymulację.');
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
    renderWorldIfAvailable(dom);
    updateStatsPanel(dom);
    updateSelectedCreaturePanel(dom, simulation.getSelectedCreature());
  });

  dom.btnReset?.addEventListener('click', () => {
    console.log('[ui] Reset → czyszczenie sceny do stanu początkowego, konfiguracja pozostaje.');
    simulation.reset();
    renderWorldIfAvailable(dom);
    updateStatsPanel(dom);
    updateSpeedDisplay(dom);
    updateSelectedCreaturePanel(dom, null);
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
  setupConfigForm(dom);
  setControlsState(dom, CONTROL_STATE.INITIAL);
  renderWorldIfAvailable(dom);
  updateStatsPanel(dom);
  updateSpeedDisplay(dom);
  updateSelectedCreaturePanel(dom, null);

  attachButtonActions(dom);
  attachCanvasSelection(dom);

  console.log('[ui] Interfejs gotowy – konfiguracja parametrów, DNA oraz podgląd organizmów aktywny.');
}
