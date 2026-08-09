export const OCCUPATION_SLOTS = ["primary", "secondary", "tertiary"];
export const SLOT_SCALING = { primary: 1, secondary: 0.6, tertiary: 0.35 };
export const WARRIOR_THRESHOLDS = { 2: 150, 3: 500, 4: 1200 };
export const WARRIOR_TITLES = { 1: "Vagrant", 2: "Sellsword", 3: "Knight", 4: "Warlord" };

export const WARRIOR_PATHS = {
  2: {
    A: { name: "Aggressor", active: "Opening Strike — first attack each encounter gains +10% hit chance and +25% damage.", passive: "+2 ATK", bonuses: { atk: 2 } },
    B: { name: "Bulwark", active: "Guard Up — once per encounter, halve the next incoming hit.", passive: "+3 DEF", bonuses: { def: 3 } },
  },
  3: {
    A: { name: "Zealous Blade", active: "Oath Strike — once per encounter, guarantee the next attack hits.", passive: "+5 Max HP", bonuses: { maxHp: 5 } },
    B: { name: "Stalwart Defender", active: "Second Wind — once per encounter, recover 20% Max HP.", passive: "+3 DEF; Combat Fatigue cost −1", bonuses: { def: 3, combatFatigueReduction: 1 } },
  },
  4: {
    A: { name: "Warmonger", active: "Warlord's Command — once per day, guaranteed hit with +75% damage.", passive: "+5 ATK; +5% Crit", bonuses: { atk: 5, critChance: 5 } },
    B: { name: "Titan", active: "Unbroken — once per day, immune to stagger and interrupts for this encounter.", passive: "+10 Max HP; +4 DEF", bonuses: { maxHp: 10, def: 4 } },
  },
};

export const AVAILABLE_OCCUPATIONS = [{ id: "warrior", name: "Warrior", description: "A weapon master who thrives through direct combat." }];

export function freshWarrior(rank = 1, xp = 0) { return { id: "warrior", rank, xp }; }
export function freshWarriorChoices() { return { rank2: null, rank3: null, rank4: null }; }
export function slotIsUnlocked(character, slot) {
  if (slot === "primary") return true;
  const primary = character.occupations?.primary;
  if (slot === "secondary") return (primary?.rank || 0) >= 3;
  return (primary?.rank || 0) >= 4 && (character.occupations?.secondary?.rank || 0) >= 2;
}
export function warriorSlots(character) {
  return OCCUPATION_SLOTS.filter((slot) => character.occupations?.[slot]?.id === "warrior");
}
export function warriorXpGain({ damage, maximumDamage, challengeRating, playerLevel, slot }) {
  const quality = Math.max(0.2, Math.min(1, damage / Math.max(1, maximumDamage)));
  const strength = Math.max(0.25, Math.min(2, challengeRating / Math.max(1, playerLevel)));
  return 10 * quality * strength * SLOT_SCALING[slot];
}
export function rankForWarriorXp(xp) { return xp >= 1200 ? 4 : xp >= 500 ? 3 : xp >= 150 ? 2 : 1; }
export function pendingWarriorChoice(character) {
  for (const slot of warriorSlots(character)) {
    const occupation = character.occupations[slot];
    for (let rank = 2; rank <= occupation.rank; rank += 1) {
      if (!character.warriorChoices?.[`rank${rank}`]) return { slot, rank };
    }
  }
  return null;
}
export function warriorPassiveBonuses(character) {
  const total = { atk: 0, def: 0, maxHp: 0, critChance: 0, combatFatigueReduction: 0 };
  warriorSlots(character).forEach((slot) => {
    const scale = SLOT_SCALING[slot];
    for (let rank = 2; rank <= 4; rank += 1) {
      const choice = character.warriorChoices?.[`rank${rank}`];
      const bonuses = WARRIOR_PATHS[rank]?.[choice]?.bonuses || {};
      Object.entries(bonuses).forEach(([stat, value]) => { total[stat] += stat === "critChance" ? Math.round(value * scale * 10) / 10 : Math.round(value * scale); });
    }
  });
  return total;
}

const MOVESETS = {
  unarmed: ["Jab", "Cross", "Low Kick", "Haymaker", "Grapple"],
  oneHanded: ["Quick Slash", "Pommel Strike", "Lunge", "Riposte", "Flourish"],
  twoHanded: ["Heavy Swing", "Cleave", "Overhead Blow", "Sundering Strike", "Whirlwind"],
  shield: ["Shield Bash", "Cover", "Bulwark Rush", "Shield Wall", "Iron Fortress"],
};
const MOVE_COUNTS = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 5 };
export function weaponCategory(equipmentKey = "") {
  if (!equipmentKey) return "unarmed";
  if (/staff|spear|hammer|axe/.test(equipmentKey)) return "twoHanded";
  return "oneHanded";
}
export function availableWeaponMoves(character) {
  const weapon = character.equipped?.weapon;
  const category = weaponCategory(weapon?.equipmentKey);
  const rarity = weapon?.rarity || "common";
  const moves = MOVESETS[category].slice(0, MOVE_COUNTS[rarity] || 1);
  if (category === "oneHanded" && character.equipped?.shield) moves.push(...MOVESETS.shield.slice(0, MOVE_COUNTS[character.equipped.shield.rarity || "common"] || 1));
  return moves;
}
