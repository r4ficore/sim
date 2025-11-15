// js/simulation.js
// Zarządzanie światem, autosymulacją, konfiguracją oraz wyborem organizmów.
import { defaultConfig } from './config.js';
import { World } from './world.js';

export class Simulation {
  constructor(baseConfig = defaultConfig) {
    this.baseConfig = { ...baseConfig };
    this.config = { ...this.baseConfig };
    this.world = null;
    this.tick = 0;
    this.population = 0;

    this.autoInterval = null;
    this.autoTickHandler = null;
    this.autoStopHandler = null;
    this._autoLoop = null;

    this.autoSpeed = this._clampSpeed(this.config.autoTicksPerSecond ?? 1);
    this.selectedCreature = null;
  }

  _clampSpeed(value) {
    const numeric = Number(value);
    const sanitized = Number.isFinite(numeric) ? numeric : this.autoSpeed ?? 1;
    const min = this.config?.autoSpeedMin ?? 0.1;
    const max = this.config?.autoSpeedMax;

    let clamped = Math.max(sanitized, min);
    if (typeof max === 'number' && Number.isFinite(max)) {
      clamped = Math.min(clamped, max);
    }

    return Math.max(0.1, clamped);
  }

  _stopAutoTimerOnly() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    }
  }

  _createAutoLoop() {
    return () => {
      const world = this.stepOnce();
      if (typeof this.autoTickHandler === 'function') {
        this.autoTickHandler(world, this.getSelectedCreature());
      }

      if (!world || world.getAliveCount() === 0) {
        this.stopAuto();
      }
    };
  }

  _restartAutoTimer() {
    this._stopAutoTimerOnly();
    if (!this.world) {
      return false;
    }

    const ticksPerSecond = Math.max(this.autoSpeed, 0.1);
    const intervalMs = 1000 / ticksPerSecond;

    this._autoLoop = this._createAutoLoop();
    this.autoInterval = setInterval(this._autoLoop, intervalMs);
    return true;
  }

  _refreshSelectionAfterTick() {
    if (!this.selectedCreature) {
      return;
    }

    if (!this.selectedCreature.alive) {
      this.selectedCreature = null;
      return;
    }

    // Zabezpieczenie na wypadek resetu świata bez resetu wyboru.
    if (this.world && !this.world.creatures.includes(this.selectedCreature)) {
      this.selectedCreature = null;
    }
  }

  startNew(overrides = {}) {
    this.stopAuto({ triggerCallback: false });
    this.config = { ...this.baseConfig, ...overrides };
    this.world = new World(this.config);
    this.world.initPopulation();

    this.tick = this.world.tick;
    this.population = this.world.getAliveCount();
    this.autoSpeed = this._clampSpeed(this.config.autoTicksPerSecond ?? this.autoSpeed);
    this.selectedCreature = null;

    console.info('[simulation] startNew() – świat gotowy (DNA i zachowania aktywne).');
    return this.world;
  }

  stepOnce() {
    if (!this.world) {
      console.warn('[simulation] stepOnce() – brak świata. Użyj przycisku Start.');
      return null;
    }

    this.world.step();
    this.tick = this.world.tick;
    this.population = this.world.getAliveCount();
    this._refreshSelectionAfterTick();
    return this.world;
  }

  startAuto(onTick, onStop) {
    if (!this.world) {
      console.warn('[simulation] startAuto() – brak świata. Uruchom najpierw Start.');
      return false;
    }

    if (this.autoInterval) {
      console.warn('[simulation] startAuto() – autosymulacja już działa.');
      return false;
    }

    this.autoTickHandler = typeof onTick === 'function' ? onTick : null;
    this.autoStopHandler = typeof onStop === 'function' ? onStop : null;

    const started = this._restartAutoTimer();
    if (!started) {
      console.warn('[simulation] startAuto() – nie udało się uruchomić autosymulacji.');
      return false;
    }

    if (this._autoLoop) {
      this._autoLoop();
    }

    console.info(
      `[simulation] startAuto() – autotryb aktywny (${this.autoSpeed.toFixed(2)} tury/s).`
    );
    return true;
  }

  stopAuto(options = {}) {
    const { resetHandler = true, triggerCallback = true } = options;
    const wasRunning = Boolean(this.autoInterval);

    this._stopAutoTimerOnly();
    this._autoLoop = null;

    const stopHandler = this.autoStopHandler;

    if (resetHandler) {
      this.autoTickHandler = null;
      this.autoStopHandler = null;
    }

    if (triggerCallback && wasRunning && typeof stopHandler === 'function') {
      stopHandler(this.world, this.getSelectedCreature());
    }

    return wasRunning;
  }

  setSpeed(ticksPerSecond = 1) {
    const clamped = this._clampSpeed(ticksPerSecond);
    this.autoSpeed = clamped;

    if (this.autoInterval) {
      const tickHandler = this.autoTickHandler;
      const stopHandler = this.autoStopHandler;

      this.stopAuto({ resetHandler: false, triggerCallback: false });
      this.autoTickHandler = tickHandler;
      this.autoStopHandler = stopHandler;

      const restarted = this._restartAutoTimer();
      if (!restarted) {
        console.warn('[simulation] setSpeed() – nie udało się przełączyć prędkości.');
      }
    }
  }

  isAutoRunning() {
    return Boolean(this.autoInterval);
  }

  reset(options = {}) {
    const { revertConfig = false } = options;
    this.stopAuto({ triggerCallback: false });
    this.world = null;
    this.tick = 0;
    this.population = 0;
    this.selectedCreature = null;

    if (revertConfig) {
      this.config = { ...this.baseConfig };
    }

    const speedSource = this.config.autoTicksPerSecond ?? this.autoSpeed ?? 1;
    this.autoSpeed = this._clampSpeed(speedSource);
  }

  getStats() {
    if (this.world) {
      const environment = this.world.getEnvironmentCounts();
      return {
        tick: this.world.tick,
        population: this.world.getAliveCount(),
        food: environment.food,
        poison: environment.poison
      };
    }

    return {
      tick: this.tick,
      population: this.population,
      food: 0,
      poison: 0
    };
  }

  getWorld() {
    return this.world;
  }

  getConfig() {
    return { ...this.config };
  }

  getAutoSpeed() {
    return this.autoSpeed;
  }

  selectCreatureAt(x, y) {
    if (!this.world) {
      this.selectedCreature = null;
      return null;
    }

    const candidates = this.world.creatures.filter(
      (creature) => creature.alive && creature.x === x && creature.y === y
    );

    if (candidates.length === 0) {
      this.selectedCreature = null;
      return null;
    }

    candidates.sort((a, b) => b.energy - a.energy);
    this.selectedCreature = candidates[0];
    return this.selectedCreature;
  }

  getSelectedCreature() {
    if (!this.selectedCreature) return null;
    if (!this.selectedCreature.alive) {
      this.selectedCreature = null;
      return null;
    }
    return this.selectedCreature;
  }
}
