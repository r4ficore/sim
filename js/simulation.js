// js/simulation.js
// Etapy 4–6: zarządzanie światem, rozmnażaniem, trybem autosymulacji i konfiguracją.
// Etap 2: zarządzanie światem oraz logiką pojedynczej tury.
// Etap 1: zarządzanie światem i statystykami (bez logiki tury).
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
        this.autoTickHandler(world);
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

  startNew(overrides = {}) {
    this.stopAuto({ triggerCallback: false });
    this.stopAuto();
    this.config = { ...this.baseConfig, ...overrides };
    this.world = new World(this.config);
    this.world.initPopulation();

    this.tick = this.world.tick;
    this.population = this.world.getAliveCount();
    this.autoSpeed = this._clampSpeed(this.config.autoTicksPerSecond ?? this.autoSpeed);

    console.info('[simulation] startNew() – świat gotowy (Etap 6).');
    return this.world;

    console.info('[simulation] startNew() – świat gotowy (Etap 2).');
    return this.world;
    console.info('[simulation] startNew() – świat gotowy (Etap 1).');
  }

  stepOnce() {
    if (!this.world) {
      console.warn('[simulation] stepOnce() – brak świata. Użyj przycisku Start.');
      return null;
    }

    this.world.step();
    this.tick = this.world.tick;
    this.population = this.world.getAliveCount();
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
      stopHandler();
    }

    return wasRunning;
      clearInterval(this.autoInterval);
      this.autoInterval = null;
      console.info('[simulation] stopAuto() – timer zatrzymany (Etap 5 doda autotryb).');
    }
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

    if (revertConfig) {
      this.config = { ...this.baseConfig };
    }

    const speedSource = this.config.autoTicksPerSecond ?? this.autoSpeed ?? 1;
    this.autoSpeed = this._clampSpeed(speedSource);
    this.config = { ...this.baseConfig };
    console.info('[simulation] reset() – powrót do stanu początkowego.');
  }

  getStats() {
    if (this.world) {
      const environment = this.world.getEnvironmentCounts();
      return {
        tick: this.world.tick,
        population: this.world.getAliveCount(),
        food: environment.food,
        poison: environment.poison
      return {
        tick: this.world.tick,
        population: this.world.getAliveCount()
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
}
