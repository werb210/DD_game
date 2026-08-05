export const STATUS_EFFECT_TABLE = [
  { statusId: "poisoned", category: "debuff", scalesWith: "arcane", description: "damage over time each turn" },
  { statusId: "burning", category: "debuff", scalesWith: "int", description: "fire aspect damage over time" },
  { statusId: "frozen", category: "debuff", scalesWith: "int", description: "target skips next turn" },
  { statusId: "stunned", category: "debuff", scalesWith: null, description: "target skips next turn", procCap: 0.15, cooldownTurns: 1 },
  { statusId: "feared", category: "debuff", scalesWith: null, description: "reduced accuracy/dodge" },
  { statusId: "bleeding", category: "debuff", scalesWith: "arcane", description: "damage over time, worsens as target takes more damage" },
  { statusId: "wet", category: "trigger", scalesWith: null, description: "no damage on its own; enables fire/frost combo effects" },
  { statusId: "resist_fire", category: "passive", scalesWith: null, description: "flat percent reduction to incoming fire damage" },
  { statusId: "resist_frost", category: "passive", scalesWith: null, description: "flat percent reduction to incoming frost damage" },
  { statusId: "resist_lightning", category: "passive", scalesWith: null, description: "flat percent reduction to incoming lightning damage" },
  { statusId: "resist_nature", category: "passive", scalesWith: null, description: "flat percent reduction to incoming nature damage" },
  { statusId: "resist_shadow", category: "passive", scalesWith: null, description: "flat percent reduction to incoming shadow damage" },
  { statusId: "resist_radiant", category: "passive", scalesWith: null, description: "flat percent reduction to incoming radiant damage" },
  { statusId: "resist_poison", category: "passive", scalesWith: null, description: "flat percent reduction to poison damage/duration" },
  { statusId: "immune_fear", category: "passive", scalesWith: null, description: "target cannot be feared" },
  { statusId: "immune_stun", category: "passive", scalesWith: null, description: "target cannot be stunned" }
];
