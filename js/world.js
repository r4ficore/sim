// js/world.js
// Etap 0: szkic klasy World – pełna logika dojdzie w kolejnych etapach.

export class World {
  constructor(config) {
    this.width = config.worldWidth;
    this.height = config.worldHeight;
    this.tick = 0;
    this.creatures = [];
    this.cellsObjects = [];
  }

  initPopulation() {
    console.warn('[world] initPopulation() zostanie uzupełnione w Etapie 1.');
  }

  step() {
    console.warn('[world] step() zostanie zaimplementowane w Etapie 2.');
  }
}
