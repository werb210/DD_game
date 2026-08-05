export const RUNE_TABLE = [
  { runeId: "rune_ember", name: "Ember Rune", slotType: "weapon", scalesWith: "str", effect: "bonus_fire_damage", magnitude: 3, tier: 1, materialCost: { chorus_shard: 2 } },
  { runeId: "rune_frost", name: "Frost Rune", slotType: "weapon", scalesWith: "str", effect: "bonus_frost_damage", magnitude: 3, tier: 1, materialCost: { chorus_shard: 2 } },
  { runeId: "rune_warding", name: "Warding Rune", slotType: "armor", scalesWith: "con", effect: "resist_fire", magnitude: null, tier: 1, materialCost: { chorus_shard: 2 } },
  { runeId: "rune_stoneheart", name: "Stoneheart Rune", slotType: "armor", scalesWith: "con", effect: "immune_fear", magnitude: null, tier: 2, materialCost: { chorus_shard: 4 } },
  { runeId: "rune_deepbind", name: "Deepbind Rune", slotType: "weapon", scalesWith: "str", effect: "bonus_atk_stun_chance", magnitude: 5, tier: 2, materialCost: { chorus_shard: 4 } },
  { runeId: "rune_ancestral", name: "Ancestral Rune", slotType: "armor", scalesWith: "con", effect: "bonus_def_immune_stun", magnitude: 4, tier: 3, materialCost: { chorus_shard: 6, deepsinger_blessing: 1 } }
];
