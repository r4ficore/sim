// js/creature.js
// Definicja organizmu wraz z genami oraz funkcjami pomocniczymi.

const GENE_BOUNDS = {
  visionRange: { min: 1, max: 3 },
  foodAttraction: { min: 0, max: 3 },
  poisonAversion: { min: 0, max: 3 },
  mateAttraction: { min: 0, max: 3 },
  crowdingAversion: { min: 0, max: 3 },
  lowEnergyThreshold: { min: 10, max: 80 },
  reproduceEnergyThreshold: { min: 40, max: 120 }
};

function clampGeneValue(name, value) {
  const bounds = GENE_BOUNDS[name];
  if (!bounds) return value;
  return Math.min(bounds.max, Math.max(bounds.min, value));
}

export function createRandomGenes() {
  // Proste losowanie genów w zadanych zakresach.
  return {
    visionRange: Math.floor(Math.random() * (GENE_BOUNDS.visionRange.max - GENE_BOUNDS.visionRange.min + 1)) +
      GENE_BOUNDS.visionRange.min,
    foodAttraction: Math.floor(Math.random() * (GENE_BOUNDS.foodAttraction.max + 1)),
    poisonAversion: Math.floor(Math.random() * (GENE_BOUNDS.poisonAversion.max + 1)),
    mateAttraction: Math.floor(Math.random() * (GENE_BOUNDS.mateAttraction.max + 1)),
    crowdingAversion: Math.floor(Math.random() * (GENE_BOUNDS.crowdingAversion.max + 1)),
    lowEnergyThreshold:
      Math.floor(Math.random() * (GENE_BOUNDS.lowEnergyThreshold.max - GENE_BOUNDS.lowEnergyThreshold.min + 1)) +
      GENE_BOUNDS.lowEnergyThreshold.min,
    reproduceEnergyThreshold:
      Math.floor(
        Math.random() *
          (GENE_BOUNDS.reproduceEnergyThreshold.max - GENE_BOUNDS.reproduceEnergyThreshold.min + 1)
      ) + GENE_BOUNDS.reproduceEnergyThreshold.min
  };
}

export function mixGenes(genesA, genesB, options = {}) {
  const mutationRate = options.mutationRate ?? 0.1;
  const mutationStrength = options.mutationStrength ?? 0.2; // tuning parameter – można regulować.

  const result = {};
  Object.keys(GENE_BOUNDS).forEach((key) => {
    const pickParentA = Math.random() < 0.5;
    const baseValue = pickParentA ? genesA?.[key] ?? genesB?.[key] : genesB?.[key] ?? genesA?.[key];
    let value = baseValue;

    if (Math.random() < mutationRate) {
      const delta = (Math.random() * 2 - 1) * mutationStrength;
      value = baseValue * (1 + delta);
    }

    if (Number.isFinite(value)) {
      if (Number.isInteger(GENE_BOUNDS[key].min) && Number.isInteger(GENE_BOUNDS[key].max)) {
        value = Math.round(value);
      }
      value = clampGeneValue(key, value);
    } else {
      value = clampGeneValue(key, GENE_BOUNDS[key].min);
    }

    result[key] = value;
  });

  return result;
}

export class Creature {
  constructor({
    id = 0,
    sex = 'M',
    x = 0,
    y = 0,
    energy = 0,
    age = 0,
    alive = true,
    reproductionCooldown = 0,
    toolLevel = 0,
    generation = 1,
    genes = null
  }) {
    this.id = id;
    this.sex = sex;
    this.x = x;
    this.y = y;
    this.energy = energy;
    this.age = age;
    this.alive = alive;
    this.reproductionCooldown = reproductionCooldown;
    this.toolLevel = toolLevel;
    this.generation = generation;
    this.genes = genes ? { ...genes } : createRandomGenes();
  }
}

export { GENE_BOUNDS };
