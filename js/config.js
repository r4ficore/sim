// js/config.js
// Konfiguracja domyślna dla całej aplikacji.

export const defaultConfig = {
  worldWidth: 40,
  worldHeight: 40,
  initialPopulation: 40,
  initialEnergyMin: 30,
  initialEnergyMax: 60,
  metabolismCost: 1,
  movementEnergyCost: 0.4, // tuning parameter – koszt ruchu kierunkowego.
  foodSpawnAttempts: 2,
  poisonSpawnAttempts: 1,
  maxFoodOnMap: 50,
  maxPoisonOnMap: 30,
  foodEnergyGain: 20,
  poisonEnergyPenalty: 25,
  reproductionEnergyThreshold: 55,
  reproductionEnergyCost: 18,
  reproductionCooldownTicks: 5,
  reproductionOffspringEnergy: 35,
  fightEnergyPenalty: 22,
  fightEnergyReward: 10,
  autoTicksPerSecond: 2,
  autoSpeedMin: 0.5,
  autoSpeedMax: 8,
  autoSpeedStep: 0.5,
  cellSize: 15
};
