// js/creature.js
// Etap 0: tylko definicja klasy – implementacja pojawi się później.

export class Creature {
  constructor({ id = 0, sex = 'M', x = 0, y = 0, energy = 0 }) {
    this.id = id;
    this.sex = sex;
    this.x = x;
    this.y = y;
    this.energy = energy;
    this.age = 0;
    this.alive = true;
    this.reproductionCooldown = 0;
    this.toolLevel = 0;
  }
}
