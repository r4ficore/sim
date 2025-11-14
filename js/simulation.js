// js/simulation.js
import { defaultConfig } from './config.js';
import { World } from './world.js';

export class Simulation {
  constructor() {
    this.config = { ...defaultConfig };
    this.world = null;
  }

  createWorld(overrides = {}) {
    // overrides pozwoli później wstrzyknąć wartości z formularza
    this.config = { ...defaultConfig, ...overrides };

    this.world = new World(this.config);
    this.world.initPopulation();
  }

  step() {
    if (!this.world) return;
    this.world.tick += 1;
    // Później tu dojdzie logika ruchu/energii itd.
  }
}
