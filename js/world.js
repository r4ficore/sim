// js/world.js
// Etap 1: model świata z inicjalną populacją (jeszcze bez logiki tury).
import { Creature } from './creature.js';

export class World {
  constructor(config) {
    this.config = config;
    this.width = config.worldWidth;
    this.height = config.worldHeight;
    this.tick = 0;
    this.creatures = [];
    this.cellsObjects = this._createEmptyCells();
    this._nextCreatureId = 1;
  }

  _createEmptyCells() {
    return Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => null)
    );
  }

  _randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  _randomPosition() {
    return {
      x: this._randomInt(0, this.width - 1),
      y: this._randomInt(0, this.height - 1)
    };
  }

  _createCreature() {
    const sex = Math.random() < 0.5 ? 'M' : 'F';
    const energy = this._randomInt(
      this.config.initialEnergyMin,
      this.config.initialEnergyMax
    );
    const { x, y } = this._randomPosition();

    return new Creature({
      id: this._nextCreatureId++,
      sex,
      x,
      y,
      energy
    });
  }

  initPopulation() {
    this.creatures = [];
    this.cellsObjects = this._createEmptyCells();
    this.tick = 0;
    this._nextCreatureId = 1;

    const target = Math.max(0, this.config.initialPopulation);
    for (let i = 0; i < target; i++) {
      this.creatures.push(this._createCreature());
    }
  }

  getAliveCreatures() {
    return this.creatures.filter((creature) => creature.alive);
  }

  getAliveCount() {
    return this.getAliveCreatures().length;
  }

  step() {
    console.warn('[world] step() zostanie zaimplementowane w Etapie 2.');
  }
}
