// js/simulation.js
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
    this.autoSpeed = 1; // ticks per second
  }

  startNew(overrides = {}) {
    this.stopAuto();
    this.config = { ...this.baseConfig, ...overrides };
    this.world = new World(this.config);
    this.world.initPopulation();

    this.tick = this.world.tick;
    this.population = this.world.getAliveCount();

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

  startAuto() {
    console.warn('[simulation] startAuto() – implementacja w Etapie 5.');
  }

  stopAuto() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
      console.info('[simulation] stopAuto() – timer zatrzymany (Etap 5 doda autotryb).');
    }
  }

  setSpeed(ticksPerSecond = 1) {
    this.autoSpeed = Math.max(0.1, ticksPerSecond);
    console.warn('[simulation] setSpeed() – autotryb zostanie aktywowany w Etapie 5.');
  }

  reset() {
    this.stopAuto();
    this.world = null;
    this.tick = 0;
    this.population = 0;
    this.config = { ...this.baseConfig };
    console.info('[simulation] reset() – powrót do stanu początkowego.');
  }

  getStats() {
    if (this.world) {
      return {
        tick: this.world.tick,
        population: this.world.getAliveCount()
      };
    }

    return {
      tick: this.tick,
      population: this.population
    };
  }

  getWorld() {
    return this.world;
  }

  getConfig() {
    return { ...this.config };
  }
}
