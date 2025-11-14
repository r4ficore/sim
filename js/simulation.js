// js/simulation.js
// Etap 0: szkic klasy Simulation – logika pojawi się w kolejnych etapach.
import { defaultConfig } from './config.js';

export class Simulation {
  constructor(baseConfig = defaultConfig) {
    this.config = { ...baseConfig };
    this.world = null;
    this.tick = 0;
    this.population = 0;
    this.autoInterval = null;
    this.autoSpeed = 1; // ticks per second
  }

  startNew(overrides = {}) {
    this.config = { ...this.config, ...overrides };
    this.world = null; // Etap 1 zajmie się stworzeniem świata.
    this.tick = 0;
    this.population = 0;
    console.info('[simulation] startNew() – świat pojawi się w Etapie 1.');
  }

  stepOnce() {
    if (!this.world) {
      console.warn('[simulation] stepOnce() – brak świata, Etap 1/2 uzupełni logikę.');
      return;
    }

    this.world.step();
    this.tick = this.world.tick;
    this.population = this.world.creatures.filter((c) => c.alive).length;
  }

  startAuto() {
    console.warn('[simulation] startAuto() – implementacja w Etapie 5.');
  }

  stopAuto() {
    if (this.autoInterval) {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    }
    console.warn('[simulation] stopAuto() – pełne działanie pojawi się w Etapie 5.');
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
    console.info('[simulation] reset() – powrót do stanu początkowego.');
  }

  getStats() {
    return {
      tick: this.tick,
      population: this.population
    };
  }
}
