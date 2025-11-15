// js/world.js
// Świat z logiką środowiska, zachowaniami kierunkowymi oraz dziedziczeniem genów.
import { Creature, createRandomGenes, mixGenes } from './creature.js';

const CELL_OBJECT = {
  FOOD: 'FOOD',
  POISON: 'POISON'
};

const MOVE_OPTIONS = [
  { dx: 0, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 }
];

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

  _getCellKey(x, y) {
    return `${x},${y}`;
  }

  _isCellOccupiedByCreature(x, y) {
    return this.creatures.some((creature) => creature.alive && creature.x === x && creature.y === y);
  }

  _createCreature(overrides = {}) {
    const sex = overrides.sex ?? (Math.random() < 0.5 ? 'M' : 'F');
    const energy =
      overrides.energy ??
      this._randomInt(this.config.initialEnergyMin, this.config.initialEnergyMax);
    const { x, y } = overrides.x !== undefined && overrides.y !== undefined ? overrides : this._randomPosition();

    return new Creature({
      id: this._nextCreatureId++,
      sex,
      x,
      y,
      energy,
      generation: overrides.generation ?? 1,
      genes: overrides.genes ?? createRandomGenes()
    });
  }

  _wrapCoordinate(value, max) {
    if (value < 0) return max - 1;
    if (value >= max) return 0;
    return value;
  }

  _collectCreaturesByCell(creatures) {
    const map = new Map();
    creatures.forEach((creature) => {
      if (!creature.alive) return;
      const key = this._getCellKey(creature.x, creature.y);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(creature);
    });
    return map;
  }

  _canReproduce(creature) {
    if (!creature.alive) return false;
    if (creature.reproductionCooldown > 0) return false;
    const geneThreshold = creature.genes?.reproduceEnergyThreshold;
    const configThreshold = this.config.reproductionEnergyThreshold ?? 0;
    const threshold = Math.max(configThreshold, geneThreshold ?? configThreshold);
    return creature.energy >= threshold;
  }

  _handleReproduction(creaturesInCell, offspringBuffer) {
    if (creaturesInCell.length < 2) return;

    const males = creaturesInCell
      .filter((creature) => creature.sex === 'M' && this._canReproduce(creature))
      .sort((a, b) => b.energy - a.energy);
    const females = creaturesInCell
      .filter((creature) => creature.sex === 'F' && this._canReproduce(creature))
      .sort((a, b) => b.energy - a.energy);

    if (males.length === 0 || females.length === 0) {
      return;
    }

    const male = males[0];
    const female = females[0];

    const energyCost = this.config.reproductionEnergyCost ?? 0;
    if (male.energy - energyCost <= 0 || female.energy - energyCost <= 0) {
      return;
    }

    male.energy -= energyCost;
    female.energy -= energyCost;

    const cooldown = Math.max(0, this.config.reproductionCooldownTicks ?? 0);
    male.reproductionCooldown = cooldown;
    female.reproductionCooldown = cooldown;

    const offspringEnergy = Math.max(
      1,
      this.config.reproductionOffspringEnergy ?? Math.floor((male.energy + female.energy) / 2)
    );
    const childSex = Math.random() < 0.5 ? 'M' : 'F';

    const childGenes = mixGenes(male.genes, female.genes);
    const child = this._createCreature({
      sex: childSex,
      x: male.x,
      y: male.y,
      energy: offspringEnergy,
      generation: Math.max(male.generation ?? 1, female.generation ?? 1) + 1,
      genes: childGenes
    });
    child.reproductionCooldown = cooldown;
    offspringBuffer.push(child);
  }

  _handleCombat(creaturesInCell) {
    if (creaturesInCell.length < 2) return;

    const penalty = Math.max(0, this.config.fightEnergyPenalty ?? 0);
    const reward = Math.max(0, this.config.fightEnergyReward ?? 0);

    const groupedBySex = creaturesInCell.reduce((acc, creature) => {
      if (!acc[creature.sex]) {
        acc[creature.sex] = [];
      }
      acc[creature.sex].push(creature);
      return acc;
    }, {});

    Object.values(groupedBySex).forEach((group) => {
      if (!Array.isArray(group) || group.length < 2) return;

      group.sort((a, b) => b.energy - a.energy);
      const fighterA = group[0];
      const fighterB = group[1];

      if (!fighterA.alive || !fighterB.alive) {
        return;
      }

      const totalEnergy = Math.max(fighterA.energy + fighterB.energy, 1);
      const threshold = Math.random() * totalEnergy;
      const winner = threshold < fighterA.energy ? fighterA : fighterB;
      const loser = winner === fighterA ? fighterB : fighterA;

      if (!loser.alive) return;

      if (penalty > 0) {
        loser.energy -= penalty;
        if (loser.energy <= 0) {
          loser.energy = 0;
          loser.alive = false;
        }
      }

      if (reward > 0 && winner.alive) {
        winner.energy += reward;
      }
    });
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

  _evaluateVisionBonuses(creature, targetX, targetY, creaturesByCell, genes) {
    const vision = Math.max(1, Math.round(genes.visionRange ?? 1));
    if (vision <= 1) {
      return 0;
    }

    let bonus = 0;
    for (let dy = -vision; dy <= vision; dy++) {
      for (let dx = -vision; dx <= vision; dx++) {
        const distance = Math.abs(dx) + Math.abs(dy);
        if (distance === 0 || distance > vision) continue;

        const x = this._wrapCoordinate(targetX + dx, this.width);
        const y = this._wrapCoordinate(targetY + dy, this.height);
        const factor = (vision - distance + 1) * 0.05; // tuning parameter – miękki wpływ zasięgu.

        const cellObject = this.cellsObjects[y][x];
        if (cellObject === CELL_OBJECT.FOOD) {
          bonus += genes.foodAttraction * factor;
        } else if (cellObject === CELL_OBJECT.POISON) {
          bonus -= genes.poisonAversion * factor;
        }

        const key = this._getCellKey(x, y);
        const occupants = (creaturesByCell.get(key) || []).filter((other) => other !== creature && other.alive);
        if (occupants.length > 0) {
          const mates = occupants.filter((other) => other.sex !== creature.sex).length;
          if (mates > 0) {
            bonus += genes.mateAttraction * factor * mates;
          }
          bonus -= genes.crowdingAversion * factor * occupants.length * 0.5;
        }
      }
    }

    return bonus;
  }

  evaluateMoveForCreature(creature, targetX, targetY, creaturesByCell) {
    const genes = creature.genes ?? createRandomGenes();
    const key = this._getCellKey(targetX, targetY);
    const occupants = (creaturesByCell.get(key) || []).filter((other) => other !== creature && other.alive);

    const mates = occupants.filter((other) => other.sex !== creature.sex).length;
    const totalOthers = occupants.length;

    const cellContent = this.cellsObjects[targetY][targetX];
    let score = 0;

    if (cellContent === CELL_OBJECT.FOOD) {
      score += genes.foodAttraction;
    }

    if (cellContent === CELL_OBJECT.POISON) {
      score -= genes.poisonAversion;
    }

    score += genes.mateAttraction * mates;
    score -= genes.crowdingAversion * totalOthers;

    const energy = creature.energy;
    if (energy < (genes.lowEnergyThreshold ?? 0)) {
      score += genes.foodAttraction;
      score -= genes.mateAttraction * 0.5;
    } else if (energy > (genes.reproduceEnergyThreshold ?? 0)) {
      score += genes.mateAttraction;
    }

    score += this._evaluateVisionBonuses(creature, targetX, targetY, creaturesByCell, genes);

    if (targetX !== creature.x || targetY !== creature.y) {
      const moveCost = this.config.movementEnergyCost ?? 0;
      score -= moveCost * 0.5;
    }

    score += (Math.random() - 0.5) * 0.2;

    return score;
  }

  decideMoveForCreature(creature, creaturesByCell) {
    let bestOption = null;
    let bestScore = -Infinity;

    MOVE_OPTIONS.forEach((option) => {
      const targetX = this._wrapCoordinate(creature.x + option.dx, this.width);
      const targetY = this._wrapCoordinate(creature.y + option.dy, this.height);
      const score = this.evaluateMoveForCreature(creature, targetX, targetY, creaturesByCell);

      if (score > bestScore + 1e-6) {
        bestScore = score;
        bestOption = { ...option, targetX, targetY, score };
      } else if (Math.abs(score - bestScore) <= 1e-6 && Math.random() < 0.5) {
        bestOption = { ...option, targetX, targetY, score };
      }
    });

    if (!bestOption) {
      return {
        dx: 0,
        dy: 0,
        targetX: creature.x,
        targetY: creature.y,
        score: 0
      };
    }

    return bestOption;
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
      typeof this.config.metabolismCost === 'number' ? this.config.metabolismCost : 1;

    this._spawnEnvironmentalObjects();

    const aliveBeforeMove = this.getAliveCreatures();
    if (aliveBeforeMove.length === 0) {
      return;
    }

    const creaturesByCellBeforeMove = this._collectCreaturesByCell(aliveBeforeMove);
    const survivors = [];

    aliveBeforeMove.forEach((creature) => {
      if (!creature.alive) {
        return;
      }

      if (creature.reproductionCooldown > 0) {
        creature.reproductionCooldown = Math.max(0, creature.reproductionCooldown - 1);
      }

      creature.age += 1;
      creature.energy -= metabolismCost;

      if (creature.energy <= 0) {
        creature.energy = 0;
        creature.alive = false;
        return;
      }

      const moveDecision = this.decideMoveForCreature(creature, creaturesByCellBeforeMove);
      const moved = moveDecision.targetX !== creature.x || moveDecision.targetY !== creature.y;

      creature.x = moveDecision.targetX;
      creature.y = moveDecision.targetY;

      if (moved) {
        const moveCost = this.config.movementEnergyCost ?? 0;
        if (moveCost > 0) {
          creature.energy -= moveCost;
          if (creature.energy <= 0) {
            creature.energy = 0;
            creature.alive = false;
          }
        }
      }

      if (!creature.alive) {
        return;
      }

      this._applyCellInteraction(creature);

      if (creature.alive) {
        survivors.push(creature);
      }
    });

    if (survivors.length === 0) {
      return;
    }

    const creaturesByCell = this._collectCreaturesByCell(survivors);
    const offspringBuffer = [];

    creaturesByCell.forEach((creaturesInCell) => {
      this._handleReproduction(creaturesInCell, offspringBuffer);
      this._handleCombat(creaturesInCell);
    });

    if (offspringBuffer.length > 0) {
      this.creatures.push(...offspringBuffer);
    }
  }
}

export { CELL_OBJECT };
