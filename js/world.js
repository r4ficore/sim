// js/world.js
import { Creature } from './creature.js';

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class World {
  constructor(config) {
    this.width = config.worldWidth;
    this.height = config.worldHeight;
    this.config = config;

    this.tick = 0;
    this.creatures = [];
  }

  initPopulation() {
    const { initialPopulation, initialEnergyMin, initialEnergyMax } = this.config;

    this.creatures = [];

    for (let i = 0; i < initialPopulation; i++) {
      const sex = Math.random() < 0.5 ? 'M' : 'F';
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      const energy = randomInt(initialEnergyMin, initialEnergyMax);

      const creature = new Creature(i, sex, x, y, energy);
      this.creatures.push(creature);
    }
  }
}
