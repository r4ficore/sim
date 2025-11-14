// js/world.js
// Etap 2: model świata z logiką jednej tury (metabolizm + ruch + śmierć).
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

  _wrapCoordinate(value, max) {
    if (value < 0) return max - 1;
    if (value >= max) return 0;
    return value;
  }

  _moveCreature(creature) {
    const direction = Math.floor(Math.random() * 4);
    let { x, y } = creature;

    switch (direction) {
      case 0:
        x += 1;
        break;
      case 1:
        x -= 1;
        break;
      case 2:
        y += 1;
        break;
      case 3:
      default:
        y -= 1;
        break;
    }

    creature.x = this._wrapCoordinate(x, this.width);
    creature.y = this._wrapCoordinate(y, this.height);
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
    this.tick += 1;

    const metabolismCost =
      typeof this.config.metabolismCost === 'number'
        ? this.config.metabolismCost
        : 1;

    this.creatures.forEach((creature) => {
      if (!creature.alive) {
        return;
      }

      creature.age += 1;
      creature.energy -= metabolismCost;

      if (creature.energy <= 0) {
        creature.energy = 0;
        creature.alive = false;
        return;
      }

      this._moveCreature(creature);
    });
  }
}
