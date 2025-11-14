// js/creature.js

export class Creature {
  constructor(id, sex, x, y, energy) {
    this.id = id;
    this.sex = sex;    // 'M' albo 'F'
    this.x = x;
    this.y = y;
    this.energy = energy;

    this.age = 0;
    this.alive = true;
  }
}
