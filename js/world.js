// js/world.js
// Etap 3: świat z logiką środowiska (jedzenie + trucizna) oraz interakcjami.
import { Creature } from './creature.js';

const CELL_OBJECT = {
  FOOD: 'FOOD',
  POISON: 'POISON'
};

export class World {
  constructor(config) {
    this.config = config;
    this.width = config.worldWidth;
    this.height = config.worldHeight;
    this.tick = 0;
    this.creatures = [];
    this.cellsObjects = this._createEmptyCells();
    this.objectCounts = {
      [CELL_OBJECT.FOOD]: 0,
      [CELL_OBJECT.POISON]: 0
    };
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

  _isCellOccupiedByCreature(x, y) {
    return this.creatures.some((creature) => creature.alive && creature.x === x && creature.y === y);
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

  _placeObjectRandomly(objectType, maxCount) {
    if (this.objectCounts[objectType] >= maxCount) {
      return false;
    }

    const maxAttempts = this.width * this.height;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { x, y } = this._randomPosition();
      if (this.cellsObjects[y][x]) continue;
      if (this._isCellOccupiedByCreature(x, y)) continue;

      this.cellsObjects[y][x] = objectType;
      this.objectCounts[objectType] += 1;
      return true;
    }

    return false;
  }

  _spawnEnvironmentalObjects() {
    const {
      foodSpawnAttempts = 0,
      poisonSpawnAttempts = 0,
      maxFoodOnMap = Infinity,
      maxPoisonOnMap = Infinity
    } = this.config;

    for (let i = 0; i < foodSpawnAttempts; i++) {
      this._placeObjectRandomly(CELL_OBJECT.FOOD, maxFoodOnMap);
    }

    for (let i = 0; i < poisonSpawnAttempts; i++) {
      this._placeObjectRandomly(CELL_OBJECT.POISON, maxPoisonOnMap);
    }
  }

  _applyCellInteraction(creature) {
    const cellContent = this.cellsObjects[creature.y][creature.x];
    if (!cellContent) return;

    if (cellContent === CELL_OBJECT.FOOD) {
      creature.energy += this.config.foodEnergyGain ?? 0;
      this.objectCounts[cellContent] = Math.max(0, this.objectCounts[cellContent] - 1);
      this.cellsObjects[creature.y][creature.x] = null;
      return;
    }

    if (cellContent === CELL_OBJECT.POISON) {
      const penalty = this.config.poisonEnergyPenalty ?? 0;
      creature.energy -= penalty;
      if (creature.energy <= 0) {
        creature.energy = 0;
        creature.alive = false;
      }
      this.objectCounts[cellContent] = Math.max(0, this.objectCounts[cellContent] - 1);
      this.cellsObjects[creature.y][creature.x] = null;
    }
  }

  initPopulation() {
    this.creatures = [];
    this.cellsObjects = this._createEmptyCells();
    this.objectCounts[CELL_OBJECT.FOOD] = 0;
    this.objectCounts[CELL_OBJECT.POISON] = 0;
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

  getEnvironmentCounts() {
    return {
      food: this.objectCounts[CELL_OBJECT.FOOD],
      poison: this.objectCounts[CELL_OBJECT.POISON]
    };
  }

  getCellObjects() {
    return this.cellsObjects;
  }

  step() {
    this.tick += 1;

    const metabolismCost =
      typeof this.config.metabolismCost === 'number'
        ? this.config.metabolismCost
        : 1;

    this._spawnEnvironmentalObjects();

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
      this._applyCellInteraction(creature);
    });
  }
}

export { CELL_OBJECT };
