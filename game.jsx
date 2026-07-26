import React, { useState, useRef, useEffect } from 'react';

// ---- Design tokens ----
// Grimdark medieval reskin: cold iron, old blood, tarnished gold leaf on parchment ink.
// CODE_VOICE keeps its structural job (marking code-determined outcomes) but is now a
// "Valyrian steel" blue-grey instead of sage green, to sit inside the new palette.

const INK = "#E4D9BE";
const AMBER = "#C89B4A";
const BLOOD = "#7A2333";
const SLATE = "#8B8577";
const DIM = "#5C5648";
const CODE_VOICE = "#7FA0AE"; // cold steel-blue — reserved ONLY for code-determined outcomes
const WOUND = "#B23A3A"; // low-HP / error tone, blood rather than coral

// Map-only palette. The rest of the UI is dark iron/parchment-ink-on-black; the map
// itself deliberately flips to a light, aged-paper look — the idea of unrolling an
// actual physical map against the dark chrome around it, rather than another dark panel.
const PARCHMENT_LIGHT = "#E9DAB4";
const PARCHMENT_MID = "#D6BE8C";
const PARCHMENT_DARK = "#B79860";
const MAP_INK = "#3A2A18";
const MAP_TRAIL = "#8B5A34";

// Google Fonts, loaded once for the whole app: Cinzel for inscriptional display type
// (headers, labels, buttons), Crimson Text for body/narration — a period-appropriate
// display/body pairing instead of the generic system serif stack.
const FONT_IMPORTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
  `}</style>
);
const DISPLAY_FONT = "'Cinzel', Georgia, serif";
const BODY_FONT = "'Crimson Text', Georgia, 'Times New Roman', serif";

// A small inline raven glyph — the one recurring signature mark of this reskin, used
// wherever a section changes hands (a ledger heading, a narration break) as if a raven
// had just delivered that piece of news.
function RavenGlyph({ size = 14, color = AMBER, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, ...style }}>
      <path
        d="M2 15c2-4 5-6 7-6 1-3 3-6 6-6 1.5 0 2 1 1 2-2 1-3 2-3 3 2 0 4 1 5 3-1 0-2-.3-3-.3.5 1 .5 2 0 3-1-1-2-1.5-3-1.5-1 2-3 4-6 4.5-2.5.5-5-.5-4-2z"
        fill={color}
        opacity="0.9"
      />
    </svg>
  );
}

// ---- Fixed, code-owned game tables. Claude never sees or sets these numbers. ----

const ENEMY_TABLE = {
  goblin: { name: "Goblin", hp: 18, attack: 4, defense: 1, xpReward: 15, goldReward: 6 },
  wolf: { name: "Wolf", hp: 14, attack: 5, defense: 0, xpReward: 12, goldReward: 3 },
  bandit: { name: "Bandit", hp: 26, attack: 6, defense: 2, xpReward: 22, goldReward: 14 },
  skeleton: { name: "Skeleton", hp: 20, attack: 5, defense: 3, xpReward: 18, goldReward: 8 },
};

const GOLD_TIERS = { small: [1, 5], medium: [6, 15], large: [16, 30] };
const QUEST_REWARD_TIERS = {
  small: { xp: 20, gold: 10 },
  medium: { xp: 50, gold: 25 },
  large: { xp: 100, gold: 50 },
};

// Fixed vocabulary of NPC interactions. Claude picks one of these labels — it never invents
// its own trust/respect/fear numbers. The deltas are deliberately small so it takes several
// small, easy-to-miss moments to add up to something an NPC would actually act on.
const NPC_INTERACTION_TABLE = {
  helped: { trust: 2 },
  betrayed: { trust: -3, fear: 1 },
  threatened: { fear: 2, respect: -1 },
  impressed: { respect: 2 },
  protected: { trust: 2, respect: 1 },
  insulted: { respect: -2 },
  spared: { trust: 1, fear: -1 },
  smallKindness: { trust: 1 },
  smallSlight: { respect: -1 },
};

// Fixed vocabulary of consumable effects. Claude may tag a "loot" event with one of these
// kinds when the item is a usable curative — the actual heal amount lives here in code,
// never in Claude's narration. Items with no kind (or an unrecognized one) are just flavor/
// equipment: they sit in inventory but have no coded effect yet.
const CONSUMABLE_TABLE = {
  minor_healing: { healAmount: 12, label: "a minor restorative" },
  healing: { healAmount: 25, label: "a restorative" },
  major_healing: { healAmount: 45, label: "a potent restorative" },
  ration: { healAmount: 8, label: "a filling meal" },
};

// Fixed vocabulary of equipment. Claude tags a "loot" event with one of these keys when
// the item is a wearable weapon or armor piece — never with the free-text item name.
// This is deliberate: an earlier version let equip logic match on Claude's narrated
// item name directly, and even small phrasing differences ("Iron Longsword" vs
// "iron longsword") silently broke it. Picking from this fixed, code-known list is the
// same fix already applied to consumables — Claude never invents the atk/defBonus numbers.
const EQUIPMENT_TABLE = {
  rusty_dagger: { slot: "weapon", atkBonus: 1 },
  steel_dagger: { slot: "weapon", atkBonus: 2 },
  iron_sword: { slot: "weapon", atkBonus: 3 },
  silver_rapier: { slot: "weapon", atkBonus: 3 },
  war_axe: { slot: "weapon", atkBonus: 4 },
  oak_staff: { slot: "weapon", atkBonus: 2 },
  robes: { slot: "armor", defBonus: 1 },
  leather_armor: { slot: "armor", defBonus: 2 },
  chainmail: { slot: "armor", defBonus: 3 },
  plate_armor: { slot: "armor", defBonus: 5 },
  // Starting-tier weapons offered at character creation. All deliberately atkBonus: 1,
  // same as rusty_dagger — picking a spear over a sword is a flavor choice, not a power
  // choice, so no starting weapon type is objectively better than another.
  starting_sword: { slot: "weapon", atkBonus: 1 },
  starting_axe: { slot: "weapon", atkBonus: 1 },
  starting_spear: { slot: "weapon", atkBonus: 1 },
  starting_bow: { slot: "weapon", atkBonus: 1 },
  starting_staff: { slot: "weapon", atkBonus: 1 },
  starting_hammer: { slot: "weapon", atkBonus: 1 },
};

// ---- Attribute system. Six primary attributes drive every derived combat/social number.
// Claude never sees or sets attribute values or derived stats — it only ever gets a
// narrative-flavor summary (condition, notable traits) for color in its prose.

const ATTRIBUTE_DEFS = {
  str: { label: "Strength", short: "STR" },
  dex: { label: "Dexterity", short: "DEX" },
  con: { label: "Constitution", short: "CON" },
  int: { label: "Intelligence", short: "INT" },
  wis: { label: "Wisdom", short: "WIS" },
  cha: { label: "Charisma", short: "CHA" },
};

const ATTRIBUTE_CAP = 99;
const ATTRIBUTE_POINTS_PER_LEVEL = 4;

const initialAttributes = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

// Race is pure narrative flavor — no stat effect at all. It exists so Claude has
// something true and stable to reference in narration, not to give anyone a mechanical
// edge over anyone else.
const RACE_OPTIONS = [
  { key: "human", label: "Human", flavor: "Adaptable and unremarkable at a glance — humans get by on grit and versatility." },
  { key: "elf", label: "Elf", flavor: "Long-lived and keenly perceptive, elves are often underestimated by those who mistake grace for fragility." },
  { key: "dwarf", label: "Dwarf", flavor: "Stout and stubborn, dwarves are built for endurance and rarely back down once committed." },
  { key: "orc", label: "Orc", flavor: "Physically formidable, orcs are frequently misjudged as brutish by people who've never actually met one." },
  { key: "halfling", label: "Halfling", flavor: "Small, quick, and easy to overlook — which suits most halflings just fine." },
  { key: "tiefling", label: "Tiefling", flavor: "Marked by an otherworldly heritage, tieflings are used to being stared at first and judged second." },
];

// Archetype grants a ONE-TIME starting attribute bump at character creation — nothing
// more. It never locks anything: every ability in ABILITY_TABLE stays reachable by
// anyone regardless of what they picked here, since abilities only ever check the
// attribute values themselves. This is flavor with a small mechanical head start, not a
// class system.
// Background replaces the earlier generic Warrior/Rogue/Scholar archetype idea with
// something more grounded: where the player came from before adventuring. Same rules as
// before — a one-time attribute bump, never a lock on anything. Each background also
// gets an optional starting item and an "npcTag" — a recognition cue passed to Claude as
// flavor only, never a hard mechanical gate. "priceEdge" is the one background with an
// actual code hook (Merchant gets a small stacking discount, same mechanism as Silver
// Tongue) — proof a background can still matter mechanically without every one needing to.
const BACKGROUND_OPTIONS = {
  farmer: { label: "Farmer", bonus: { con: 2, str: 1 }, flavor: "Hard labor from a young age left you sturdier than most.", npcTag: "Farmers and villagers warm to you quickly — you talk like one of their own.", startingItem: { name: "Rations", consumableKind: "ration", equipmentKey: null } },
  blacksmith: { label: "Blacksmith's Apprentice", bonus: { str: 2, con: 1 }, flavor: "Years at the forge built real strength into your arms.", npcTag: "Smiths and craftsmen recognize the calluses of real training.", startingItem: { name: "Steel Dagger", consumableKind: null, equipmentKey: "steel_dagger" } },
  noble: { label: "Noble", bonus: { cha: 2, int: 1 }, flavor: "Raised in comfort, you carry yourself like someone used to being listened to.", npcTag: "Nobles, merchants, and officials extend you more courtesy than a stranger usually gets.", startingGold: 20 },
  mercenary: { label: "Mercenary", bonus: { str: 2, dex: 1 }, flavor: "You've been paid to fight before, and it shows.", npcTag: "Other sellswords size you up as a fellow professional.", startingItem: { name: "Leather Armor", consumableKind: null, equipmentKey: "leather_armor" } },
  hunter: { label: "Hunter", bonus: { dex: 2, wis: 1 }, flavor: "You know how to move quietly and read a trail.", npcTag: "Hunters and rangers recognize a fellow tracker.", startingItem: { name: "Hunting Knife", consumableKind: null, equipmentKey: "rusty_dagger" } },
  sailor: { label: "Sailor", bonus: { con: 2, dex: 1 }, flavor: "Years at sea taught you to keep your footing no matter what.", npcTag: "Sailors and dockhands treat you like one of their own.", startingItem: { name: "Rations", consumableKind: "ration", equipmentKey: null } },
  scholar: { label: "Scholar", bonus: { int: 2, wis: 1 }, flavor: "You've spent more time with books than with blades.", npcTag: "Scholars and the learned take your questions seriously.", startingItem: { name: "Traveler's Robes", consumableKind: null, equipmentKey: "robes" } },
  merchant: { label: "Merchant", bonus: { cha: 2, int: 1 }, flavor: "You know the value of nearly everything, and the price of everything else.", npcTag: "Other merchants deal with you a little more fairly.", startingGold: 15, priceEdge: true },
  priest: { label: "Priest", bonus: { wis: 2, cha: 1 }, flavor: "A life of devotion taught you patience most people never learn.", npcTag: "The pious and temple-goers treat you with quiet respect.", startingItem: { name: "Minor Restorative", consumableKind: "minor_healing", equipmentKey: null } },
  criminal: { label: "Criminal", bonus: { dex: 2, cha: 1 }, flavor: "You've made a living finding the gaps in other people's attention.", npcTag: "The underworld recognizes one of its own.", startingGold: 15 },
  urchin: { label: "Street Urchin", bonus: { dex: 2, con: 1 }, flavor: "You grew up fast, and learned to go hungry without complaint.", npcTag: "Beggars and street folk trust you as one of their own.", startingItem: { name: "Rations", consumableKind: "ration", equipmentKey: null } },
};

// Starting weapon is a pure flavor/playstyle choice at creation — every option maps to
// an atkBonus: 1 equipment entry, so nothing here is a power pick, just a preference.
const STARTING_WEAPON_OPTIONS = {
  sword: { label: "Sword", name: "Traveler's Shortsword", equipmentKey: "starting_sword" },
  axe: { label: "Axe", name: "Hand Axe", equipmentKey: "starting_axe" },
  spear: { label: "Spear", name: "Worn Spear", equipmentKey: "starting_spear" },
  bow: { label: "Bow", name: "Hunting Bow", equipmentKey: "starting_bow" },
  dagger: { label: "Dagger", name: "Rusty Dagger", equipmentKey: "rusty_dagger" },
  staff: { label: "Staff", name: "Plain Wooden Staff", equipmentKey: "starting_staff" },
  hammer: { label: "Hammer", name: "Worn Warhammer", equipmentKey: "starting_hammer" },
};

// Voice has zero mechanical effect — it's told to Claude as a note on how to color the
// player's manner and implied dialogue, nothing more.
const VOICE_OPTIONS = ["Calm", "Rough", "Noble", "Quiet", "Confident"];

// Purely descriptive milestone labels — narrative flavor and a sense of progression,
// not a gate on anything (yet). Sorted ascending; milestoneFor picks the highest one met.
const ATTRIBUTE_MILESTONES = [
  { min: 10, label: "Average" },
  { min: 20, label: "Skilled" },
  { min: 30, label: "Expert" },
  { min: 40, label: "Exceptional" },
  { min: 50, label: "Elite" },
  { min: 60, label: "Heroic" },
  { min: 70, label: "Legendary" },
  { min: 80, label: "Mythic" },
  { min: 90, label: "Nearly Superhuman" },
  { min: 99, label: "Peak Mortal" },
];

function milestoneFor(value) {
  let best = null;
  for (const m of ATTRIBUTE_MILESTONES) {
    if (value >= m.min) best = m;
  }
  return best;
}

// Fixed, code-owned abilities that unlock automatically once an attribute crosses a
// threshold. Universal on purpose: there's no class gate here — anyone who invests
// enough points into an attribute gets the ability, full stop. "mechanical: true" means
// code actually does something with it (combat math, prices); "mechanical: false" means
// it's narrative flavor only for now, passed to Claude as color, same treatment INT/WIS
// milestones already got.
const ABILITY_TABLE = {
  str: [
    { min: 20, key: "power_strike", label: "Power Strike", mechanical: true, description: "A heavier attack option in combat — more damage, but it leaves you open to a harder counter." },
    { min: 50, key: "intimidating_presence", label: "Intimidating Presence", mechanical: true, description: "A solid hit may make a weaker enemy break and flee outright." },
  ],
  dex: [
    { min: 20, key: "shadow_step", label: "Shadow Step", mechanical: true, description: "Your odds of successfully fleeing a fight are much better." },
    { min: 50, key: "assassination", label: "Assassination", mechanical: true, description: "Your critical hits land even harder." },
  ],
  con: [
    { min: 20, key: "second_wind", label: "Second Wind", mechanical: true, description: "Once per fight, you can catch a surge of resilience and recover some health." },
    { min: 50, key: "iron_will", label: "Iron Will", mechanical: true, description: "Your toughness blunts incoming blows further." },
  ],
  int: [
    { min: 20, key: "keen_analysis", label: "Keen Analysis", mechanical: false, description: "You notice details in a scene others would miss." },
    { min: 50, key: "arcane_insight", label: "Arcane Insight", mechanical: false, description: "You sense things beyond ordinary knowledge." },
  ],
  wis: [
    { min: 20, key: "sharp_intuition", label: "Sharp Intuition", mechanical: false, description: "You read people and situations well." },
    { min: 50, key: "unshakeable_mind", label: "Unshakeable Mind", mechanical: false, description: "You're notably harder to unsettle or manipulate." },
  ],
  cha: [
    { min: 20, key: "silver_tongue", label: "Silver Tongue", mechanical: true, description: "Merchants warm to you faster than most — even better prices." },
    { min: 50, key: "commanding_presence", label: "Commanding Presence", mechanical: false, description: "People instinctively defer to you." },
  ],
};

function getUnlockedAbilities(attributes) {
  const result = [];
  Object.entries(ABILITY_TABLE).forEach(([attr, abilities]) => {
    abilities.forEach((a) => {
      if (attributes[attr] >= a.min) result.push({ ...a, attr });
    });
  });
  return result;
}

function hasAbility(character, key) {
  return getUnlockedAbilities(character.attributes).some((a) => a.key === key);
}

function hasBackgroundPriceEdge(character) {
  const background = character.identity ? BACKGROUND_OPTIONS[character.identity.background] : null;
  return !!background?.priceEdge;
}

// The one place attributes turn into raw combat numbers. Equipment bonuses are layered
// on top of this in getEffectiveStats — this function never sees gear.
function baseStatsFromAttributes(attributes) {
  const a = attributes;
  return {
    maxHp: 10 + a.con * 2,
    attack: 1 + Math.floor(a.str * 0.5),
    defense: Math.floor(a.con * 0.2),
    critChance: clamp(a.dex * 0.6, 0, 40), // % chance an attack lands as a critical hit
    dodgeChance: clamp(a.dex * 0.4, 0, 30), // % chance an incoming hit is dodged entirely
  };
}

// Combines attribute-derived base stats with whatever's currently equipped. This is the
// ONLY place attack/defense/maxHp bonuses get applied — combat and UI always call this
// rather than reading raw fields directly, so a level-up or a re-gear can never silently
// no-op.
function getEffectiveStats(character) {
  const base = baseStatsFromAttributes(character.attributes);
  const weaponItem = character.equipped?.weapon;
  const armorItem = character.equipped?.armor;
  const weaponDef = weaponItem ? EQUIPMENT_TABLE[weaponItem.equipmentKey] : null;
  const armorDef = armorItem ? EQUIPMENT_TABLE[armorItem.equipmentKey] : null;
  const weaponRarityMult = weaponItem ? RARITY_TIERS[rarityOf(weaponItem)].statMult : 1;
  const armorRarityMult = armorItem ? RARITY_TIERS[rarityOf(armorItem)].statMult : 1;
  const weaponBonus = weaponDef ? Math.round(weaponDef.atkBonus * weaponRarityMult) : 0;
  const armorBonus = armorDef ? Math.round(armorDef.defBonus * armorRarityMult) : 0;
  const unlocked = getUnlockedAbilities(character.attributes);
  const has = (key) => unlocked.some((a) => a.key === key);
  return {
    atk: base.attack + weaponBonus,
    def: base.defense + armorBonus + (has("iron_will") ? 2 : 0),
    maxHp: base.maxHp,
    critChance: base.critChance,
    dodgeChance: base.dodgeChance,
    critMultiplier: has("assassination") ? 2 : 1.5,
    fleeChance: has("shadow_step") ? 0.85 : 0.6,
    hasPowerStrike: has("power_strike"),
    hasSecondWind: has("second_wind"),
    hasIntimidatingPresence: has("intimidating_presence"),
    hasSilverTongue: has("silver_tongue"),
    abilities: unlocked,
  };
}

function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(hi, value));
}

// Links two locations bidirectionally in place on the given locations map — the one
// place the travel graph's edges ever get created. Both ids must already exist and be
// different; a no-op otherwise (covers the very first turn, when there's no "previous"
// location distinct from the current one).
function linkLocations(locations, idA, idB) {
  if (!idA || !idB || idA === idB) return;
  if (locations[idA] && !locations[idA].connections.includes(idB)) {
    locations[idA] = { ...locations[idA], connections: [...locations[idA].connections, idB] };
  }
  if (locations[idB] && !locations[idB].connections.includes(idA)) {
    locations[idB] = { ...locations[idB], connections: [...locations[idB].connections, idA] };
  }
}

// Lays out the location graph for the visual map. Rooted at the very first location
// ("loc_1") rather than wherever the player currently is — that keeps the whole layout
// stable turn to turn instead of reshuffling every time the player moves, which would
// be disorienting for something meant to build a mental picture of the world. Plain BFS
// layering: each location's "layer" is its shortest-path distance from the start, and
// layers are drawn as horizontal rows spreading outward — a reasonable, deterministic
// map shape for a graph that grows organically rather than one laid out by hand.
function computeMapLayout(locations, rootId) {
  const layers = [];
  const visited = new Set();
  let frontier = locations[rootId] ? [rootId] : [];
  if (frontier.length) visited.add(rootId);
  while (frontier.length) {
    layers.push(frontier);
    const next = [];
    frontier.forEach((id) => {
      (locations[id]?.connections || []).forEach((cid) => {
        if (!visited.has(cid) && locations[cid]) {
          visited.add(cid);
          next.push(cid);
        }
      });
    });
    frontier = next;
  }
  // Locations somehow unreachable from the root (shouldn't normally happen, since the
  // graph only ever grows from actual travel starting there) still need a position
  // rather than being silently dropped from the map.
  const unreached = Object.keys(locations).filter((id) => !visited.has(id));
  if (unreached.length) layers.push(unreached);

  const positions = {};
  const LAYER_SPACING_Y = 110;
  const NODE_SPACING_X = 130;
  layers.forEach((layerIds, layerIndex) => {
    const totalWidth = (layerIds.length - 1) * NODE_SPACING_X;
    layerIds.forEach((id, i) => {
      positions[id] = { x: -totalWidth / 2 + i * NODE_SPACING_X, y: layerIndex * LAYER_SPACING_Y };
    });
  });
  return positions;
}

// Location display names are full descriptive prose ("The Crossroads Inn, edge of
// Millbrook village") — right for narration, far too long for a map label. This is a
// best-effort shortening for the map view specifically; the Journal and sidebar still
// show the complete name.
function shortLocationLabel(name) {
  return name.split(",")[0].trim();
}

const xpToNextLevel = (level) => level * 40;

const initialCharacter = {
  level: 1,
  hp: 30,
  attributes: { ...initialAttributes },
  identity: null, // { name, race, background, backstory, gender, age, appearance, weapon, voice } — set once at character creation
  gold: 10,
  xp: 0,
  pendingAttributePoints: 0,
  inventory: [
    { id: "item_1", name: "Rusty dagger", consumableKind: null, equipmentKey: "rusty_dagger", rarity: "common", quantity: 1 },
    { id: "item_2", name: "Rations", consumableKind: "ration", equipmentKey: null, rarity: "common", quantity: 3 },
  ],
  equipped: { weapon: null, armor: null },
};

// Builds the opening scene straight from the chosen identity, with plain code —
// deliberately NOT an AI call. The very first thing a new player sees shouldn't depend
// on the AI bridge being up; every turn after this one already goes through Claude, but
// this one guaranteed to work is worth more than a fancier version that might not load.
function craftOpeningNarration(identity) {
  const race = RACE_OPTIONS.find((r) => r.key === identity.race) || RACE_OPTIONS[0];
  const background = BACKGROUND_OPTIONS[identity.background] || BACKGROUND_OPTIONS.farmer;
  const weapon = STARTING_WEAPON_OPTIONS[identity.weapon] || STARTING_WEAPON_OPTIONS.dagger;
  const backstoryLine = identity.backstory && identity.backstory.trim()
    ? identity.backstory.trim()
    : "Whatever brought you here, you've kept it to yourself.";
  const appearanceLine = identity.appearance && identity.appearance.trim() ? ` ${identity.appearance.trim()}` : "";
  return {
    role: "dm",
    narration: `Rain taps the shutters of the Crossroads Inn. ${identity.name}, a ${race.label.toLowerCase()} formerly a ${background.label.toLowerCase()}, has just arrived in Millbrook, a farming village that smells of woodsmoke and wet hay, a ${weapon.name.toLowerCase()} at your side.${appearanceLine} ${backstoryLine} The innkeeper eyes you — a stranger — while three locals mutter over their ale in the corner.`,
    suggestedActions: ["Talk to the innkeeper", "Approach the locals in the corner", "Ask about work in the village"],
  };
}

const INITIAL_LOG = [
  {
    role: "dm",
    narration:
      "Rain taps the shutters of the Crossroads Inn. You've just arrived in Millbrook, a farming village that smells of woodsmoke and wet hay. The innkeeper eyes you — a stranger — while three locals mutter over their ale in the corner.",
    suggestedActions: ["Talk to the innkeeper", "Approach the locals in the corner", "Ask about work in the village"],
  },
];

const SAVE_KEY = "dnd-prototype-savegame";
// A separate slot from the autosave, entirely under the player's control — hitting Save
// writes here, hitting Load reads from here. Autosave (SAVE_KEY) keeps running in the
// background regardless, so this is a deliberate checkpoint layered on top, not a
// replacement for it.
const MANUAL_SAVE_KEY = "dnd-prototype-manual-savegame";
const TUTORIAL_SEEN_KEY = "dnd-prototype-tutorial-seen";

// Fixed tutorial content — plain explanatory copy, nothing dynamic, nothing the AI
// touches. Combat gets two dedicated steps since it's the system with the most moving
// parts (crit/dodge, the two conditional ability buttons, enemies fleeing).
const TUTORIAL_STEPS = [
  {
    title: "How this works",
    body: "Type anything you want to try in the box at the bottom, or tap one of the suggested action buttons. Claude narrates the world and decides what happens — but every number (HP, gold, damage, prices) is handled by code, never by the AI. That split is why the ledger on the right calls itself \"code-owned.\"",
  },
  {
    title: "HP, Level & XP",
    body: "Your health and level/XP show at the top of the screen and in the Character Ledger. If your HP hits 0, you're not permanently killed — you wake up battered at 1 HP. XP fills a bar until you level up.",
  },
  {
    title: "Attributes",
    body: "You have six attributes: STR, DEX, CON, INT, WIS, CHA. Every level grants 4 points to spend however you like — stack everything into one stat, or spread them out. There's no wrong build.",
  },
  {
    title: "Abilities",
    body: "Certain attribute thresholds unlock permanent abilities, shown greyed-out in the Abilities section until you qualify. There's no class to pick — anyone who invests enough points in an attribute gets the ability tied to it.",
  },
  {
    title: "Combat basics",
    body: "When a fight starts, a red combat panel appears with Attack, Defend, and Flee. Attack can land as a critical hit (chance driven by DEX) for extra damage. Defend reduces incoming damage. Flee tries to escape the fight entirely (also DEX-driven) — success isn't guaranteed.",
  },
  {
    title: "Combat abilities",
    body: "If you've unlocked Power Strike (STR 20) or Second Wind (CON 20), extra buttons appear in the combat panel. Power Strike hits much harder but leaves you open to a bigger counter-hit. Second Wind heals you once per fight. At STR 50, a solid hit may also make a weaker enemy break and flee outright — no reward, but the danger's over.",
  },
  {
    title: "Gear & items",
    body: "Equip weapons and armor from your Inventory for permanent ATK/DEF bonuses while worn. Use consumables (potions, rations) any time to heal — no need to wait for a fight.",
  },
  {
    title: "Shops",
    body: "Merchants let you buy and sell. Prices shift based on your Charisma and how much that specific NPC trusts you — the same item can cost very different amounts depending on who you're trading with.",
  },
  {
    title: "NPCs & reputation",
    body: "NPCs track trust, respect, and fear based on how you treat them. Enough trust can mean better prices or new quests; enough fear can make an NPC outright refuse to deal with you.",
  },
  {
    title: "Saving & hiccups",
    body: "The game autosaves after every action — just close and come back anytime. If you ever see \"The DM lost the thread\" with a red Retry button, that's a connection hiccup with the AI, not something you did wrong or something broken in your save. Tap Retry, or wait a minute and try again.",
  },
];

const initialWorldState = {
  locationId: "loc_1",
  // Locations are graph nodes now, not flat strings: { name, connections: [otherLocationIds] }.
  // The graph isn't hand-authored — it builds itself from actual travel. Whenever the
  // player's location changes, code links the old and new location bidirectionally,
  // so the map always reflects real established routes rather than a fixed layout that
  // would fight against how Claude introduces places dynamically during play.
  locations: { loc_1: { name: "The Crossroads Inn, edge of Millbrook village", connections: [] } },
  npcs: [],
  reputation: "Unknown — a stranger passing through",
  worldFacts: [],
};

// ---- Deterministic combat math. No AI involved in any of this. ----

function rollDamage(base, targetDefense) {
  const variance = Math.floor(Math.random() * 4) - 1; // -1..+2
  return Math.max(1, base + variance - Math.floor(targetDefense / 2));
}

// DEX-driven dodge: rolled once per incoming hit, independent of the damage roll itself.
// A dodge means the attack lands but does nothing — still worth narrating as a real near
// miss, not silence.
function rollIncomingHit(enemyAttack, defenseTotal, dodgeChancePercent) {
  if (Math.random() * 100 < dodgeChancePercent) {
    return { dmg: 0, dodged: true };
  }
  return { dmg: rollDamage(enemyAttack, defenseTotal), dodged: false };
}

// DEX-driven critical hits: a flat 1.5x multiplier on an already-rolled damage number,
// rather than its own separate roll — keeps one source of truth for "how hard did this
// swing land" instead of two competing damage formulas.
function rollOutgoingHit(atk, enemyDefense, critChancePercent, critMultiplier = 1.5) {
  const dmg = rollDamage(atk, enemyDefense);
  const crit = Math.random() * 100 < critChancePercent;
  return { dmg: crit ? Math.round(dmg * critMultiplier) : dmg, crit };
}

function rollGoldForTier(tier) {
  const [lo, hi] = GOLD_TIERS[tier] || GOLD_TIERS.small;
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function addXp(character, amount) {
  let { xp, level, pendingAttributePoints } = character;
  pendingAttributePoints = pendingAttributePoints || 0;
  xp += amount;
  const levelUps = [];
  let healToFull = false;
  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level += 1;
    pendingAttributePoints += ATTRIBUTE_POINTS_PER_LEVEL;
    healToFull = true; // leveling still tops you off, even before you've spent the points
    levelUps.push(level);
  }
  const newMaxHp = getEffectiveStats({ ...character, attributes: character.attributes }).maxHp;
  return { ...character, xp, level, pendingAttributePoints, hp: healToFull ? newMaxHp : character.hp, levelUps };
}

// ---- AI calls. System prompts explicitly forbid the model from inventing numbers. ----

const EXPLORATION_SYSTEM_PROMPT = `You are the narrator for a fantasy RPG. You do NOT control game numbers — HP, gold amounts, XP, and combat math are all handled by game code, not you. Your job is narration and deciding WHAT happens qualitatively, never how much.

You'll receive the current WORLD STATE, CHARACTER SUMMARY (level/rough HP status/inventory/active quests/notable traits — for narrative color only), and the player's action.

If CHARACTER SUMMARY includes "notableTraits" (e.g. "Strength: Skilled"), feel free to let those color your narration when relevant — a strong character might force a door, a perceptive one might notice something others miss — but never state the underlying number, and never let a trait's absence mean the player categorically fails at something; these are flavor, not hard gates. The same goes for "narrativeAbilities" (e.g. "Keen Analysis: You notice details others miss") — weave them in when they fit the scene, but they're color, not permission or denial for anything mechanical.

CHARACTER SUMMARY also includes "name", "race", "background", "backgroundNote", "gender", "age", "appearance", "voice", and "backstory". Use the player's name naturally sometimes (NPCs addressing them, narration referencing them) — but don't force it into every paragraph, and second person ("you") is still your default voice. Race, background, gender, age, and appearance are flavor for physical description and reputation, never a mechanical gate (an Elf isn't secretly better at anything the numbers don't already say, and a Noble isn't guaranteed a warm welcome everywhere). "backgroundNote" is a recognition cue (e.g. a Farmer's "villagers warm to you quickly") — let it surface when a scene plausibly involves people who'd notice, not every scene. "voice" (e.g. "Rough", "Noble") should color how the player's own manner and implied dialogue read, not how NPCs speak. Treat "backstory" as established, private history — you can have it surface in the world (a stranger who recognizes something about them, a rumor that fits) but never contradict it, and never expose details the player hasn't chosen to share in-fiction just because you know them.

IMPORTANT — identity: WORLD STATE gives every NPC a stable "id" (e.g. "npc_3") and every known place a stable id inside "locations" (e.g. "loc_2"). Whenever you reference an EXISTING NPC or place in structured fields (npcUpdates, npc_relationship, shop_open, or moving to a known location), you MUST use that exact id — never their name or a paraphrase of the place. Names and display text can vary in your prose however you like; ids must be copied exactly. Only omit an id when you are introducing someone or somewhere brand new, since code assigns the id for anything new.

Rules:
- Narrate 2-4 short vivid paragraphs, second person.
- NEVER state specific HP, gold, or XP numbers in your narration — code reports those separately.
- NEVER contradict existing world state (dead NPCs stay dead, hostile factions stay hostile, etc).
- Only emit an "encounter" event when the fiction genuinely calls for a fight.
- Use "tier" (small/medium/large) for any loot/gold/quest reward — never a specific amount.

Respond with ONLY valid JSON, no markdown fences, no preamble:
{
  "narration": "string",
  "stateUpdates": {
    "location": null,
    "newNPCs": [{"name": "string", "memory": "short fact"}],
    "npcUpdates": [{"id": "string — exact existing npc id from WORLD STATE", "memory": "updated fact"}],
    "reputationDelta": "string or null",
    "worldFacts": ["short new persistent facts, if any"]
  },
  "events": [
    {"type": "encounter", "enemyType": "goblin|wolf|bandit|skeleton"},
    {"type": "loot", "itemName": "string", "consumableKind": "minor_healing|healing|major_healing|ration|null", "equipmentKey": "rusty_dagger|steel_dagger|iron_sword|silver_rapier|war_axe|oak_staff|robes|leather_armor|chainmail|plate_armor|null"},
    {"type": "gold_found", "tier": "small|medium|large"},
    {"type": "gold_spent", "tier": "small|medium|large", "reason": "short description, e.g. 'a room for the night'"},
    {"type": "quest_offer", "title": "string", "description": "string", "tier": "small|medium|large", "requiresNpcId": "string, optional — exact existing npc id this quest depends on trusting", "minTrust": "number, optional — minimum trust with that npc, only meaningful alongside requiresNpcId"},
    {"type": "quest_complete", "title": "string — must match an active quest title exactly"},
    {"type": "npc_relationship", "id": "string — exact existing npc id from WORLD STATE", "interaction": "helped|betrayed|threatened|impressed|protected|insulted|spared|smallKindness|smallSlight"},
    {"type": "shop_open", "id": "string — exact existing npc id from WORLD STATE", "merchantType": "general_store|blacksmith|apothecary|fence"}
  ],
  "suggestedActions": ["string", "string", "string"]
}

For "location": use null if unchanged; {"existingId": "loc_2"} to move to an already-known place from WORLD STATE.locations; or {"newDisplayName": "string"} to introduce a brand-new place — code will assign it an id.

Each entry in WORLD STATE.locations has a "connections" array — the other location ids directly reachable from it based on where the player has actually traveled before. Moving to a location already listed in the current location's connections is a short, ordinary trip — narrate it briefly. Moving to a known location that ISN'T in the current connections (somewhere the player has heard of but never traveled to directly from here) should read like a real journey — time passing, distance covered — rather than an instant unexplained jump, even though it's still a single action. Code will automatically treat any move as establishing a new direct route between the two places, so once you've narrated that journey once, future trips between them can be brief.

Omit event types that don't apply this turn — an empty array is fine and common.

Whenever your narration describes the player paying for anything — a room, a meal, a bribe, goods from a merchant — you MUST include a matching "gold_spent" event with an appropriate tier. Narrating a purchase without the matching event means the cost never actually happens to the player's gold, which breaks the game's economy — never narrate spending money without it.

If what's purchased is a physical, carryable good (food, drink, supplies, a trinket, equipment) rather than a pure service (lodging, information, a favor), ALSO include a matching "loot" event so it lands in the player's inventory — narrate it as something they now have, not something already consumed on the spot, even for food or drink. The player decides later when to use it.

For "loot" events: set "consumableKind" ONLY when the item is a usable curative the player could consume later — a healing potion, an elixir, a ration, a poultice — and it must be one of the four fixed kinds listed above (pick whichever best matches the narrative potency you described: minor_healing < healing < major_healing; rations are always "ration"). For anything else — weapons, armor, quest items, trinkets, keys, curios — omit consumableKind or set it to null. Never invent a new kind, and never tag equipment or quest items as consumable.

Likewise, set "equipmentKey" ONLY when the item is a wearable weapon or armor piece, and it must be exactly one of the fixed keys listed above — pick whichever fits your narration best (e.g. narrating "a battered iron blade" would use "iron_sword"; "a suit of banded steel" would use "chainmail"). A single item should have at most ONE of consumableKind or equipmentKey set, never both — pick whichever the item actually is, or leave both null for quest items, trinkets, and curios with no coded effect yet. Never invent a new equipment key.

Every item you loot is automatically assigned a rarity by code (Common through Mythic) using fixed drop odds — you have no input into this and never see or set it. Narrate loot however the scene calls for; don't try to hedge your description toward a "safe" rarity, since the actual tier is decided independently and reported separately in the game's own log line.

For npc_relationship: use this liberally for small, easy-to-miss moments, not just dramatic ones — a passing kindness or a minor slight is exactly as valid as betrayal or heroics. Never invent an interaction label outside the fixed list above; if nothing fits, omit the event.

For "shop_open": use this whenever the player's action would plausibly put them in front of a merchant to browse or trade — approaching a shopkeeper, stepping into a store, asking a trader what they have. The NPC being shopped with MUST already exist (introduce them via newNPCs first if they're new, then use their id — never open a shop on the same turn you introduce the NPC, since their id isn't assigned until after this turn resolves; narrate the approach that turn and let the player's next action open the shop). Pick "merchantType" based on what kind of trader the fiction calls for: "general_store" for a village shop selling odds and ends, "blacksmith" for weapons/armor, "apothecary" for potions/herbs/curatives, "fence" for a black-market or disreputable buyer/seller who deals in stolen or rare goods, usually found in shadier settings. Code handles the actual stock and prices — never narrate specific prices or invent items in the shop yourself. If an NPC's fear value in WORLD STATE is very high (7+), code will silently refuse to open their shop — so don't narrate a hostile, frightened NPC warmly welcoming the player to trade; narrate the refusal or distrust instead. Likewise, an NPC with high trust (5+) genuinely does give the player better prices and one with very low/negative trust gives worse ones — feel free to reflect that in narration (a warm discount, a suspicious markup) since it's already true in the numbers.

For "quest_offer": most quests need no gating. Use "requiresNpcId" + "minTrust" only when the fiction genuinely implies an NPC wouldn't share this with a stranger or someone they distrust — a secret, a family matter, something risky. Code enforces the threshold; if it isn't met, the quest is silently not created even though you narrated the offer, so avoid narrating a confident "quest accepted" beat for a gated quest — narrate the NPC's actual willingness (hesitant, testing the player, holding back) and let a future turn re-offer it once trust has grown.`;

const COMBAT_NARRATION_SYSTEM_PROMPT = `You are narrating one exchange of combat in a fantasy RPG. Game code has ALREADY resolved the mechanics — damage dealt, HP remaining, victory/defeat — and gives you those exact facts. Your only job is to narrate that outcome vividly in 2-3 sentences.

CRITICAL: Do not invent a different outcome, different damage, or different result than what's given. You are describing what already happened, not deciding it.

The facts may include "playerCrit": true (the player's attack landed as a solid, exceptional hit — narrate it as such) or "playerDodged": true (an incoming attack was cleanly evaded and dealt no damage at all — narrate an actual dodge, not just a graze). They may also include "powerStrike": true (the player committed to an unusually heavy, all-in blow — narrate bigger wind-up and impact, and note they're left a little exposed), "secondWindHeal": a number (the player caught a genuine second wind and recovered that much health mid-fight — narrate a real moment of resilience, not a minor breather), or "enemyFled": true (the enemy's nerve broke entirely and they ran — this is NOT a defeat, narrate them escaping alive, rattled).

Respond with ONLY valid JSON: {"narration": "string"}`;

// ---- Economy: merchants and item values. All code-owned, same philosophy as combat. ----
// Claude only ever says WHICH merchant archetype a shop is (via shop_open's merchantType).
// Every price, every stocked item, and every merchant's buying budget lives here.

// Base gold value for every tradeable item. This is the single source of truth other
// price math is derived from — a merchant's buy/sell price is always this value times
// that merchant's category multiplier, never a number Claude supplies.
// Rarity lives on the item INSTANCE, not the item type — the same iron_sword can drop
// Common or Legendary, with these fixed multipliers scaling its stats and value. Claude
// only ever picks one of these six labels to match its narration (same pattern as how it
// already picks equipmentKey/consumableKind from a fixed vocabulary) — it never touches
// the actual multiplier numbers. Shops only ever sell Common stock; anything above that
// only comes from what you find, not what you can buy.
const RARITY_TIERS = {
  common: { label: "Common", color: "#8B8577", valueMult: 1, statMult: 1 },
  uncommon: { label: "Uncommon", color: "#5FAE7D", valueMult: 1.6, statMult: 1.15 },
  rare: { label: "Rare", color: "#5B9BD5", valueMult: 2.75, statMult: 1.3 },
  epic: { label: "Epic", color: "#A66BC9", valueMult: 4.5, statMult: 1.5 },
  legendary: { label: "Legendary", color: "#C89B4A", valueMult: 8, statMult: 1.75 },
  mythic: { label: "Mythic", color: "#B23A3A", valueMult: 15, statMult: 2 },
};

// Drop odds — the single source of truth for how likely each tier is. Percentages, not
// a raw 0-1 weight, so they're directly readable/tunable, and they're shown to the
// player exactly as written here (see the Inventory ledger caption). Rarity is now
// entirely a code-rolled dice check: Claude never sets or influences it, which is what
// actually fixes the "rarity inflation" risk of trusting narration to pick a fair tier.
const RARITY_DROP_WEIGHTS = {
  common: 55,
  uncommon: 25,
  rare: 12,
  epic: 5,
  legendary: 2.5,
  mythic: 0.5,
};

function rollRarity() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const [tier, weight] of Object.entries(RARITY_DROP_WEIGHTS)) {
    cumulative += weight;
    if (roll < cumulative) return tier;
  }
  return "common"; // floating-point safety net — should only matter for the last fraction of a percent
}

function rarityOf(item) {
  return RARITY_TIERS[item?.rarity] ? item.rarity : "common";
}

const ITEM_VALUE_TABLE = {
  // consumables
  minor_healing: 8,
  healing: 18,
  major_healing: 40,
  ration: 4,
  // equipment
  rusty_dagger: 6,
  steel_dagger: 16,
  iron_sword: 30,
  silver_rapier: 34,
  war_axe: 42,
  oak_staff: 26,
  robes: 10,
  leather_armor: 22,
  chainmail: 48,
  plate_armor: 85,
  // starting-tier weapons — all valued like rusty_dagger, same reasoning as the atk parity
  starting_sword: 6,
  starting_axe: 6,
  starting_spear: 6,
  starting_bow: 6,
  starting_staff: 6,
  starting_hammer: 6,
};

function itemCategory(item) {
  if (item.equipmentKey) return EQUIPMENT_TABLE[item.equipmentKey]?.slot === "weapon" ? "weapon" : "armor";
  if (item.consumableKind) return "consumable";
  return "misc";
}

// Merchant archetypes. "buyMultiplier" is what fraction of ITEM_VALUE_TABLE the merchant
// pays the player when the player sells; "sellMarkup" is what multiple of value the
// merchant charges the player when buying from them. "startingGold" is the merchant's own
// spending budget for buying from the player — once it runs dry, they simply can't afford
// any more of your loot until it replenishes, which is the whole point: no single merchant
// is a bottomless drain for your inventory, so a canny player spreads sales around instead
// of dumping everything on the first trader they meet. "stock" is the fixed catalog of keys
// they sell (drawn from CONSUMABLE_TABLE / EQUIPMENT_TABLE), each with a limited quantity.
const MERCHANT_TYPES = {
  general_store: {
    label: "General Store",
    buyMultiplier: { weapon: 0.35, armor: 0.35, consumable: 0.45, misc: 0.2 },
    sellMarkup: 1.3,
    startingGold: 70,
    goldRegenPerVisit: 15,
    stock: [
      { key: "ration", quantity: 6 },
      { key: "minor_healing", quantity: 3 },
      { key: "rusty_dagger", quantity: 2 },
      { key: "robes", quantity: 2 },
    ],
  },
  blacksmith: {
    label: "Blacksmith",
    buyMultiplier: { weapon: 0.65, armor: 0.65, consumable: 0.1, misc: 0.15 },
    sellMarkup: 1.25,
    startingGold: 160,
    goldRegenPerVisit: 25,
    stock: [
      { key: "steel_dagger", quantity: 2 },
      { key: "iron_sword", quantity: 1 },
      { key: "war_axe", quantity: 1 },
      { key: "leather_armor", quantity: 2 },
      { key: "chainmail", quantity: 1 },
    ],
  },
  apothecary: {
    label: "Apothecary",
    buyMultiplier: { weapon: 0.1, armor: 0.1, consumable: 0.7, misc: 0.2 },
    sellMarkup: 1.35,
    startingGold: 55,
    goldRegenPerVisit: 12,
    stock: [
      { key: "minor_healing", quantity: 4 },
      { key: "healing", quantity: 2 },
      { key: "major_healing", quantity: 1 },
      { key: "oak_staff", quantity: 1 },
    ],
  },
  fence: {
    label: "Fence",
    buyMultiplier: { weapon: 0.8, armor: 0.8, consumable: 0.6, misc: 0.5 },
    sellMarkup: 1.85,
    startingGold: 220,
    goldRegenPerVisit: 20,
    stock: [
      { key: "silver_rapier", quantity: 1 },
      { key: "chainmail", quantity: 1 },
      { key: "healing", quantity: 2 },
    ],
  },
};

// A fixed line the raw NPC_INTERACTION_TABLE deltas can cross: once an NPC's fear
// reaches this, code treats them as outright hostile rather than merely wary — no AI
// judgment call, just a number crossing a threshold. Right now that means a hostile
// NPC refuses to run their shop for you; a natural hook for future hostile-NPC
// mechanics (refusing quests, alerting guards) as they get built.
const HOSTILE_FEAR_THRESHOLD = 7;
function isHostile(npc) {
  return (npc.fear || 0) >= HOSTILE_FEAR_THRESHOLD;
}

// Trust doesn't just sit on the ledger — it nudges merchant pricing. Code looks this up
// from the NPC's own trust value; Claude never sets or narrates the percentages, it only
// ever sees the resulting prices (and can flavor narration once it notices a good deal,
// e.g. "she waves off a few coins for you").
function trustPriceModifier(trust) {
  if (trust >= 8) return { buyMult: 0.85, sellMult: 1.2 };
  if (trust >= 5) return { buyMult: 0.92, sellMult: 1.1 };
  if (trust <= -8) return { buyMult: 1.25, sellMult: 0.75 };
  if (trust <= -5) return { buyMult: 1.15, sellMult: 0.85 };
  return { buyMult: 1, sellMult: 1 };
}

// Charisma has its own, smaller effect on the same prices, stacking with trust rather
// than replacing it — a silver tongue helps at every shop, a trusted regular still does
// best of all. 10 is the baseline (average) score; every point above/below nudges price
// a little, capped so CHA alone can't swing prices as hard as a real relationship can.
function chaPriceModifier(cha) {
  const diff = clamp(cha - 10, -30, 30);
  const buyMult = clamp(1 - diff * 0.004, 0.85, 1.15);
  const sellMult = clamp(1 + diff * 0.004, 0.85, 1.15);
  return { buyMult, sellMult };
}

function buyPriceFor(merchantType, key, npcTrust = 0, playerCha = 10, hasSilverTongue = false, hasMerchantBackground = false) {
  const merchant = MERCHANT_TYPES[merchantType];
  const value = ITEM_VALUE_TABLE[key] || 0;
  const trustMod = trustPriceModifier(npcTrust);
  const chaMod = chaPriceModifier(playerCha);
  const silverTongueMult = hasSilverTongue ? 0.94 : 1;
  const backgroundMult = hasMerchantBackground ? 0.97 : 1;
  return Math.max(1, Math.round(value * merchant.sellMarkup * trustMod.buyMult * chaMod.buyMult * silverTongueMult * backgroundMult));
}

function sellPriceFor(merchantType, item, npcTrust = 0, playerCha = 10, hasSilverTongue = false, hasMerchantBackground = false) {
  const merchant = MERCHANT_TYPES[merchantType];
  const key = item.equipmentKey || item.consumableKind;
  const baseValue = ITEM_VALUE_TABLE[key] || 0;
  const value = baseValue * RARITY_TIERS[rarityOf(item)].valueMult;
  const category = itemCategory(item);
  const trustMod = trustPriceModifier(npcTrust);
  const chaMod = chaPriceModifier(playerCha);
  const silverTongueMult = hasSilverTongue ? 1.06 : 1;
  const backgroundMult = hasMerchantBackground ? 1.03 : 1;
  return Math.max(1, Math.round(value * (merchant.buyMultiplier[category] ?? merchant.buyMultiplier.misc) * trustMod.sellMult * chaMod.sellMult * silverTongueMult * backgroundMult));
}

function displayNameForKey(key) {
  if (EQUIPMENT_TABLE[key]) {
    return key.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  }
  if (CONSUMABLE_TABLE[key]) return CONSUMABLE_TABLE[key].label;
  return key;
}

function buildAnthropicHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (typeof window !== "undefined" && window.__ANTHROPIC_API_KEY__) {
    headers["x-api-key"] = window.__ANTHROPIC_API_KEY__;
    headers["anthropic-version"] = "2023-06-01";
    headers["anthropic-dangerous-direct-browser-access"] = "true";
  }
  return headers;
}

async function callModel(systemPrompt, userMessage, maxTokens = 1200, attempt = 1, priorMessages = null, onDebug = null) {
  const messages = priorMessages || [{ role: "user", content: userMessage }];

  // The fetch() call itself can throw before any response comes back — e.g. a
  // transient hiccup in the artifact's own AI-completion bridge, distinct from the API
  // returning an HTTP error status. That's a different failure mode from !response.ok
  // below, so it needs its own retry path with the same backoff/attempt cap, or a
  // single flaky moment kills the whole turn with no chance to recover.
  let response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: buildAnthropicHeaders(),
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    });
  } catch (fetchError) {
    if (attempt < 3) {
      if (onDebug) onDebug({ stage: "fetch_threw_retrying", text: null, correctionUsed: !!priorMessages, error: `fetch() threw on attempt ${attempt}: ${fetchError.message} — retrying` });
      await new Promise((r) => setTimeout(r, 500 * attempt));
      return callModel(systemPrompt, userMessage, maxTokens, attempt + 1, priorMessages, onDebug);
    }
    if (onDebug) onDebug({ stage: "fetch_threw", text: null, correctionUsed: !!priorMessages, error: `fetch() threw after ${attempt} attempts: ${fetchError.message}` });
    throw new Error(`Connection to the DM failed after ${attempt} attempts: ${fetchError.message}`);
  }

  if (!response.ok) {
    const errText = await response.text();
    const isTransient = response.status >= 500 || response.status === 429;
    if (isTransient && attempt < 3) {
      await new Promise((r) => setTimeout(r, 500 * attempt));
      return callModel(systemPrompt, userMessage, maxTokens, attempt + 1, priorMessages, onDebug);
    }
    if (onDebug) onDebug({ stage: "http_error", text: null, correctionUsed: !!priorMessages, error: `API error ${response.status}: ${errText.slice(0, 300)}` });
    throw new Error(`API error ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  const text = data.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  const isCorrectionPass = !!priorMessages;

  const attemptCorrection = async (errorDescription) => {
    // Give Claude its own malformed output back and ask it to fix it, once, before
    // giving up. This is the actual fix for "one broken comma crashes the turn" — most
    // malformed-JSON failures are a one-off slip that self-correction resolves immediately,
    // without needing a different architecture.
    if (isCorrectionPass) return null; // already tried correcting once — don't loop forever
    if (!text || !text.trim()) {
      // The API rejects empty message content outright, so retrying with an empty
      // assistant turn would just fail a second time for an unrelated reason. Skip
      // straight to a clear, honest failure instead of masking it behind a confusing
      // low-level rejection.
      if (onDebug) onDebug({ stage: "empty_content", text, correctionUsed: false, error: `Model returned empty content (${errorDescription})` });
      throw new Error(`Model returned empty content (${errorDescription}) — nothing to correct.`);
    }
    const correctionMessages = [
      { role: "user", content: userMessage },
      { role: "assistant", content: text },
      { role: "user", content: `That response was not valid JSON (${errorDescription}). Reply with ONLY the corrected JSON object — no prose, no markdown fences, nothing else.` },
    ];
    try {
      return await callModel(systemPrompt, userMessage, maxTokens, 1, correctionMessages, onDebug);
    } catch (correctionError) {
      // Label this clearly as a correction-attempt failure, and preserve what the
      // ORIGINAL malformed text looked like — that's the actually useful debugging info,
      // and it would otherwise be lost once the correction attempt also throws.
      throw new Error(
        `Correction attempt itself failed: ${correctionError.message} | Original malformed text was: ${text.slice(0, 300)}`
      );
    }
  };

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    const corrected = await attemptCorrection("no JSON object found in the response");
    if (corrected) return corrected;
    if (onDebug) onDebug({ stage: "no_json_found", text, correctionUsed: isCorrectionPass, error: "No JSON object found, even after correction" });
    throw new Error(`No JSON object found in response, even after asking for a correction. Raw text: ${text.slice(0, 400)}`);
  }
  try {
    const parsed = JSON.parse(text.slice(firstBrace, lastBrace + 1));
    if (onDebug) onDebug({ stage: "success", text, correctionUsed: isCorrectionPass, parsed, error: null });
    return parsed;
  } catch (e) {
    const corrected = await attemptCorrection(`JSON.parse error: ${e.message}`);
    if (corrected) return corrected;
    if (onDebug) onDebug({ stage: "parse_failed", text, correctionUsed: isCorrectionPass, error: `JSON.parse failed (${e.message}), even after correction` });
    throw new Error(`JSON.parse failed (${e.message}), even after asking for a correction. Raw text: ${text.slice(0, 400)}`);
  }
}

async function pingAPI() {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: buildAnthropicHeaders(),
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 50,
      messages: [{ role: "user", content: "Reply with exactly: pong" }],
    }),
  });
  const bodyText = await response.text();
  return { status: response.status, ok: response.ok, body: bodyText.slice(0, 500) };
}

async function pingWithSystemPrompt() {
  // Same request shape as a real DM turn (system prompt + higher max_tokens), but with a
  // trivial user message — isolates whether the *system* field itself is what fails,
  // independent of the dynamic world-state content in a real turn.
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: buildAnthropicHeaders(),
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1200,
        system: EXPLORATION_SYSTEM_PROMPT,
        messages: [{ role: "user", content: "Reply with exactly: pong" }],
      }),
    });
    const bodyText = await response.text();
    return { status: response.status, ok: response.ok, body: bodyText.slice(0, 500) };
  } catch (e) {
    return { status: "n/a", ok: false, body: `Fetch itself threw: ${e.message}` };
  }
}

async function pingRealCodePath(liveWorldState, liveCharacter, liveQuests, actionText) {
  // Exercises the ACTUAL callModel() function with the ACTUAL message-building logic AND
  // the ACTUAL live game state at the moment of failure — not a synthetic fresh-game
  // stand-in. This is what makes it a true reproduction of the failing call rather than
  // just proof that callModel works when nothing has happened yet.
  const realisticUserMessage = `WORLD STATE:\n${JSON.stringify(liveWorldState, null, 2)}\n\nCHARACTER SUMMARY (for narrative color only — do not cite numbers):\n${JSON.stringify(
    characterSummaryForPrompt(liveCharacter, liveQuests),
    null,
    2
  )}\n\nPLAYER ACTION: ${actionText}`;
  try {
    const result = await callModel(EXPLORATION_SYSTEM_PROMPT, realisticUserMessage);
    return { status: "success", ok: true, body: JSON.stringify(result).slice(0, 500) };
  } catch (e) {
    return { status: "threw", ok: false, body: `message: ${e.message}\n\nstack: ${(e.stack || "no stack available").slice(0, 800)}` };
  }
}

// Isolates whether a failure lives in callModel() itself (its retry/correction logic, its
// response parsing) versus in the size/content of the large dynamic JSON payload a real
// turn sends. Both earlier diagnostic pings bypass callModel() entirely and call fetch()
// directly, so neither one actually tests this path — this one does, with a trivial
// hand-written string instead of the JSON.stringify'd world state.
async function pingCallModelMinimal() {
  try {
    const result = await callModel(EXPLORATION_SYSTEM_PROMPT, "PLAYER ACTION: Talk to the innkeeper");
    return { status: "success", ok: true, body: JSON.stringify(result).slice(0, 500) };
  } catch (e) {
    return { status: "threw", ok: false, body: `message: ${e.message}\n\nstack: ${(e.stack || "no stack available").slice(0, 800)}` };
  }
}

function characterSummaryForPrompt(character, quests) {
  const maxHp = getEffectiveStats(character).maxHp;
  const hpStatus = character.hp <= maxHp * 0.3 ? "badly wounded" : character.hp <= maxHp * 0.7 ? "somewhat hurt" : "healthy";
  // Notable traits: only surface attributes that have actually reached a milestone
  // (20+), so an average, unremarkable adventurer doesn't get six lines of flavor text
  // — only genuinely distinctive attributes are worth Claude weaving into the prose.
  const notableTraits = Object.entries(character.attributes)
    .map(([key, value]) => {
      const milestone = milestoneFor(value);
      if (!milestone || milestone.min < 20) return null;
      return `${ATTRIBUTE_DEFS[key].label}: ${milestone.label}`;
    })
    .filter(Boolean);
  // Only the non-mechanical abilities go to Claude — the mechanical ones (Power Strike,
  // Iron Will, Silver Tongue, etc.) are entirely code's business and show up as buttons
  // and price numbers; Claude doesn't need to know about them to narrate correctly.
  const narrativeAbilities = getUnlockedAbilities(character.attributes)
    .filter((a) => !a.mechanical)
    .map((a) => `${a.label}: ${a.description}`);
  const race = character.identity ? RACE_OPTIONS.find((r) => r.key === character.identity.race) : null;
  const background = character.identity ? BACKGROUND_OPTIONS[character.identity.background] : null;
  return {
    name: character.identity?.name || "the player",
    race: race?.label || null,
    background: background?.label || null,
    backgroundNote: background?.npcTag || null,
    gender: character.identity?.gender || null,
    age: character.identity?.age || null,
    appearance: character.identity?.appearance || null,
    voice: character.identity?.voice || null,
    backstory: character.identity?.backstory || null,
    level: character.level,
    condition: hpStatus,
    notableTraits, // for narrative color only — never cite the numbers behind these
    narrativeAbilities, // flavor-only unlocked traits — never a hard mechanical gate
    inventory: character.inventory.map((item) =>
      item.quantity > 1 ? `${item.name} (x${item.quantity})` : item.name
    ),
    equipped: {
      weapon: character.equipped?.weapon?.name || "nothing",
      armor: character.equipped?.armor?.name || "nothing",
    },
    activeQuests: quests.filter((q) => q.status === "active").map((q) => q.title),
  };
}

export default function DMMemoryTest() {
  const [worldState, setWorldState] = useState(initialWorldState);
  const [character, setCharacter] = useState(initialCharacter);
  const [quests, setQuests] = useState([]);
  const [combat, setCombat] = useState(null); // { enemyType, enemy: {name,hp,maxHp,attack,defense} }
  const [shop, setShop] = useState(null); // { npcId, merchantType }
  // Monotonic ID counters — refs, not state, since incrementing them shouldn't itself
  // trigger a render. Code is the only thing that ever assigns an id; Claude only ever
  // receives and echoes them back (for npc/location ids) or never sees them at all (items).
  const nextNpcIdRef = useRef(1);
  const nextLocationIdRef = useRef(2); // loc_1 is already taken by initialWorldState
  const nextItemIdRef = useRef(3); // item_1 and item_2 are already taken by initialCharacter
  const [log, setLog] = useState(INITIAL_LOG);
  const [saveChecked, setSaveChecked] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [confirmingNewGame, setConfirmingNewGame] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailedAction, setLastFailedAction] = useState(null);
  const [diagnostic, setDiagnostic] = useState(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnostic2, setDiagnostic2] = useState(null);
  const [diagnosing2, setDiagnosing2] = useState(false);
  const [diagnostic3, setDiagnostic3] = useState(null);
  const [diagnosing3, setDiagnosing3] = useState(false);
  const [diagnostic4, setDiagnostic4] = useState(null);
  const [diagnosing4, setDiagnosing4] = useState(false);
  const [debugLog, setDebugLog] = useState([]);
  const [debugOpen, setDebugOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [needsIdentity, setNeedsIdentity] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [manualSaveExists, setManualSaveExists] = useState(false);
  const [manualSaveAt, setManualSaveAt] = useState(null);
  const [manualSaveStatus, setManualSaveStatus] = useState(null); // transient message, e.g. "Saved!" / "Loaded!"
  const [identityMode, setIdentityMode] = useState("new"); // "new" = fresh game, "migrate" = an existing save from before this system existed
  const [tutorialStep, setTutorialStep] = useState(0);
  const scrollRef = useRef(null);

  function pushDebugEntry(actionLabel, info) {
    setDebugLog((log) => {
      const entry = {
        time: new Date().toLocaleTimeString(),
        action: actionLabel,
        stage: info.stage,
        correctionUsed: info.correctionUsed,
        rawText: info.text,
        parsed: info.parsed || null,
        error: info.error || null,
      };
      // Cap history so this can't grow unbounded over a long playthrough.
      return [...log.slice(-19), entry];
    });
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [log, loading]);

  // Restores game state from a parsed save object — shared by the autosave-load-on-mount
  // effect and the manual Load button, so both go through the exact same migration
  // logic rather than two versions drifting apart over time.
  function applySavedGame(saved) {
    if (saved.worldState) {
      // Migration: saves from before the map/travel-graph system stored each
      // location as a plain display-name string instead of {name, connections}.
      // Convert those in place with empty connections — there's no way to
      // reconstruct real travel history retroactively, so the graph simply starts
      // sparse for that save and builds forward from here, same principle as the
      // other migrations above.
      const migratedLocations = {};
      Object.entries(saved.worldState.locations || {}).forEach(([id, value]) => {
        migratedLocations[id] = typeof value === "string" ? { name: value, connections: [] } : { connections: [], ...value };
      });
      setWorldState({ ...saved.worldState, locations: migratedLocations });
    }
    if (saved.character) {
      // Migration: saves from before the consumables system stored inventory as a
      // flat array of display strings. Upgrade those into item objects on load so
      // old saves keep working instead of crashing the inventory UI. Saves from
      // before the equipment system also lack "equipmentKey" on items and an
      // "equipped" field on the character entirely — default both in rather than
      // letting getEffectiveStats() crash on undefined.
      const migratedInventory = (saved.character.inventory || []).map((item) => {
        if (typeof item === "string") {
          return { id: `item_${nextItemIdRef.current++}`, name: item, consumableKind: null, equipmentKey: null, quantity: 1 };
        }
        return { equipmentKey: null, rarity: "common", ...item };
      });
      // Migration: saves from before the attribute system stored flat
      // attack/defense/maxHp and "pendingLevelUps" instead of six attributes. A
      // save like that has no principled way to reconstruct attributes from a
      // single attack number, so it resets to the standard starting attributes
      // rather than guessing — the alternative (crashing on undefined attributes)
      // is worse than a one-time reset for a prototype save.
      const migratedAttributes = saved.character.attributes || { ...initialAttributes };
      const migratedPendingPoints =
        typeof saved.character.pendingAttributePoints === "number"
          ? saved.character.pendingAttributePoints
          : typeof saved.character.pendingLevelUps === "number"
          ? saved.character.pendingLevelUps * ATTRIBUTE_POINTS_PER_LEVEL
          : 0;
      const { attack: _oldAttack, defense: _oldDefense, maxHp: _oldMaxHp, pendingLevelUps: _oldPending, ...restOfSavedCharacter } = saved.character;
      setCharacter({
        equipped: { weapon: null, armor: null },
        ...restOfSavedCharacter,
        attributes: migratedAttributes,
        pendingAttributePoints: migratedPendingPoints,
        inventory: migratedInventory,
      });
    }
    if (saved.quests) setQuests(saved.quests);
    if (saved.log) setLog(saved.log);
    if (saved.combat !== undefined) setCombat(saved.combat);
    setShop(null); // shop panels never persist — always resume back out in the world
    // Restoring the id counters is essential, not optional — without this, a fresh
    // session would start both counters back at their defaults and the next new NPC,
    // location, or item would collide with an id that already exists.
    if (typeof saved.nextNpcId === "number") nextNpcIdRef.current = saved.nextNpcId;
    if (typeof saved.nextLocationId === "number") nextLocationIdRef.current = saved.nextLocationId;
    // Only trust a saved nextItemId if it's ahead of whatever the migration step above
    // may have already consumed — otherwise a save from before consumables existed
    // would hand us back a stale (too-low) counter.
    if (typeof saved.nextItemId === "number") nextItemIdRef.current = Math.max(saved.nextItemId, nextItemIdRef.current);
  }

  // Builds the exact same payload shape used by both autosave and the manual Save
  // button — one source of truth for what a "save" actually contains.
  function buildSavePayload() {
    return JSON.stringify({
      worldState,
      character,
      quests,
      log,
      combat,
      nextNpcId: nextNpcIdRef.current,
      nextLocationId: nextLocationIdRef.current,
      nextItemId: nextItemIdRef.current,
    });
  }

  // Load any existing save exactly once on mount. Accessing a nonexistent key throws
  // rather than returning null, so "no save yet" is handled via the catch block, not
  // a null check — that's the expected, common path on a first-ever run.
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(SAVE_KEY, false);
        if (result && result.value) {
          const saved = JSON.parse(result.value);
          applySavedGame(saved);
          // A save from before this system existed simply has no identity field — that's
          // a "migrate" case (fill in identity, keep everything else exactly as it was),
          // distinct from a genuinely brand-new game where nothing has happened yet.
          if (!saved.character?.identity) {
            setNeedsIdentity(true);
            setIdentityMode("migrate");
          }
        } else {
          setNeedsIdentity(true);
          setIdentityMode("new");
        }
      } catch (e) {
        // No save yet, or the read failed — starting fresh is correct here.
        setNeedsIdentity(true);
        setIdentityMode("new");
      } finally {
        setSaveChecked(true);
      }
    })();
  }, []);

  // Auto-open the tutorial exactly once, the first time anyone ever loads the game on
  // this device — a missing key (never seen it) throws rather than returning null, same
  // pattern as the save-load check above, so "never seen it" is the catch branch.
  useEffect(() => {
    (async () => {
      try {
        await window.storage.get(TUTORIAL_SEEN_KEY, false);
      } catch (e) {
        setTutorialOpen(true);
      }
    })();
  }, []);

  async function markTutorialSeen() {
    try {
      await window.storage.set(TUTORIAL_SEEN_KEY, "true", false);
    } catch (e) {
      // Best-effort — worst case the tutorial just offers to open again next time.
    }
  }

  function closeTutorial() {
    setTutorialOpen(false);
    setTutorialStep(0);
    markTutorialSeen();
  }

  // Autosave on every change, once the initial load check has completed. Gating on
  // saveChecked prevents the brief default-state render (before a real save loads)
  // from overwriting that real save with blank data.
  useEffect(() => {
    if (!saveChecked) return;
    (async () => {
      try {
        const payload = buildSavePayload();
        const result = await window.storage.set(SAVE_KEY, payload, false);
        if (result) setLastSavedAt(new Date().toLocaleTimeString());
      } catch (e) {
        // Best-effort — a failed save write shouldn't interrupt gameplay.
      }
    })();
  }, [worldState, character, quests, log, combat, saveChecked]);

  // Check once on mount whether a manual save already exists, so the Load button knows
  // whether to enable itself and can show when that save was actually made.
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(MANUAL_SAVE_KEY, false);
        if (result && result.value) {
          setManualSaveExists(true);
          const saved = JSON.parse(result.value);
          if (saved.savedAt) setManualSaveAt(new Date(saved.savedAt).toLocaleTimeString());
        }
      } catch (e) {
        // No manual save yet — Load button just stays disabled.
      }
    })();
  }, []);

  function flashManualSaveStatus(message) {
    setManualSaveStatus(message);
    setTimeout(() => setManualSaveStatus((current) => (current === message ? null : current)), 2200);
  }

  // Writes to MANUAL_SAVE_KEY only — entirely separate from the autosave slot, which
  // keeps running in the background the whole time regardless of whether this is ever
  // pressed.
  async function manualSave() {
    try {
      const payload = { ...JSON.parse(buildSavePayload()), savedAt: new Date().toISOString() };
      const result = await window.storage.set(MANUAL_SAVE_KEY, JSON.stringify(payload), false);
      if (result) {
        setManualSaveExists(true);
        setManualSaveAt(new Date().toLocaleTimeString());
        flashManualSaveStatus("Saved!");
      } else {
        flashManualSaveStatus("Save failed.");
      }
    } catch (e) {
      flashManualSaveStatus("Save failed.");
    }
  }

  // Reads MANUAL_SAVE_KEY and restores exactly that checkpoint — whatever's happened
  // since the last manual save (including autosaves) is overwritten in memory, though
  // the autosave slot itself is untouched until the next autosave tick.
  async function manualLoad() {
    try {
      const result = await window.storage.get(MANUAL_SAVE_KEY, false);
      if (result && result.value) {
        applySavedGame(JSON.parse(result.value));
        flashManualSaveStatus("Loaded!");
      } else {
        flashManualSaveStatus("No save found.");
      }
    } catch (e) {
      flashManualSaveStatus("Load failed.");
    }
  }

  async function startNewGame() {
    try {
      await window.storage.delete(SAVE_KEY, false);
    } catch (e) {
      // Deleting a key that was never set is fine — nothing to clean up.
    }
    setWorldState(initialWorldState);
    setCharacter(initialCharacter);
    setQuests([]);
    setCombat(null);
    setShop(null);
    setLog(INITIAL_LOG);
    nextNpcIdRef.current = 1;
    nextLocationIdRef.current = 2;
    nextItemIdRef.current = 3;
    setLastSavedAt(null);
    setConfirmingNewGame(false);
    setPauseOpen(false);
    setIdentityMode("new");
    setNeedsIdentity(true);
  }

  // Called once from CharacterCreationScreen. "new" builds a fresh opening scene around
  // the chosen identity; "migrate" only ever attaches identity to an in-progress save —
  // it must never touch attributes, inventory, quests, or the log, since that would
  // silently erase real progress just because the player hadn't named themselves yet.
  // Assembles starting inventory from the chosen weapon plus the default rations, then
  // merges in the background's starting item if it has one (stacking onto an existing
  // matching entry rather than creating a duplicate stack).
  function buildStartingInventory(weaponKey, backgroundKey) {
    const weapon = STARTING_WEAPON_OPTIONS[weaponKey] || STARTING_WEAPON_OPTIONS.dagger;
    const background = BACKGROUND_OPTIONS[backgroundKey];
    const items = [
      { id: `item_${nextItemIdRef.current++}`, name: weapon.name, consumableKind: null, equipmentKey: weapon.equipmentKey, rarity: "common", quantity: 1 },
      { id: `item_${nextItemIdRef.current++}`, name: "Rations", consumableKind: "ration", equipmentKey: null, rarity: "common", quantity: 3 },
    ];
    if (background?.startingItem) {
      const si = background.startingItem;
      const match = items.find((i) => i.name === si.name && i.consumableKind === (si.consumableKind || null) && i.equipmentKey === (si.equipmentKey || null));
      if (match) {
        match.quantity += 1;
      } else {
        items.push({ id: `item_${nextItemIdRef.current++}`, name: si.name, consumableKind: si.consumableKind || null, equipmentKey: si.equipmentKey || null, rarity: "common", quantity: 1 });
      }
    }
    return items;
  }

  function submitIdentity(identity) {
    if (identityMode === "new") {
      const background = BACKGROUND_OPTIONS[identity.background] || BACKGROUND_OPTIONS.farmer;
      const startingAttributes = { ...initialAttributes };
      Object.entries(background.bonus).forEach(([key, amount]) => {
        startingAttributes[key] = Math.min(ATTRIBUTE_CAP, startingAttributes[key] + amount);
      });
      const startingGold = 10 + (background.startingGold || 0);
      const startingInventory = buildStartingInventory(identity.weapon, identity.background);
      setCharacter({ ...initialCharacter, attributes: startingAttributes, gold: startingGold, inventory: startingInventory, identity });
      setLog([craftOpeningNarration(identity)]);
    } else {
      setCharacter((c) => ({ ...c, identity }));
      pushSystemLine(`✎ ${identity.name} — the story continues.`);
    }
    setNeedsIdentity(false);
  }

  async function runDiagnostic() {
    setDiagnosing(true);
    setDiagnostic(null);
    try {
      setDiagnostic(await pingAPI());
    } catch (e) {
      setDiagnostic({ status: "n/a", ok: false, body: `Fetch itself threw: ${e.message}` });
    } finally {
      setDiagnosing(false);
    }
  }

  async function runDiagnostic2() {
    setDiagnosing2(true);
    setDiagnostic2(null);
    setDiagnostic2(await pingWithSystemPrompt());
    setDiagnosing2(false);
  }

  async function runDiagnostic3() {
    setDiagnosing3(true);
    setDiagnostic3(null);
    const actionToTest = lastFailedAction || "Talk to the innkeeper";
    setDiagnostic3(await pingRealCodePath(worldState, character, quests, actionToTest));
    setDiagnosing3(false);
  }

  async function runDiagnostic4() {
    setDiagnosing4(true);
    setDiagnostic4(null);
    setDiagnostic4(await pingCallModelMinimal());
    setDiagnosing4(false);
  }

  function pushSystemLine(text) {
    setLog((l) => [...l, { role: "system", text }]);
  }

  // Adds a looted item to inventory, stacking onto an existing entry of the same name/
  // consumableKind/equipmentKey if one exists, or creating a fresh entry with a
  // code-assigned id.
  function addItemToInventory(itemName, consumableKind, equipmentKey, rarity = "common") {
    const safeRarity = RARITY_TIERS[rarity] ? rarity : "common";
    setCharacter((c) => {
      // Rarity is part of what makes an item the same stack — a Common Iron Sword and a
      // Legendary Iron Sword share an equipmentKey but are not the same item, so they
      // must never merge into one quantity.
      const idx = c.inventory.findIndex(
        (i) => i.name === itemName && i.consumableKind === (consumableKind || null) && i.equipmentKey === (equipmentKey || null) && (i.rarity || "common") === safeRarity
      );
      if (idx >= 0) {
        const next = [...c.inventory];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return { ...c, inventory: next };
      }
      const newItem = {
        id: `item_${nextItemIdRef.current++}`,
        name: itemName,
        consumableKind: consumableKind || null,
        equipmentKey: equipmentKey || null,
        rarity: safeRarity,
        quantity: 1,
      };
      return { ...c, inventory: [...c.inventory, newItem] };
    });
  }

  // Equipping is entirely code-resolved, same as using a consumable — no AI call, and the
  // atk/def bonus always comes from EQUIPMENT_TABLE, never from the item's display name.
  function equipItem(itemId) {
    const idx = character.inventory.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    const item = character.inventory[idx];
    const def = EQUIPMENT_TABLE[item.equipmentKey];
    if (!def) return; // not equippable
    const slot = def.slot;
    const previouslyEquipped = character.equipped?.[slot] || null;

    setCharacter((c) => {
      // Pull the one copy being equipped out of inventory.
      const invIdx = c.inventory.findIndex((i) => i.id === itemId);
      if (invIdx === -1) return c;
      const invItem = c.inventory[invIdx];
      let nextInventory = [...c.inventory];
      if (invItem.quantity > 1) {
        nextInventory[invIdx] = { ...invItem, quantity: invItem.quantity - 1 };
      } else {
        nextInventory.splice(invIdx, 1);
      }

      // Whatever was previously in that slot goes back into inventory, stacking if a
      // matching entry already exists (rarity must match too — see addItemToInventory).
      if (previouslyEquipped) {
        const mergeIdx = nextInventory.findIndex(
          (i) => i.name === previouslyEquipped.name && i.equipmentKey === previouslyEquipped.equipmentKey && (i.rarity || "common") === (previouslyEquipped.rarity || "common")
        );
        if (mergeIdx >= 0) {
          nextInventory[mergeIdx] = { ...nextInventory[mergeIdx], quantity: nextInventory[mergeIdx].quantity + 1 };
        } else {
          nextInventory.push({
            id: previouslyEquipped.id,
            name: previouslyEquipped.name,
            consumableKind: null,
            equipmentKey: previouslyEquipped.equipmentKey,
            rarity: previouslyEquipped.rarity || "common",
            quantity: 1,
          });
        }
      }

      return {
        ...c,
        inventory: nextInventory,
        equipped: { ...c.equipped, [slot]: { id: invItem.id, name: invItem.name, equipmentKey: invItem.equipmentKey, rarity: invItem.rarity || "common" } },
      };
    });
    pushSystemLine(
      `⚔ Equipped ${item.name}${previouslyEquipped ? ` (unequipped ${previouslyEquipped.name})` : ""} — ${slot === "weapon" ? `+${def.atkBonus} ATK` : `+${def.defBonus} DEF`}`
    );
  }

  function unequipItem(slot) {
    const equippedItem = character.equipped?.[slot];
    if (!equippedItem) return;
    setCharacter((c) => {
      const mergeIdx = c.inventory.findIndex((i) => i.name === equippedItem.name && i.equipmentKey === equippedItem.equipmentKey && (i.rarity || "common") === (equippedItem.rarity || "common"));
      let nextInventory;
      if (mergeIdx >= 0) {
        nextInventory = [...c.inventory];
        nextInventory[mergeIdx] = { ...nextInventory[mergeIdx], quantity: nextInventory[mergeIdx].quantity + 1 };
      } else {
        nextInventory = [
          ...c.inventory,
          { id: equippedItem.id, name: equippedItem.name, consumableKind: null, equipmentKey: equippedItem.equipmentKey, rarity: equippedItem.rarity || "common", quantity: 1 },
        ];
      }
      return { ...c, inventory: nextInventory, equipped: { ...c.equipped, [slot]: null } };
    });
    pushSystemLine(`↓ Unequipped ${equippedItem.name}`);
  }

  // Using a consumable is entirely code-resolved — no AI call needed, matching how gold
  // and loot already work. The effect amount comes only from CONSUMABLE_TABLE, never from
  // whatever Claude originally called the item in its narration.
  // Spending an attribute point is entirely code-resolved, same as equipping gear or
  // using a consumable — no AI call. Full build freedom, on purpose: nothing here stops
  // a player from dumping every point into one attribute if that's the build they want.
  function spendAttributePoint(attrKey) {
    if (character.pendingAttributePoints <= 0) return;
    if (!ATTRIBUTE_DEFS[attrKey]) return;
    if (character.attributes[attrKey] >= ATTRIBUTE_CAP) return;
    setCharacter((c) => ({
      ...c,
      pendingAttributePoints: c.pendingAttributePoints - 1,
      attributes: { ...c.attributes, [attrKey]: Math.min(ATTRIBUTE_CAP, c.attributes[attrKey] + 1) },
    }));
  }

  function useConsumable(itemId) {
    const idx = character.inventory.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    const item = character.inventory[idx];
    const effect = CONSUMABLE_TABLE[item.consumableKind];
    if (!effect) return;

    const maxHp = getEffectiveStats(character).maxHp;
    const scaledHeal = Math.round(effect.healAmount * RARITY_TIERS[rarityOf(item)].statMult);
    const healedAmount = Math.min(scaledHeal, maxHp - character.hp);
    const newHp = character.hp + healedAmount;
    const nextInventory = [...character.inventory];
    if (item.quantity > 1) {
      nextInventory[idx] = { ...item, quantity: item.quantity - 1 };
    } else {
      nextInventory.splice(idx, 1);
    }

    setCharacter((c) => ({ ...c, hp: newHp, inventory: nextInventory }));
    pushSystemLine(
      healedAmount > 0
        ? `+ Used ${item.name}: healed ${healedAmount} HP (${newHp}/${maxHp})`
        : `Used ${item.name}, but you were already at full health.`
    );
  }

  // ---- Shop actions. Entirely code-resolved — no AI call for a buy or sell, same as
  // equipping or using a consumable. Prices always come from ITEM_VALUE_TABLE plus the
  // merchant's fixed multipliers; nothing here is ever narrated or AI-supplied.

  function buyFromShop(key) {
    if (!shop) return;
    const npc = worldState.npcs.find((n) => n.id === shop.npcId);
    if (!npc || !npc.merchant) return;
    const stockEntry = npc.merchant.stock.find((s) => s.key === key);
    if (!stockEntry || stockEntry.remaining <= 0) return;
    const price = buyPriceFor(shop.merchantType, key, npc.trust || 0, character.attributes.cha, hasAbility(character, "silver_tongue"), hasBackgroundPriceEdge(character));
    if (character.gold < price) return;

    setCharacter((c) => ({ ...c, gold: c.gold - price }));
    const def = EQUIPMENT_TABLE[key];
    const consumable = CONSUMABLE_TABLE[key];
    addItemToInventory(displayNameForKey(key), consumable ? key : null, def ? key : null);
    setWorldState((prev) => ({
      ...prev,
      npcs: prev.npcs.map((n) =>
        n.id === shop.npcId
          ? { ...n, merchant: { ...n.merchant, stock: n.merchant.stock.map((s) => (s.key === key ? { ...s, remaining: s.remaining - 1 } : s)) } }
          : n
      ),
    }));
    pushSystemLine(`↓ Bought ${displayNameForKey(key)} for ${price}g from the ${MERCHANT_TYPES[shop.merchantType].label.toLowerCase()}`);
  }

  function sellToShop(itemId) {
    if (!shop) return;
    const npc = worldState.npcs.find((n) => n.id === shop.npcId);
    if (!npc || !npc.merchant) return;
    const idx = character.inventory.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    const item = character.inventory[idx];
    const price = sellPriceFor(shop.merchantType, item, npc.trust || 0, character.attributes.cha, hasAbility(character, "silver_tongue"), hasBackgroundPriceEdge(character));
    if (npc.merchant.gold < price) return; // merchant can't afford it right now

    const nextInventory = [...character.inventory];
    if (item.quantity > 1) {
      nextInventory[idx] = { ...item, quantity: item.quantity - 1 };
    } else {
      nextInventory.splice(idx, 1);
    }
    setCharacter((c) => ({ ...c, gold: c.gold + price, inventory: nextInventory }));
    setWorldState((prev) => ({
      ...prev,
      npcs: prev.npcs.map((n) => (n.id === shop.npcId ? { ...n, merchant: { ...n.merchant, gold: n.merchant.gold - price } } : n)),
    }));
    pushSystemLine(`↑ Sold ${item.name} for ${price}g to the ${MERCHANT_TYPES[shop.merchantType].label.toLowerCase()}`);
  }

  function closeShop() {
    setShop(null);
  }

  function processEvents(events) {
    let combatStartedThisTurn = combat;
    (events || []).forEach((event) => {
      if (event.type === "encounter" && !combatStartedThisTurn) {
        const enemyDef = ENEMY_TABLE[event.enemyType] || ENEMY_TABLE.goblin;
        setCombat({
          enemyType: event.enemyType,
          enemy: { name: enemyDef.name, hp: enemyDef.hp, maxHp: enemyDef.hp, attack: enemyDef.attack, defense: enemyDef.defense },
          secondWindUsed: false,
        });
        combatStartedThisTurn = true;
        pushSystemLine(`⚔ A ${enemyDef.name.toLowerCase()} attacks! (HP ${enemyDef.hp}, ATK ${enemyDef.attack}, DEF ${enemyDef.defense})`);
      } else if (event.type === "loot") {
        // Only recognize consumableKind/equipmentKey if they're one of the fixed,
        // code-owned entries — anything else Claude might invent is silently treated as
        // a plain flavor item with no coded effect. Rarity is rolled by code against
        // RARITY_DROP_WEIGHTS — Claude has no input into it at all now.
        const kind = CONSUMABLE_TABLE[event.consumableKind] ? event.consumableKind : null;
        const equipKey = EQUIPMENT_TABLE[event.equipmentKey] ? event.equipmentKey : null;
        const rarity = rollRarity();
        addItemToInventory(event.itemName, kind, equipKey, rarity);
        const rarityTag = rarity !== "common" ? ` (${RARITY_TIERS[rarity].label})` : "";
        pushSystemLine(`+ Looted: ${event.itemName}${rarityTag}`);
      } else if (event.type === "gold_found") {
        const amount = rollGoldForTier(event.tier);
        setCharacter((c) => ({ ...c, gold: c.gold + amount }));
        pushSystemLine(`+ ${amount} gold`);
      } else if (event.type === "gold_spent") {
        const amount = rollGoldForTier(event.tier);
        setCharacter((c) => {
          const actuallySpent = Math.min(amount, c.gold);
          if (actuallySpent < amount) {
            pushSystemLine(`- ${actuallySpent} gold for ${event.reason || "a purchase"} (had less than the ${amount} it should have cost)`);
          } else {
            pushSystemLine(`- ${amount} gold for ${event.reason || "a purchase"}`);
          }
          return { ...c, gold: c.gold - actuallySpent };
        });
      } else if (event.type === "quest_offer") {
        // Optional trust gate: if Claude ties this quest to a specific NPC's trust,
        // code enforces the threshold rather than trusting Claude's own judgment about
        // whether the relationship has earned it — a quest offered too early is simply
        // never created, no matter how the narration frames it.
        if (event.requiresNpcId) {
          const gatingNpc = worldState.npcs.find((n) => n.id === event.requiresNpcId);
          const requiredTrust = typeof event.minTrust === "number" ? event.minTrust : 0;
          const currentTrust = gatingNpc ? gatingNpc.trust || 0 : 0;
          if (!gatingNpc || currentTrust < requiredTrust) {
            pushSystemLine(
              `⚠ quest_offer "${event.title}" needs more trust with ${gatingNpc ? gatingNpc.name : event.requiresNpcId} (has ${currentTrust}, needs ${requiredTrust}) — not offered.`
            );
            return;
          }
        }
        const reward = QUEST_REWARD_TIERS[event.tier] || QUEST_REWARD_TIERS.small;
        setQuests((q) => [
          ...q,
          { title: event.title, description: event.description, status: "active", xpReward: reward.xp, goldReward: reward.gold },
        ]);
        pushSystemLine(`+ New quest: "${event.title}" (reward: ${reward.xp} XP, ${reward.gold} gold)`);
      } else if (event.type === "quest_complete") {
        setQuests((qs) => {
          const idx = qs.findIndex((q) => q.title === event.title && q.status === "active");
          if (idx === -1) {
            pushSystemLine(`⚠ quest_complete referenced "${event.title}" but no matching active quest was found — skipped.`);
            return qs;
          }
          const quest = qs[idx];
          setCharacter((c) => {
            const withGold = { ...c, gold: c.gold + quest.goldReward };
            const withXp = addXp(withGold, quest.xpReward);
            if (withXp.levelUps.length) pushSystemLine(`★ Level up! Now level ${withXp.level}. Choose your growth below.`);
            return withXp;
          });
          pushSystemLine(`✓ Quest complete: "${quest.title}" (+${quest.xpReward} XP, +${quest.goldReward} gold)`);
          const next = [...qs];
          next[idx] = { ...quest, status: "complete" };
          return next;
        });
      } else if (event.type === "npc_relationship") {
        const deltas = NPC_INTERACTION_TABLE[event.interaction];
        if (!deltas) return; // unrecognized label — skip rather than guess at numbers
        let logLine = null;
        setWorldState((prev) => {
          const idx = prev.npcs.findIndex((n) => n.id === event.id);
          if (idx === -1) {
            logLine = `⚠ npc_relationship referenced id "${event.id}" which doesn't exist — skipped.`;
            return prev;
          }
          const npc = prev.npcs[idx];
          const updatedNpc = { ...npc };
          const changeParts = [];
          Object.entries(deltas).forEach(([counter, delta]) => {
            const oldVal = npc[counter] || 0;
            updatedNpc[counter] = clamp(oldVal + delta, -10, 10);
            changeParts.push(`${counter} ${delta >= 0 ? "+" : ""}${delta}`);
          });
          logLine = `~ ${npc.name}: ${changeParts.join(", ")} (${event.interaction})`;
          const nextNpcs = [...prev.npcs];
          nextNpcs[idx] = updatedNpc;
          return { ...prev, npcs: nextNpcs };
        });
        if (logLine) pushSystemLine(logLine);
      } else if (event.type === "shop_open") {
        const merchantDef = MERCHANT_TYPES[event.merchantType];
        if (!merchantDef) {
          pushSystemLine(`⚠ shop_open referenced unknown merchantType "${event.merchantType}" — skipped.`);
          return;
        }
        const shopNpcRecord = worldState.npcs.find((n) => n.id === event.id);
        if (!shopNpcRecord) {
          pushSystemLine(`⚠ shop_open referenced npc id "${event.id}" which doesn't exist yet — skipped.`);
          return;
        }
        if (isHostile(shopNpcRecord)) {
          pushSystemLine(`⚠ ${shopNpcRecord.name} is too hostile toward you to trade — shop refused.`);
          return;
        }
        // First time this NPC has opened shop, give them a persistent merchant record
        // (their own gold budget and stock) that lives on the world-state NPC object, so
        // it saves/loads and survives between visits exactly like trust/respect/fear do.
        // A returning merchant keeps whatever gold and stock they had left last time,
        // plus a small regen — they don't magically refill on every visit.
        setWorldState((prev) => ({
          ...prev,
          npcs: prev.npcs.map((n) => {
            if (n.id !== event.id) return n;
            if (n.merchant) {
              return {
                ...n,
                merchant: { ...n.merchant, gold: Math.min(n.merchant.gold + merchantDef.goldRegenPerVisit, merchantDef.startingGold * 2) },
              };
            }
            return {
              ...n,
              merchant: {
                merchantType: event.merchantType,
                gold: merchantDef.startingGold,
                stock: merchantDef.stock.map((s) => ({ ...s, remaining: s.quantity })),
              },
            };
          }),
        }));
        setShop({ npcId: event.id, merchantType: event.merchantType });
      }
    });
  }

  async function submitAction(action) {
    if (!action.trim() || loading || combat || shop || character.pendingAttributePoints > 0) return;
    setLoading(true);
    setError(null);
    setLog((l) => [...l, { role: "player", text: action }]);
    setInput("");

    const userMessage = `WORLD STATE:\n${JSON.stringify(worldState, null, 2)}\n\nCHARACTER SUMMARY (for narrative color only — do not cite numbers):\n${JSON.stringify(
      characterSummaryForPrompt(character, quests),
      null,
      2
    )}\n\nPLAYER ACTION: ${action}`;

    try {
      const result = await callModel(EXPLORATION_SYSTEM_PROMPT, userMessage, 1200, 1, null, (info) => pushDebugEntry(action, info));
      // Defensive defaults: Claude's JSON can be syntactically valid but structurally
      // incomplete (e.g. missing stateUpdates entirely). Falling back to safe empty
      // values here means a partially-shaped response degrades gracefully — the turn
      // still narrates, it just doesn't update anything it didn't mention — instead of
      // throwing on the next line down (e.g. stateUpdates.reputationDelta of undefined).
      const narration = typeof result.narration === "string" ? result.narration : "(the DM's response was missing narration text)";
      const stateUpdates = result.stateUpdates && typeof result.stateUpdates === "object" ? result.stateUpdates : {};
      const events = Array.isArray(result.events) ? result.events : [];
      const suggestedActions = Array.isArray(result.suggestedActions) ? result.suggestedActions : [];

      setWorldState((prev) => {
        const next = {
          locationId: prev.locationId,
          locations: { ...prev.locations },
          npcs: [...prev.npcs],
          reputation: stateUpdates.reputationDelta ? `${prev.reputation} → ${stateUpdates.reputationDelta}` : prev.reputation,
          worldFacts: [...prev.worldFacts, ...(stateUpdates.worldFacts || [])],
        };

        // Location: Claude references an existing id or supplies a display name for a
        // brand-new place — it never invents or reuses an id itself.
        const prevLocationId = prev.locationId;
        const locUpdate = stateUpdates.location;
        if (locUpdate && locUpdate.existingId) {
          if (next.locations[locUpdate.existingId]) {
            next.locationId = locUpdate.existingId;
          } else {
            pushSystemLine(`⚠ location referenced existingId "${locUpdate.existingId}" which isn't registered — ignored, location unchanged.`);
          }
        } else if (locUpdate && locUpdate.newDisplayName) {
          const newId = `loc_${nextLocationIdRef.current++}`;
          next.locations[newId] = { name: locUpdate.newDisplayName, connections: [] };
          next.locationId = newId;
        }
        // Whenever the location actually changed this turn, the old and new place are
        // now a known route between each other — link them regardless of whether this
        // was a brand-new discovery or a return to somewhere already known. This is how
        // the map graph builds itself purely from what actually happened in play.
        if (next.locationId !== prevLocationId) {
          linkLocations(next.locations, prevLocationId, next.locationId);
        }

        (stateUpdates.newNPCs || []).forEach((npc) => {
          // Defense in depth: if Claude re-introduces an existing name via newNPCs instead
          // of npcUpdates, merge rather than duplicate. The real fix is the id-based path
          // below, used by every future turn once this NPC has an id.
          const existingByName = next.npcs.findIndex((n) => n.name === npc.name);
          if (existingByName >= 0) {
            next.npcs[existingByName] = { ...next.npcs[existingByName], memory: npc.memory };
          } else {
            const newId = `npc_${nextNpcIdRef.current++}`;
            next.npcs.push({ id: newId, name: npc.name, memory: npc.memory, trust: 0, respect: 0, fear: 0 });
          }
        });

        (stateUpdates.npcUpdates || []).forEach((update) => {
          const idx = next.npcs.findIndex((n) => n.id === update.id);
          if (idx === -1) {
            pushSystemLine(`⚠ npcUpdates referenced id "${update.id}" which doesn't exist — skipped.`);
            return;
          }
          next.npcs[idx] = { ...next.npcs[idx], memory: update.memory };
        });

        return next;
      });

      setLog((l) => [...l, { role: "dm", narration, suggestedActions }]);
      processEvents(events);
      setLastFailedAction(null);
    } catch (e) {
      setError(`The DM lost the thread: ${e.message}`);
      setLastFailedAction(action);
      setLog((l) => l.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  async function handleCombatAction(actionType) {
    if (loading || !combat) return;
    setLoading(true);
    setError(null);

    let enemy = { ...combat.enemy };
    let nextCharacter = { ...character };
    const facts = { action: actionType };
    // Always fight with gear-adjusted stats, never the raw base numbers — this is the
    // only place attack/defense bonuses from equipped items take effect.
    const effStats = getEffectiveStats(nextCharacter);

    if (actionType === "flee") {
      const escaped = Math.random() < effStats.fleeChance;
      facts.fled = escaped;
      if (!escaped) {
        const { dmg, dodged } = rollIncomingHit(enemy.attack, effStats.def, effStats.dodgeChance);
        nextCharacter.hp = Math.max(0, nextCharacter.hp - dmg);
        facts.enemyDamageDealt = dmg;
        facts.playerDodged = dodged;
        facts.playerHpRemaining = nextCharacter.hp;
      }
    } else if (actionType === "second_wind") {
      // Code-resolved, once per battle — the button itself is only ever shown while
      // combat.secondWindUsed is still false, but guard here too in case of a stale click.
      if (effStats.hasSecondWind && !combat.secondWindUsed) {
        const healAmt = Math.min(Math.round(effStats.maxHp * 0.25), effStats.maxHp - nextCharacter.hp);
        nextCharacter.hp += healAmt;
        facts.secondWindHeal = healAmt;
      }
      const { dmg, dodged } = rollIncomingHit(enemy.attack, effStats.def, effStats.dodgeChance);
      nextCharacter.hp = Math.max(0, nextCharacter.hp - dmg);
      facts.enemyDamageDealt = dmg;
      facts.playerDodged = dodged;
      facts.playerHpRemaining = nextCharacter.hp;
    } else {
      const incomingDefenseBonus = actionType === "defend" ? Math.floor(effStats.def / 2) + 3 : 0;
      // Power Strike trades defense for damage: a bigger hit now, but a weaker guard on
      // the counter that follows if the enemy is still standing.
      const isPowerStrike = actionType === "power_strike" && effStats.hasPowerStrike;
      if (actionType === "attack" || isPowerStrike) {
        const atk = isPowerStrike ? Math.round(effStats.atk * 1.6) : effStats.atk;
        const { dmg, crit } = rollOutgoingHit(atk, enemy.defense, effStats.critChance, effStats.critMultiplier);
        enemy.hp = Math.max(0, enemy.hp - dmg);
        facts.playerDamageDealt = dmg;
        facts.playerCrit = crit;
        facts.powerStrike = isPowerStrike;
        facts.enemyHpRemaining = enemy.hp;
      }
      facts.enemyDefeated = enemy.hp <= 0;
      // Intimidating Presence: only ever checked after the player's own attack actually
      // lands and doesn't finish the enemy off — a weaker foe may just break and run.
      if (!facts.enemyDefeated && (actionType === "attack" || isPowerStrike) && effStats.hasIntimidatingPresence) {
        facts.enemyFled = Math.random() < 0.2;
      }
      if (!facts.enemyDefeated && !facts.enemyFled) {
        const openDefense = isPowerStrike ? Math.floor(effStats.def / 2) : effStats.def + incomingDefenseBonus;
        const { dmg, dodged } = rollIncomingHit(enemy.attack, openDefense, effStats.dodgeChance);
        nextCharacter.hp = Math.max(0, nextCharacter.hp - dmg);
        facts.enemyDamageDealt = dmg;
        facts.playerDodged = dodged;
        facts.playerHpRemaining = nextCharacter.hp;
      }
    }
    facts.playerDefeated = nextCharacter.hp <= 0;

    // Resolve rewards / end-of-combat state changes deterministically before narrating.
    // An enemy that fled from Intimidating Presence gets away clean — no XP or gold,
    // same as a player fleeing successfully; the reward is ending the fight safely, not
    // loot.
    if (facts.enemyDefeated) {
      const enemyDef = ENEMY_TABLE[combat.enemyType] || ENEMY_TABLE.goblin;
      nextCharacter.gold += enemyDef.goldReward;
      nextCharacter = addXp(nextCharacter, enemyDef.xpReward);
      facts.xpGained = enemyDef.xpReward;
      facts.goldGained = enemyDef.goldReward;
    }
    if (facts.playerDefeated) {
      nextCharacter.hp = 1; // soft-fail rather than permadeath, for prototype purposes
    }

    setCharacter(nextCharacter);

    const combatEnded = facts.enemyDefeated || facts.playerDefeated || facts.fled === true || facts.enemyFled === true;
    setCombat(combatEnded ? null : { ...combat, enemy, secondWindUsed: combat.secondWindUsed || actionType === "second_wind" });

    try {
      const result = await callModel(COMBAT_NARRATION_SYSTEM_PROMPT, JSON.stringify(facts, null, 2), 400, 1, null, (info) => pushDebugEntry(`combat:${actionType}`, info));
      setLog((l) => [...l, { role: "dm", narration: result.narration, suggestedActions: combatEnded ? ["Look around", "Check inventory", "Continue on"] : null }]);
      if (facts.enemyDefeated) pushSystemLine(`✓ Enemy defeated (+${facts.xpGained} XP, +${facts.goldGained} gold)${nextCharacter.levelUps?.length ? ` — Level up! Now level ${nextCharacter.level}. Choose your growth below.` : ""}`);
      if (facts.playerDefeated) pushSystemLine(`✝ You were defeated and wake later, battered, at 1 HP.`);
      if (facts.fled) pushSystemLine(`→ You escaped the fight.`);
      if (facts.enemyFled) pushSystemLine(`→ ${combat.enemy.name} breaks and flees — no reward, but the fight's over.`);
      if (typeof facts.secondWindHeal === "number") pushSystemLine(`♥ Second Wind: recovered ${facts.secondWindHeal} HP.`);
    } catch (e) {
      setError(`Combat narration failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!saveChecked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", width: "100%", background: "#1C1917", color: SLATE, fontFamily: "ui-monospace, monospace", fontSize: "13px" }}>
        Checking for a saved game...
      </div>
    );
  }

  if (needsIdentity) {
    return (
      <>
        {FONT_IMPORTS}
        <CharacterCreationScreen mode={identityMode} onSubmit={submitIdentity} />
      </>
    );
  }

  const characterEffStats = getEffectiveStats(character);
  const shopNpc = shop ? worldState.npcs.find((n) => n.id === shop.npcId) : null;

  return (
    <>
      {FONT_IMPORTS}
      {tutorialOpen && (
        <TutorialPanel
          step={tutorialStep}
          onNext={() => setTutorialStep((s) => Math.min(s + 1, TUTORIAL_STEPS.length - 1))}
          onBack={() => setTutorialStep((s) => Math.max(s - 1, 0))}
          onClose={closeTutorial}
        />
      )}
      {journalOpen && (
        <JournalPanel character={character} worldState={worldState} quests={quests} onClose={() => setJournalOpen(false)} />
      )}
      {mapOpen && (
        <MapPanel
          worldState={worldState}
          onClose={() => setMapOpen(false)}
          onTravel={(name) => { setMapOpen(false); submitAction(`Travel to ${name}`); }}
          canTravel={!loading && !combat && !shop && character.pendingAttributePoints === 0}
        />
      )}
      {pauseOpen && (
        <PausePanel
          onResume={() => setPauseOpen(false)}
          onOpenTutorial={() => { setPauseOpen(false); setTutorialStep(0); setTutorialOpen(true); }}
          confirmingNewGame={confirmingNewGame}
          onRequestNewGame={() => setConfirmingNewGame(true)}
          onConfirmNewGame={startNewGame}
          onCancelNewGame={() => setConfirmingNewGame(false)}
          onManualSave={manualSave}
          onManualLoad={manualLoad}
          manualSaveExists={manualSaveExists}
          manualSaveAt={manualSaveAt}
          manualSaveStatus={manualSaveStatus}
        />
      )}
      <div style={{ display: "flex", height: "100vh", width: "100%", background: "radial-gradient(ellipse at 30% 0%, #211B15 0%, #14110D 65%)", color: INK, fontFamily: BODY_FONT }}>
      <div style={{ flex: "1 1 60%", display: "flex", flexDirection: "column", borderRight: `1px solid #33291D`, minWidth: 0 }}>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid #33291D`, background: "linear-gradient(180deg, #221C15 0%, #1A150F 100%)", fontFamily: DISPLAY_FONT, fontSize: "11px", letterSpacing: "0.16em", textTransform: "uppercase", color: AMBER, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
          <span style={{ flexShrink: 1, minWidth: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <RavenGlyph size={13} /> The Maester's Chronicle <span style={{ color: SLATE, fontFamily: "ui-monospace, monospace", textTransform: "none", letterSpacing: 0, fontSize: "10px" }}>— Claude narrates, code keeps the ledger</span>
          </span>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
            {lastSavedAt && <span style={{ color: DIM, fontSize: "10px", textTransform: "none", fontFamily: "ui-monospace, monospace" }}>saved {lastSavedAt}</span>}
            <button onClick={() => setPauseOpen(true)} style={{ background: "transparent", border: `1px solid ${AMBER}`, color: AMBER, padding: "4px 10px", fontFamily: "ui-monospace, monospace", fontSize: "10px", cursor: "pointer", textTransform: "none" }}>
              ❚❚ Pause
            </button>
            <button onClick={() => setJournalOpen(true)} style={{ background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "4px 10px", fontFamily: "ui-monospace, monospace", fontSize: "10px", cursor: "pointer", textTransform: "none" }}>
              Journal
            </button>
            <button onClick={() => setMapOpen(true)} style={{ background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "4px 10px", fontFamily: "ui-monospace, monospace", fontSize: "10px", cursor: "pointer", textTransform: "none" }}>
              Map
            </button>
            <button
              onClick={() => setDebugOpen((o) => !o)}
              style={{ background: debugOpen ? CODE_VOICE : "transparent", border: `1px solid ${CODE_VOICE}`, color: debugOpen ? "#1C1917" : CODE_VOICE, padding: "4px 10px", fontFamily: "ui-monospace, monospace", fontSize: "10px", letterSpacing: "0.05em", cursor: "pointer", textTransform: "none" }}
            >
              {debugOpen ? "Close Console" : `Debug Console (${debugLog.length})`}
            </button>
          </div>
        </div>

        <div style={{ padding: "8px 20px", borderBottom: "1px solid #33291D", background: "#181410", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: DISPLAY_FONT, fontSize: "10.5px", letterSpacing: "0.08em", color: SLATE, whiteSpace: "nowrap" }}>
            LV {character.level}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <StatBar value={character.xp} max={xpToNextLevel(character.level)} color={AMBER} height={7} />
          </div>
          <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "10.5px", color: SLATE, whiteSpace: "nowrap" }}>
            {character.xp} / {xpToNextLevel(character.level)} XP
          </span>
        </div>

        {debugOpen && (
          <div style={{ maxHeight: "40vh", overflowY: "auto", borderBottom: `1px solid ${CODE_VOICE}`, background: "#12100D", padding: "14px 20px", fontFamily: "ui-monospace, monospace", fontSize: "11.5px" }}>
            {debugLog.length === 0 ? (
              <div style={{ color: DIM }}>No turns logged yet — take an action to populate this.</div>
            ) : (
              [...debugLog].reverse().map((entry, i) => (
                <div key={i} style={{ marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid #2A2620" }}>
                  <div style={{ color: AMBER }}>
                    [{entry.time}] action: "{entry.action}" · stage: {entry.stage} · correction used: {String(entry.correctionUsed)}
                  </div>
                  {entry.error && <div style={{ color: WOUND, marginTop: "4px" }}>error: {entry.error}</div>}
                  <details style={{ marginTop: "6px" }}>
                    <summary style={{ color: SLATE, cursor: "pointer" }}>raw response text</summary>
                    <div style={{ color: SLATE, whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: "4px", paddingLeft: "8px" }}>
                      {entry.rawText ? entry.rawText.slice(0, 1000) : "(none captured)"}
                    </div>
                  </details>
                  {entry.parsed && (
                    <details style={{ marginTop: "6px" }}>
                      <summary style={{ color: SLATE, cursor: "pointer" }}>parsed events</summary>
                      <div style={{ color: CODE_VOICE, whiteSpace: "pre-wrap", wordBreak: "break-word", marginTop: "4px", paddingLeft: "8px" }}>
                        {JSON.stringify(entry.parsed.events || entry.parsed, null, 2).slice(0, 800)}
                      </div>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {log.map((entry, i) => {
            if (entry.role === "player") {
              return (
                <div key={i} style={{ margin: "20px 0", paddingLeft: "16px", borderLeft: `3px solid ${AMBER}`, color: AMBER, fontFamily: DISPLAY_FONT, fontSize: "13.5px", letterSpacing: "0.03em" }}>
                  {entry.text}
                </div>
              );
            }
            if (entry.role === "system") {
              return (
                <div key={i} style={{ margin: "6px 0", color: CODE_VOICE, fontFamily: "ui-monospace, monospace", fontSize: "13px" }}>
                  {entry.text}
                </div>
              );
            }
            const trimmed = (entry.narration || "").trim();
            const dropCap = trimmed.charAt(0);
            const rest = trimmed.slice(1);
            return (
              <div key={i} style={{ margin: "22px 0", paddingLeft: "16px", borderLeft: "1px solid #2E2820" }}>
                <p style={{ lineHeight: 1.75, fontSize: "17px", margin: 0, whiteSpace: "pre-wrap" }}>
                  {dropCap && (
                    <span style={{ fontFamily: DISPLAY_FONT, fontSize: "32px", fontWeight: 700, color: AMBER, marginRight: "2px", lineHeight: 0 }}>
                      {dropCap}
                    </span>
                  )}
                  {rest}
                </p>
                {entry.suggestedActions && (
                  <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {entry.suggestedActions.map((a, j) => (
                      <button key={j} onClick={() => submitAction(a)} disabled={loading} style={{ background: "linear-gradient(180deg, #241D15 0%, #1A150F 100%)", border: "1px solid #4A3F2C", color: INK, padding: "7px 14px", fontFamily: DISPLAY_FONT, fontSize: "11.5px", letterSpacing: "0.03em", cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1, borderRadius: "2px" }}>
                        {a}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {combat && (
            <div style={{ margin: "20px 0", padding: "16px", border: `2px solid ${BLOOD}`, background: "linear-gradient(180deg, #2A1A1A 0%, #1C1210 100%)", boxShadow: "inset 0 0 24px rgba(0,0,0,0.5)", borderRadius: "3px" }}>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: "13px", letterSpacing: "0.05em", color: AMBER, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <RavenGlyph size={12} color={BLOOD} /> {combat.enemy.name} — {combat.enemy.hp}/{combat.enemy.maxHp} HP
              </div>
              <div style={{ marginBottom: "12px" }}>
                <StatBar value={combat.enemy.hp} max={combat.enemy.maxHp} color={BLOOD} height={7} />
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["attack", "defend", "flee"].map((a) => (
                  <button key={a} onClick={() => handleCombatAction(a)} disabled={loading} style={{ background: a === "attack" ? `linear-gradient(180deg, ${BLOOD} 0%, #4A1620 100%)` : "linear-gradient(180deg, #241D15 0%, #1A150F 100%)", border: `1px solid ${a === "attack" ? BLOOD : "#4A3F2C"}`, color: INK, padding: "9px 18px", fontFamily: DISPLAY_FONT, fontSize: "12.5px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1, borderRadius: "2px" }}>
                    {a}
                  </button>
                ))}
                {characterEffStats.hasPowerStrike && (
                  <button onClick={() => handleCombatAction("power_strike")} disabled={loading} title="More damage, but a weaker guard on the counter" style={{ background: "linear-gradient(180deg, #5A2A12 0%, #2E1608 100%)", border: `1px solid ${AMBER}`, color: INK, padding: "9px 18px", fontFamily: DISPLAY_FONT, fontSize: "12.5px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1, borderRadius: "2px" }}>
                    Power Strike
                  </button>
                )}
                {characterEffStats.hasSecondWind && !combat.secondWindUsed && (
                  <button onClick={() => handleCombatAction("second_wind")} disabled={loading} title="Once per fight: recover some health" style={{ background: "linear-gradient(180deg, #123A2E 0%, #081F18 100%)", border: `1px solid ${CODE_VOICE}`, color: INK, padding: "9px 18px", fontFamily: DISPLAY_FONT, fontSize: "12.5px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1, borderRadius: "2px" }}>
                    Second Wind
                  </button>
                )}
              </div>
            </div>
          )}

          {shop && shopNpc && (
            <ShopPanel
              shopNpc={shopNpc}
              merchantType={shop.merchantType}
              character={character}
              onBuy={buyFromShop}
              onSell={sellToShop}
              onClose={closeShop}
              loading={loading}
            />
          )}

          {character.pendingAttributePoints > 0 && (
            <AttributePanel character={character} onSpend={spendAttributePoint} loading={loading} />
          )}

          {loading && <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "13px", color: SLATE, fontStyle: "italic" }}>the DM considers...</div>}

          {error && (
            <div style={{ color: WOUND, fontFamily: "ui-monospace, monospace", fontSize: "13px" }}>
              <div>{error}</div>
              <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {lastFailedAction && (
                  <button onClick={() => submitAction(lastFailedAction)} style={{ background: "transparent", border: `1px solid ${BLOOD}`, color: WOUND, padding: "5px 10px", fontFamily: "ui-monospace, monospace", fontSize: "12px", cursor: "pointer" }}>
                    Retry: "{lastFailedAction}"
                  </button>
                )}
                <button onClick={runDiagnostic} disabled={diagnosing} style={{ background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "5px 10px", fontFamily: "ui-monospace, monospace", fontSize: "12px", cursor: diagnosing ? "default" : "pointer" }}>
                  {diagnosing ? "Pinging API..." : "Run diagnostic ping (bare)"}
                </button>
                <button onClick={runDiagnostic2} disabled={diagnosing2} style={{ background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "5px 10px", fontFamily: "ui-monospace, monospace", fontSize: "12px", cursor: diagnosing2 ? "default" : "pointer" }}>
                  {diagnosing2 ? "Pinging API..." : "Run diagnostic ping (with system prompt)"}
                </button>
                <button onClick={runDiagnostic3} disabled={diagnosing3} style={{ background: "transparent", border: `1px solid ${AMBER}`, color: AMBER, padding: "5px 10px", fontFamily: "ui-monospace, monospace", fontSize: "12px", cursor: diagnosing3 ? "default" : "pointer" }}>
                  {diagnosing3 ? "Running..." : "Re-run the exact failed call (live state)"}
                </button>
                <button onClick={runDiagnostic4} disabled={diagnosing4} style={{ background: "transparent", border: `1px solid ${CODE_VOICE}`, color: CODE_VOICE, padding: "5px 10px", fontFamily: "ui-monospace, monospace", fontSize: "12px", cursor: diagnosing4 ? "default" : "pointer" }}>
                  {diagnosing4 ? "Running..." : "Run callModel() with a tiny message"}
                </button>
              </div>
              {diagnostic && (
                <div style={{ marginTop: "10px", padding: "10px", border: "1px solid #33291D", color: SLATE, fontSize: "11.5px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  bare ping — status: {String(diagnostic.status)} | ok: {String(diagnostic.ok)}
                  {"\n"}body: {diagnostic.body}
                </div>
              )}
              {diagnostic2 && (
                <div style={{ marginTop: "10px", padding: "10px", border: `1px solid ${BLOOD}`, color: SLATE, fontSize: "11.5px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  with-system-prompt ping — status: {String(diagnostic2.status)} | ok: {String(diagnostic2.ok)}
                  {"\n"}body: {diagnostic2.body}
                </div>
              )}
              {diagnostic3 && (
                <div style={{ marginTop: "10px", padding: "10px", border: `1px solid ${AMBER}`, color: SLATE, fontSize: "11.5px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  real code path — status: {String(diagnostic3.status)} | ok: {String(diagnostic3.ok)}
                  {"\n"}body: {diagnostic3.body}
                </div>
              )}
              {diagnostic4 && (
                <div style={{ marginTop: "10px", padding: "10px", border: `1px solid ${CODE_VOICE}`, color: SLATE, fontSize: "11.5px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  callModel() minimal — status: {String(diagnostic4.status)} | ok: {String(diagnostic4.ok)}
                  {"\n"}body: {diagnostic4.body}
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); submitAction(input); }} style={{ display: "flex", borderTop: "1px solid #33291D", padding: "12px 16px", gap: "10px" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={combat ? "Resolve combat above first..." : shop ? "Finish trading above first..." : character.pendingAttributePoints > 0 ? "Spend your attribute points above first..." : "What do you do?"} disabled={loading || !!combat || !!shop || character.pendingAttributePoints > 0} style={{ flex: 1, background: "#1A1611", border: "1px solid #33291D", color: INK, padding: "10px 12px", fontFamily: BODY_FONT, fontSize: "15px", outline: "none", opacity: combat || shop || character.pendingAttributePoints > 0 ? 0.4 : 1, borderRadius: "2px" }} />
          <button type="submit" disabled={loading || !!combat || !!shop || character.pendingAttributePoints > 0} style={{ background: `linear-gradient(180deg, ${BLOOD} 0%, #4A1620 100%)`, border: `1px solid ${BLOOD}`, color: INK, padding: "10px 20px", fontFamily: DISPLAY_FONT, fontSize: "12.5px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: loading || combat || shop || character.pendingAttributePoints > 0 ? "default" : "pointer", opacity: loading || combat || shop || character.pendingAttributePoints > 0 ? 0.5 : 1, borderRadius: "2px" }}>
            Act
          </button>
        </form>
      </div>

      <div style={{ flex: "1 1 40%", overflowY: "auto", padding: "20px 22px", fontFamily: "ui-monospace, monospace", fontSize: "12.5px", background: "linear-gradient(180deg, #17130F 0%, #120F0B 100%)" }}>
        <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: AMBER, marginBottom: "18px", paddingBottom: "12px", borderBottom: `2px solid #33291D`, boxShadow: `0 1px 0 rgba(200,155,74,0.25)`, fontFamily: DISPLAY_FONT, display: "flex", alignItems: "center", gap: "8px" }}>
          <RavenGlyph size={14} /> Character Ledger <span style={{ color: DIM, textTransform: "none", letterSpacing: 0, fontFamily: "ui-monospace, monospace", fontSize: "10px" }}>(code-owned)</span>
        </div>

        {character.identity && (
          <LedgerSection title="Identity">
            <div style={{ color: AMBER, fontFamily: DISPLAY_FONT, fontSize: "13px" }}>{character.identity.name}</div>
            <div style={{ color: SLATE, fontSize: "11px", marginTop: "2px" }}>
              {RACE_OPTIONS.find((r) => r.key === character.identity.race)?.label || character.identity.race} · {BACKGROUND_OPTIONS[character.identity.background]?.label || character.identity.background}
              {character.identity.gender ? ` · ${character.identity.gender}` : ""}
              {character.identity.age ? ` · Age ${character.identity.age}` : ""}
            </div>
            {character.identity.voice && <div style={{ color: SLATE, fontSize: "11px", marginTop: "2px" }}>Voice: {character.identity.voice}</div>}
            {character.identity.appearance && (
              <div style={{ color: SLATE, fontSize: "11px", marginTop: "6px", lineHeight: 1.5 }}>{character.identity.appearance}</div>
            )}
            {character.identity.backstory && (
              <div style={{ color: SLATE, fontSize: "11px", marginTop: "6px", fontStyle: "italic", lineHeight: 1.5 }}>{character.identity.backstory}</div>
            )}
          </LedgerSection>
        )}

        <LedgerSection title="Level & HP">
          <div style={{ color: INK }}>
            Level {character.level}
            {character.pendingAttributePoints > 0 && (
              <span style={{ color: CODE_VOICE, fontSize: "10.5px", marginLeft: "8px" }}>
                ★ {character.pendingAttributePoints} attribute point{character.pendingAttributePoints > 1 ? "s" : ""} pending
              </span>
            )}
          </div>
          <div style={{ marginTop: "4px", color: character.hp <= characterEffStats.maxHp * 0.3 ? WOUND : INK }}>
            HP {character.hp} / {characterEffStats.maxHp}
          </div>
          <div style={{ marginTop: "4px" }}>
            <StatBar value={character.hp} max={characterEffStats.maxHp} color={character.hp <= characterEffStats.maxHp * 0.3 ? WOUND : BLOOD} />
          </div>
          <div style={{ marginTop: "8px", color: SLATE, fontSize: "11px" }}>
            XP {character.xp} / {xpToNextLevel(character.level)} · ATK {characterEffStats.atk} · DEF {characterEffStats.def}
          </div>
          <div style={{ marginTop: "2px", color: SLATE, fontSize: "11px" }}>
            Crit {characterEffStats.critChance.toFixed(0)}% · Dodge {characterEffStats.dodgeChance.toFixed(0)}%
          </div>
          <div style={{ marginTop: "4px" }}>
            <StatBar value={character.xp} max={xpToNextLevel(character.level)} color={AMBER} height={5} />
          </div>
        </LedgerSection>

        <LedgerSection title="Attributes">
          {Object.entries(ATTRIBUTE_DEFS).map(([key, def]) => {
            const value = character.attributes[key];
            const milestone = milestoneFor(value);
            const canSpend = character.pendingAttributePoints > 0 && value < ATTRIBUTE_CAP;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                <div style={{ color: INK, minWidth: 0 }}>
                  {def.short} <span style={{ color: AMBER }}>{value}</span>
                  {milestone && <span style={{ color: SLATE, fontSize: "10.5px", marginLeft: "6px" }}>{milestone.label}</span>}
                </div>
                {character.pendingAttributePoints > 0 && (
                  <button
                    onClick={() => spendAttributePoint(key)}
                    disabled={loading || !canSpend}
                    style={{ flexShrink: 0, background: "transparent", border: `1px solid ${canSpend ? CODE_VOICE : "#4A3F2C"}`, color: canSpend ? CODE_VOICE : DIM, padding: "2px 9px", fontFamily: "ui-monospace, monospace", fontSize: "11px", cursor: loading || !canSpend ? "default" : "pointer" }}
                  >
                    +1
                  </button>
                )}
              </div>
            );
          })}
        </LedgerSection>

        <LedgerSection title={`Abilities (${characterEffStats.abilities.length}/${Object.values(ABILITY_TABLE).flat().length})`}>
          {Object.entries(ABILITY_TABLE).map(([attrKey, abilities]) =>
            abilities.map((a) => {
              const unlocked = character.attributes[attrKey] >= a.min;
              return (
                <div key={a.key} style={{ marginBottom: "8px", opacity: unlocked ? 1 : 0.5 }}>
                  <div style={{ color: unlocked ? (a.mechanical ? CODE_VOICE : AMBER) : DIM, fontSize: "12px" }}>
                    {unlocked ? "●" : "○"} {a.label} <span style={{ color: SLATE, fontSize: "10px" }}>({ATTRIBUTE_DEFS[attrKey].short} {a.min})</span>
                  </div>
                  <div style={{ color: SLATE, fontSize: "10.5px", paddingLeft: "14px" }}>{a.description}</div>
                </div>
              );
            })
          )}
        </LedgerSection>

        <LedgerSection title="Gold">
          <div style={{ color: AMBER }}>{character.gold}g</div>
        </LedgerSection>

        <LedgerSection title="Equipped">
          {["weapon", "armor"].map((slot) => {
            const equippedItem = character.equipped?.[slot];
            const def = equippedItem ? EQUIPMENT_TABLE[equippedItem.equipmentKey] : null;
            const rarity = equippedItem ? RARITY_TIERS[rarityOf(equippedItem)] : null;
            return (
              <div key={slot} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                <div style={{ minWidth: 0, textTransform: "capitalize" }}>
                  <span style={{ color: equippedItem ? SLATE : DIM }}>{slot}: </span>
                  <span style={{ color: equippedItem ? rarity.color : DIM }}>{equippedItem ? equippedItem.name : "none"}</span>
                  {equippedItem && rarity.label !== "Common" && <span style={{ color: rarity.color, fontSize: "10px", marginLeft: "5px" }}>({rarity.label})</span>}
                  {def && (
                    <span style={{ color: CODE_VOICE, fontSize: "10.5px", marginLeft: "6px" }}>
                      (+{Math.round((slot === "weapon" ? def.atkBonus : def.defBonus) * rarity.statMult)} {slot === "weapon" ? "ATK" : "DEF"})
                    </span>
                  )}
                </div>
                {equippedItem && (
                  <button
                    onClick={() => unequipItem(slot)}
                    disabled={loading}
                    style={{ flexShrink: 0, background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "2px 8px", fontFamily: "ui-monospace, monospace", fontSize: "10.5px", cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1 }}
                  >
                    Unequip
                  </button>
                )}
              </div>
            );
          })}
        </LedgerSection>

        <LedgerSection title={`Inventory (${character.inventory.length})`}>
          <div style={{ marginBottom: "10px", fontSize: "10px", color: DIM, lineHeight: 1.6 }}>
            Drop odds:{" "}
            {Object.entries(RARITY_DROP_WEIGHTS).map(([tier, pct], i) => (
              <span key={tier}>
                {i > 0 && " · "}
                <span style={{ color: RARITY_TIERS[tier].color }}>{RARITY_TIERS[tier].label} {pct}%</span>
              </span>
            ))}
          </div>
          {character.inventory.length === 0 ? (
            <div style={{ color: DIM }}>empty</div>
          ) : (
            character.inventory.map((item) => {
              const isConsumable = !!CONSUMABLE_TABLE[item.consumableKind];
              const equipDef = EQUIPMENT_TABLE[item.equipmentKey];
              const rarity = RARITY_TIERS[rarityOf(item)];
              const nameColor = rarity.color;
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ color: nameColor }}>• {item.name}</span>
                    {rarity.label !== "Common" && <span style={{ color: nameColor, fontSize: "10px", marginLeft: "5px" }}>({rarity.label})</span>}
                    {item.quantity > 1 && <span style={{ color: SLATE }}> ×{item.quantity}</span>}
                    {isConsumable && (
                      <span style={{ color: CODE_VOICE, fontSize: "10.5px", marginLeft: "6px" }}>
                        (+{Math.round(CONSUMABLE_TABLE[item.consumableKind].healAmount * rarity.statMult)} HP)
                      </span>
                    )}
                    {equipDef && (
                      <span style={{ color: CODE_VOICE, fontSize: "10.5px", marginLeft: "6px" }}>
                        (+{Math.round((equipDef.slot === "weapon" ? equipDef.atkBonus : equipDef.defBonus) * rarity.statMult)} {equipDef.slot === "weapon" ? "ATK" : "DEF"})
                      </span>
                    )}
                  </div>
                  {isConsumable && (
                    <button
                      onClick={() => useConsumable(item.id)}
                      disabled={loading}
                      style={{ flexShrink: 0, background: "transparent", border: `1px solid ${CODE_VOICE}`, color: CODE_VOICE, padding: "2px 8px", fontFamily: "ui-monospace, monospace", fontSize: "10.5px", cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1 }}
                    >
                      Use
                    </button>
                  )}
                  {equipDef && (
                    <button
                      onClick={() => equipItem(item.id)}
                      disabled={loading}
                      style={{ flexShrink: 0, background: "transparent", border: `1px solid ${CODE_VOICE}`, color: CODE_VOICE, padding: "2px 8px", fontFamily: "ui-monospace, monospace", fontSize: "10.5px", cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1 }}
                    >
                      Equip
                    </button>
                  )}
                </div>
              );
            })
          )}
        </LedgerSection>

        <LedgerSection title={`Quests (${quests.length})`}>
          {quests.length === 0 ? (
            <div style={{ color: DIM }}>none yet</div>
          ) : (
            quests.map((q, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ color: q.status === "complete" ? SLATE : AMBER, textDecoration: q.status === "complete" ? "line-through" : "none" }}>{q.title}</div>
                <div style={{ color: SLATE, paddingLeft: "8px", fontSize: "11.5px" }}>{q.description}</div>
              </div>
            ))
          )}
        </LedgerSection>

        <div style={{ borderTop: `2px solid #33291D`, boxShadow: `0 -1px 0 rgba(200,155,74,0.25)`, margin: "20px 0 18px", paddingTop: "16px", fontSize: "12px", color: AMBER, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: DISPLAY_FONT, display: "flex", alignItems: "center", gap: "8px" }}>
          <RavenGlyph size={14} /> World Ledger <span style={{ color: DIM, textTransform: "none", letterSpacing: 0, fontFamily: "ui-monospace, monospace", fontSize: "10px" }}>(Claude's narrative memory)</span>
        </div>

        <LedgerSection title="Location">
          <div style={{ color: INK }}>{worldState.locations[worldState.locationId]?.name}</div>
          <div style={{ color: CODE_VOICE, fontSize: "11px", marginTop: "2px" }}>id: {worldState.locationId}</div>
          {(worldState.locations[worldState.locationId]?.connections || []).length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <div style={{ color: SLATE, fontSize: "10.5px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>Nearby</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {worldState.locations[worldState.locationId].connections.map((id) => (
                  <button
                    key={id}
                    onClick={() => submitAction(`Travel to ${worldState.locations[id]?.name}`)}
                    disabled={loading || !!combat || !!shop || character.pendingAttributePoints > 0}
                    style={{ background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "3px 9px", fontFamily: "ui-monospace, monospace", fontSize: "10.5px", cursor: loading ? "default" : "pointer", opacity: loading ? 0.5 : 1 }}
                  >
                    → {worldState.locations[id]?.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </LedgerSection>

        <LedgerSection title="Reputation">
          <div style={{ color: INK }}>{worldState.reputation}</div>
        </LedgerSection>

        <LedgerSection title={`NPCs Remembered (${worldState.npcs.length})`}>
          {worldState.npcs.length === 0 ? (
            <div style={{ color: DIM }}>none yet</div>
          ) : (
            worldState.npcs.map((n) => (
              <div key={n.id} style={{ marginBottom: "12px" }}>
                <div style={{ color: AMBER }}>
                  {n.name} <span style={{ color: DIM, fontSize: "11px" }}>({n.id})</span>
                  {n.merchant && <span style={{ color: CODE_VOICE, fontSize: "10.5px" }}> — {MERCHANT_TYPES[n.merchant.merchantType].label} ({n.merchant.gold}g on hand)</span>}
                  {isHostile(n) && <span style={{ color: WOUND, fontSize: "10.5px" }}> ⚠ hostile — refuses to trade</span>}
                </div>
                <div style={{ color: SLATE, paddingLeft: "8px" }}>{n.memory}</div>
                <div style={{ color: CODE_VOICE, paddingLeft: "8px", fontSize: "11px", marginTop: "2px" }}>
                  trust {n.trust ?? 0} · respect {n.respect ?? 0} · fear {n.fear ?? 0}
                  {n.merchant && trustPriceModifier(n.trust || 0).buyMult !== 1 && (
                    <span style={{ color: trustPriceModifier(n.trust || 0).buyMult < 1 ? AMBER : WOUND }}>
                      {" "}({trustPriceModifier(n.trust || 0).buyMult < 1 ? "better" : "worse"} prices)
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </LedgerSection>

        <LedgerSection title={`World Facts (${worldState.worldFacts.length})`}>
          {worldState.worldFacts.length === 0 ? (
            <div style={{ color: DIM }}>none yet</div>
          ) : (
            worldState.worldFacts.map((f, i) => (
              <div key={i} style={{ color: SLATE, marginBottom: "6px" }}>• {f}</div>
            ))
          )}
        </LedgerSection>

        <div style={{ marginTop: "20px", color: DIM, fontSize: "11px", lineHeight: 1.6 }}>
          Steel-blue lines in the story feed are code-determined outcomes. Everything above the
          divider is numeric and deterministic; everything below is Claude's qualitative memory.
        </div>
      </div>
      </div>
    </>
  );
}

// The shop panel — same "code-owned, boxed-off" visual language as the combat panel, so
// players learn the pattern once: a bordered box below the log means code has taken over
// briefly and text input is paused until you're done. Buying/selling never calls the AI.
// Character creation — a full page, not an overlay, since it's the very first thing a
// new player sees (or the one-time gap-filler for an older save). Race, background,
// weapon, and voice are button grids rather than dropdowns/selects to match the rest of
// the app's touch-first UI. Background bonus is only ever a preview here; submitIdentity
// decides whether it's actually applied (never, in "migrate" mode — see the note below).
// Appearance is deliberately one free-text field rather than a dozen separate pickers
// (height/build/hair/scars/etc.) — free text covers all of that with far less UI, and
// gives more actual expressive freedom than a fixed preset ever could.
function CharacterCreationScreen({ mode, onSubmit }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState(null);
  const [age, setAge] = useState("");
  const [appearance, setAppearance] = useState("");
  const [race, setRace] = useState(null);
  const [background, setBackground] = useState(null);
  const [weapon, setWeapon] = useState("dagger");
  const [voice, setVoice] = useState(null);
  const [backstory, setBackstory] = useState("");

  const canSubmit = name.trim().length > 0 && race && background;
  const GENDER_OPTIONS = ["Male", "Female", "Nonbinary", "Prefer not to say"];

  function fieldLabel(text) {
    return (
      <label style={{ display: "block", fontFamily: DISPLAY_FONT, fontSize: "11px", letterSpacing: "0.08em", textTransform: "uppercase", color: SLATE, marginBottom: "8px" }}>
        {text}
      </label>
    );
  }

  function pillButton(key, label, selected, onClick, extra) {
    return (
      <button
        key={key}
        onClick={onClick}
        style={{ background: selected ? `linear-gradient(180deg, ${BLOOD} 0%, #4A1620 100%)` : "linear-gradient(180deg, #241D15 0%, #1A150F 100%)", border: `1px solid ${selected ? BLOOD : "#4A3F2C"}`, color: INK, padding: "8px 14px", fontFamily: DISPLAY_FONT, fontSize: "12px", letterSpacing: "0.03em", cursor: "pointer", borderRadius: "2px", textAlign: "left" }}
      >
        {label}
        {extra}
      </button>
    );
  }

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "radial-gradient(ellipse at 30% 0%, #211B15 0%, #14110D 65%)", color: INK, fontFamily: BODY_FONT, padding: "32px 20px", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: "20px", color: AMBER, letterSpacing: "0.04em", marginBottom: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
          <RavenGlyph size={18} /> {mode === "migrate" ? "Who Are You?" : "Begin Your Story"}
        </div>
        <p style={{ color: SLATE, fontSize: "13.5px", marginBottom: "24px", lineHeight: 1.6 }}>
          {mode === "migrate"
            ? "Your journey is already underway, but you've never given it a name. Fill this in and it'll pick up right where you left off — a background here is flavor only, since applying a fresh stat bonus wouldn't be fair to progress you've already made."
            : "Every choice below is yours to make, and none of it locks you out of anything later — attributes and abilities are always open to whatever build you choose as you play."}
        </p>

        <div style={{ marginBottom: "22px" }}>
          {fieldLabel("Name")}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should the world call you?"
            style={{ width: "100%", background: "#1A1611", border: "1px solid #33291D", color: INK, padding: "10px 12px", fontFamily: BODY_FONT, fontSize: "15px", outline: "none", borderRadius: "2px", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", gap: "16px", marginBottom: "22px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 200px" }}>
            {fieldLabel("Gender")}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {GENDER_OPTIONS.map((g) => pillButton(g, g, gender === g, () => setGender(g)))}
            </div>
          </div>
          <div style={{ flex: "0 1 100px" }}>
            {fieldLabel("Age")}
            <input
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
              placeholder="—"
              inputMode="numeric"
              style={{ width: "100%", background: "#1A1611", border: "1px solid #33291D", color: INK, padding: "10px 12px", fontFamily: BODY_FONT, fontSize: "15px", outline: "none", borderRadius: "2px", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: "22px" }}>
          {fieldLabel("Appearance (optional)")}
          <textarea
            value={appearance}
            onChange={(e) => setAppearance(e.target.value)}
            placeholder="Height, build, hair, eyes, scars, tattoos, clothing — whatever matters to you. Leave blank and it's left to the imagination."
            rows={2}
            style={{ width: "100%", background: "#1A1611", border: "1px solid #33291D", color: INK, padding: "10px 12px", fontFamily: BODY_FONT, fontSize: "14px", outline: "none", borderRadius: "2px", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ marginBottom: "22px" }}>
          {fieldLabel("Race")}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {RACE_OPTIONS.map((r) => pillButton(r.key, r.label, race === r.key, () => setRace(r.key)))}
          </div>
          {race && <p style={{ color: SLATE, fontSize: "11.5px", marginTop: "8px", lineHeight: 1.5 }}>{RACE_OPTIONS.find((r) => r.key === race).flavor}</p>}
        </div>

        <div style={{ marginBottom: "22px" }}>
          {fieldLabel("Background")}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {Object.entries(BACKGROUND_OPTIONS).map(([key, b]) => {
              const selected = background === key;
              const bonusText = Object.entries(b.bonus).map(([k, v]) => `+${v} ${ATTRIBUTE_DEFS[k].short}`).join(" ");
              return pillButton(
                key,
                <div>
                  <div>{b.label}</div>
                  <div style={{ color: mode === "migrate" ? DIM : CODE_VOICE, fontSize: "10.5px", marginTop: "2px", textDecoration: mode === "migrate" ? "line-through" : "none" }}>{bonusText}</div>
                </div>,
                selected,
                () => setBackground(key)
              );
            })}
          </div>
          {background && (
            <p style={{ color: SLATE, fontSize: "11.5px", marginTop: "8px", lineHeight: 1.5 }}>
              {BACKGROUND_OPTIONS[background].flavor} <span style={{ color: DIM }}>{BACKGROUND_OPTIONS[background].npcTag}</span>
            </p>
          )}
        </div>

        {mode !== "migrate" && (
          <div style={{ marginBottom: "22px" }}>
            {fieldLabel("Starting Weapon")}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {Object.entries(STARTING_WEAPON_OPTIONS).map(([key, w]) => pillButton(key, w.label, weapon === key, () => setWeapon(key)))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: "22px" }}>
          {fieldLabel("Voice (optional)")}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {VOICE_OPTIONS.map((v) => pillButton(v, v, voice === v, () => setVoice(voice === v ? null : v)))}
          </div>
        </div>

        <div style={{ marginBottom: "28px" }}>
          {fieldLabel("Backstory (optional)")}
          <textarea
            value={backstory}
            onChange={(e) => setBackstory(e.target.value)}
            placeholder="A sentence or two about who you were before this — leave blank to keep it a mystery."
            rows={3}
            style={{ width: "100%", background: "#1A1611", border: "1px solid #33291D", color: INK, padding: "10px 12px", fontFamily: BODY_FONT, fontSize: "14px", outline: "none", borderRadius: "2px", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>

        <button
          onClick={() => onSubmit({ name: name.trim(), gender, age: age.trim(), appearance: appearance.trim(), race, background, weapon, voice, backstory: backstory.trim() })}
          disabled={!canSubmit}
          style={{ background: canSubmit ? `linear-gradient(180deg, ${BLOOD} 0%, #4A1620 100%)` : "transparent", border: `1px solid ${canSubmit ? BLOOD : "#4A3F2C"}`, color: canSubmit ? INK : DIM, padding: "12px 24px", fontFamily: DISPLAY_FONT, fontSize: "13px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: canSubmit ? "pointer" : "default", borderRadius: "2px", width: "100%" }}
        >
          {mode === "migrate" ? "Continue Your Story" : "Begin"}
        </button>
      </div>
    </div>
  );
}

// A full-screen overlay, not an inline log panel — this is read-anytime reference
// material, not a decision the game is waiting on, so it doesn't lock input the way
// combat/shop/level-up do. Purely static content; nothing here calls the AI or touches
// game state beyond marking itself seen.
function TutorialPanel({ step, onNext, onBack, onClose }) {
  const content = TUTORIAL_STEPS[step];
  const isFirst = step === 0;
  const isLast = step === TUTORIAL_STEPS.length - 1;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,8,6,0.82)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ maxWidth: "480px", width: "100%", background: "linear-gradient(180deg, #241D15 0%, #191510 100%)", border: `2px solid ${AMBER}`, borderRadius: "4px", padding: "24px", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontFamily: DISPLAY_FONT, fontSize: "10.5px", letterSpacing: "0.12em", color: SLATE, textTransform: "uppercase" }}>
            Step {step + 1} of {TUTORIAL_STEPS.length}
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "2px 8px", fontFamily: "ui-monospace, monospace", fontSize: "10.5px", cursor: "pointer" }}>
            Skip
          </button>
        </div>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: "17px", color: AMBER, marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <RavenGlyph size={14} /> {content.title}
        </div>
        <p style={{ fontFamily: BODY_FONT, fontSize: "15.5px", lineHeight: 1.65, color: INK, marginBottom: "20px" }}>{content.body}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
          <button onClick={onBack} disabled={isFirst} style={{ background: "transparent", border: "1px solid #4A3F2C", color: isFirst ? DIM : SLATE, padding: "8px 16px", fontFamily: DISPLAY_FONT, fontSize: "12px", letterSpacing: "0.04em", cursor: isFirst ? "default" : "pointer", borderRadius: "2px" }}>
            Back
          </button>
          <button onClick={isLast ? onClose : onNext} style={{ background: `linear-gradient(180deg, ${BLOOD} 0%, #4A1620 100%)`, border: `1px solid ${BLOOD}`, color: INK, padding: "8px 20px", fontFamily: DISPLAY_FONT, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px" }}>
            {isLast ? "Let's play" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

// The Journal — deliberately NOT a new piece of game state. Every section here reads
// from data the game already tracks (worldState.npcs, worldState.locations, quests,
// worldState.worldFacts, attribute milestones); this is a compiled view, not a new
// system. Full-screen overlay like the tutorial — reference material, not a decision
// the game is waiting on, so it doesn't lock input.
// The pause menu — the one place that's honest about what's built and what isn't. Save
// slots and Settings are placeholders on purpose: rather than dead buttons that do
// nothing, each explains what actually happens today (autosave) so nobody's left
// wondering if they clicked something broken.
function PausePanel({ onResume, onOpenTutorial, confirmingNewGame, onRequestNewGame, onConfirmNewGame, onCancelNewGame, onManualSave, onManualLoad, manualSaveExists, manualSaveAt, manualSaveStatus }) {
  function menuButton(label, onClick, color = INK, borderColor = "#4A3F2C", disabled = false) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{ width: "100%", background: "linear-gradient(180deg, #241D15 0%, #1A150F 100%)", border: `1px solid ${disabled ? "#332C22" : borderColor}`, color: disabled ? DIM : color, padding: "13px 16px", fontFamily: DISPLAY_FONT, fontSize: "13px", letterSpacing: "0.04em", cursor: disabled ? "default" : "pointer", borderRadius: "2px", textAlign: "left", marginBottom: "8px", opacity: disabled ? 0.6 : 1 }}
      >
        {label}
      </button>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,8,6,0.88)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ maxWidth: "380px", width: "100%", background: "linear-gradient(180deg, #241D15 0%, #191510 100%)", border: `2px solid ${AMBER}`, borderRadius: "4px", padding: "24px" }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: "18px", color: AMBER, letterSpacing: "0.06em", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <RavenGlyph size={16} /> Paused
        </div>

        {menuButton("Resume", onResume, INK, BLOOD)}
        {menuButton("Tutorial", onOpenTutorial)}

        {confirmingNewGame ? (
          <div style={{ border: `1px solid ${WOUND}`, borderRadius: "2px", padding: "12px", marginBottom: "8px" }}>
            <div style={{ color: WOUND, fontSize: "12px", marginBottom: "10px", lineHeight: 1.5 }}>This erases your current save and starts a brand-new character. This can't be undone.</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={onConfirmNewGame} style={{ flex: 1, background: BLOOD, border: `1px solid ${BLOOD}`, color: INK, padding: "8px", fontFamily: "ui-monospace, monospace", fontSize: "11px", cursor: "pointer" }}>
                Confirm — erase save
              </button>
              <button onClick={onCancelNewGame} style={{ flex: 1, background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "8px", fontFamily: "ui-monospace, monospace", fontSize: "11px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          menuButton("New Game", onRequestNewGame, WOUND)
        )}

        <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
          <div style={{ flex: 1 }}>{menuButton("Save", onManualSave, CODE_VOICE, CODE_VOICE)}</div>
          <div style={{ flex: 1 }}>{menuButton("Load", manualSaveExists ? onManualLoad : undefined, CODE_VOICE, CODE_VOICE, !manualSaveExists)}</div>
        </div>
        <p style={{ color: DIM, fontSize: "10.5px", marginTop: "0", marginBottom: "14px", lineHeight: 1.5, minHeight: "14px" }}>
          {manualSaveStatus
            ? manualSaveStatus
            : manualSaveExists
            ? `One manual checkpoint saved${manualSaveAt ? ` at ${manualSaveAt}` : ""} — Load returns to exactly that moment. Autosave keeps running separately either way.`
            : "No manual checkpoint yet — Save creates one; Load will return to it later, separate from autosave."}
        </p>

        <div style={{ opacity: 0.5, pointerEvents: "none" }}>{menuButton("Settings")}</div>
        <p style={{ color: DIM, fontSize: "10.5px", marginTop: "-4px", lineHeight: 1.5 }}>Coming eventually — just a placeholder for now.</p>
      </div>
    </div>
  );
}

// Visual map — same full-screen overlay pattern as Journal/Tutorial/Pause, but the
// content is an SVG rather than text: real nodes, real connection lines, laid out by
// computeMapLayout. Only locations directly connected to where the player is now are
// clickable — clicking submits the same "Travel to X" action the sidebar's Nearby
// buttons already use, so this is a second way to trigger the exact same real AI turn,
// not a separate teleport mechanism.
// Small deterministic hash — used to pick a stable curve direction per edge so trails
// don't jitter between renders, without needing Math.random (which would).
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

// A straight line reads as a road on a technical diagram, not a route on a map. Bowing
// it slightly via a quadratic curve — direction picked by hashing the edge, so it's
// stable rather than random every render — gives connections a hand-drawn trail feel
// instead of geometric wiring.
function trailPath(x1, y1, x2, y2, seed) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = -dy / len, py = dx / len;
  const bend = Math.min(len * 0.15, 22) * (hashStr(seed) % 2 === 0 ? 1 : -1);
  return `M ${x1} ${y1} Q ${mx + px * bend} ${my + py * bend} ${x2} ${y2}`;
}

// A compass rose, drawn as two overlapping four-point stars (like real cartography
// compasses) plus a ring and the four cardinal ticks — same hand-drawn-icon approach as
// RavenGlyph elsewhere, just more elaborate since it's meant to anchor the whole map.
function CompassRose({ size = 70, color = MAP_INK }) {
  const r = size / 2;
  const star = (outer, inner, rotationDeg) => {
    const pts = [];
    for (let i = 0; i < 8; i++) {
      const rad = (Math.PI / 4) * i + (rotationDeg * Math.PI) / 180;
      const radius = i % 2 === 0 ? outer : inner;
      pts.push(`${r + radius * Math.sin(rad)},${r - radius * Math.cos(rad)}`);
    }
    return pts.join(" ");
  };
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity: 0.75 }}>
      <circle cx={r} cy={r} r={r - 2} fill="none" stroke={color} strokeWidth={1} />
      <polygon points={star(r - 4, r * 0.28, 0)} fill={color} opacity={0.85} />
      <polygon points={star(r - 12, r * 0.18, 45)} fill={color} opacity={0.5} />
      <circle cx={r} cy={r} r={3} fill={color} />
    </svg>
  );
}

function MapPanel({ worldState, onClose, onTravel, canTravel }) {
  const { locations, locationId } = worldState;
  const positions = computeMapLayout(locations, "loc_1");
  const ids = Object.keys(locations);

  const xs = ids.map((id) => positions[id]?.x ?? 0);
  const ys = ids.map((id) => positions[id]?.y ?? 0);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pad = 90;
  const spanX = Math.max(maxX - minX, 20);
  const spanY = Math.max(maxY - minY, 20);
  const viewBox = `${minX - pad} ${minY - pad} ${spanX + pad * 2} ${spanY + pad * 2}`;

  const drawnEdges = new Set();
  const edges = [];
  ids.forEach((id) => {
    (locations[id]?.connections || []).forEach((cid) => {
      if (!locations[cid]) return;
      const key = [id, cid].sort().join("|");
      if (drawnEdges.has(key)) return;
      drawnEdges.add(key);
      edges.push([id, cid]);
    });
  });

  const currentConnections = new Set(locations[locationId]?.connections || []);
  const isSparse = ids.length < 2;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,8,6,0.92)", zIndex: 1000, display: "flex", flexDirection: "column", padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexShrink: 0 }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: "16px", color: AMBER, letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "8px" }}>
          <RavenGlyph size={14} /> World Map
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "5px 12px", fontFamily: "ui-monospace, monospace", fontSize: "11px", cursor: "pointer" }}>
          Close
        </button>
      </div>
      <div style={{ color: DIM, fontSize: "10.5px", marginBottom: "10px", flexShrink: 0 }}>
        {isSparse
          ? "You haven't traveled anywhere from here yet — the map fills in as you explore."
          : "The marked pin is where you are. Underlined names are reachable from here — tap to travel."}
      </div>
      <div style={{ flex: 1, minHeight: 0, border: `3px double ${PARCHMENT_DARK}`, borderRadius: "3px", position: "relative", overflow: "hidden", boxShadow: "0 0 0 6px #14110D, inset 0 0 60px rgba(58,42,24,0.5)" }}>
        <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", height: "100%", display: "block" }}>
          <defs>
            <radialGradient id="parchmentGrad" cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor={PARCHMENT_LIGHT} />
              <stop offset="65%" stopColor={PARCHMENT_MID} />
              <stop offset="100%" stopColor={PARCHMENT_DARK} />
            </radialGradient>
            <filter id="paperGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} stitchTiles="stitch" result="noise" />
              <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.23  0 0 0 0 0.16  0 0 0 0 0.09  0 0 0 0.35 0" />
            </filter>
          </defs>
          <rect x={minX - pad} y={minY - pad} width={spanX + pad * 2} height={spanY + pad * 2} fill="url(#parchmentGrad)" />
          <rect x={minX - pad} y={minY - pad} width={spanX + pad * 2} height={spanY + pad * 2} filter="url(#paperGrain)" opacity={0.5} />

          {edges.map(([a, b]) => {
            const key = `${a}|${b}`;
            return (
              <path
                key={key}
                d={trailPath(positions[a].x, positions[a].y, positions[b].x, positions[b].y, key)}
                fill="none"
                stroke={MAP_TRAIL}
                strokeWidth={2}
                strokeDasharray="1 7"
                strokeLinecap="round"
                opacity={0.75}
              />
            );
          })}

          {ids.map((id) => {
            const pos = positions[id];
            const loc = locations[id];
            const isCurrent = id === locationId;
            const isReachable = currentConnections.has(id);
            const canClick = isReachable && canTravel;
            return (
              <g
                key={id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => canClick && onTravel(loc.name)}
                style={{ cursor: canClick ? "pointer" : "default" }}
              >
                {isCurrent ? (
                  <>
                    <circle r={16} fill={BLOOD} opacity={0.18} />
                    <path d="M0,-11 C5,-4 5,4 0,11 C-5,4 -5,-4 0,-11 Z" fill={BLOOD} stroke={MAP_INK} strokeWidth={1.5} />
                    <circle cy={-4} r={2.5} fill={PARCHMENT_LIGHT} />
                  </>
                ) : (
                  <circle r={5} fill={isReachable ? MAP_INK : "none"} stroke={MAP_INK} strokeWidth={1.5} opacity={isReachable ? 1 : 0.55} />
                )}
                <text
                  y={isCurrent ? 30 : 20}
                  textAnchor="middle"
                  fill={MAP_INK}
                  fontFamily={DISPLAY_FONT}
                  fontSize={isCurrent ? 13 : 11}
                  fontWeight={isCurrent ? 700 : 400}
                  textDecoration={canClick ? "underline" : "none"}
                  opacity={isCurrent || isReachable ? 1 : 0.7}
                >
                  {shortLocationLabel(loc.name)}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ position: "absolute", top: "10px", right: "12px", pointerEvents: "none" }}>
          <CompassRose size={64} />
        </div>
      </div>
    </div>
  );
}

function JournalPanel({ character, worldState, quests, onClose }) {
  function relationshipTag(npc) {
    if (isHostile(npc)) return { label: "Hostile", color: WOUND };
    const trust = npc.trust || 0;
    if (trust >= 8) return { label: "Devoted ally", color: AMBER };
    if (trust >= 5) return { label: "Trusted", color: AMBER };
    if (trust <= -5) return { label: "Distrustful", color: WOUND };
    return { label: "Acquaintance", color: SLATE };
  }

  const unlockedAbilities = getUnlockedAbilities(character.attributes);
  const attributeMilestoneLines = Object.entries(character.attributes)
    .map(([key, value]) => {
      const m = milestoneFor(value);
      if (!m || m.min < 20) return null;
      return `${ATTRIBUTE_DEFS[key].label}: ${m.label} (${value})`;
    })
    .filter(Boolean);

  const activeQuests = quests.filter((q) => q.status === "active");
  const completedQuests = quests.filter((q) => q.status === "complete");

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,8,6,0.9)", zIndex: 1000, overflowY: "auto", padding: "20px" }}>
      <div style={{ maxWidth: "560px", width: "100%", margin: "0 auto", background: "linear-gradient(180deg, #241D15 0%, #191510 100%)", border: `2px solid ${AMBER}`, borderRadius: "4px", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: "18px", color: AMBER, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: "10px" }}>
            <RavenGlyph size={16} /> Journal
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "5px 12px", fontFamily: "ui-monospace, monospace", fontSize: "11px", cursor: "pointer" }}>
            Close
          </button>
        </div>

        {character.identity && (
          <div style={{ marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #33291D" }}>
            <div style={{ color: AMBER, fontFamily: DISPLAY_FONT, fontSize: "15px" }}>{character.identity.name}</div>
            <div style={{ color: SLATE, fontSize: "12px", marginTop: "2px" }}>
              {RACE_OPTIONS.find((r) => r.key === character.identity.race)?.label} · {BACKGROUND_OPTIONS[character.identity.background]?.label} · Level {character.level}
            </div>
            <div style={{ color: SLATE, fontSize: "12px", marginTop: "6px", fontStyle: "italic" }}>{worldState.reputation}</div>
          </div>
        )}

        <JournalSection title={`People Met (${worldState.npcs.length})`}>
          {worldState.npcs.length === 0 ? (
            <div style={{ color: DIM, fontSize: "12px" }}>No one worth remembering yet.</div>
          ) : (
            worldState.npcs.map((n) => {
              const tag = relationshipTag(n);
              return (
                <div key={n.id} style={{ marginBottom: "12px" }}>
                  <div style={{ color: INK, fontSize: "13px" }}>
                    {n.name} <span style={{ color: tag.color, fontSize: "10.5px", marginLeft: "6px" }}>{tag.label}</span>
                    {n.merchant && <span style={{ color: CODE_VOICE, fontSize: "10.5px", marginLeft: "6px" }}>{MERCHANT_TYPES[n.merchant.merchantType].label}</span>}
                  </div>
                  <div style={{ color: SLATE, fontSize: "11.5px", marginTop: "2px" }}>{n.memory}</div>
                </div>
              );
            })
          )}
        </JournalSection>

        <JournalSection title={`Locations Discovered (${Object.keys(worldState.locations).length})`}>
          {Object.entries(worldState.locations).map(([id, loc]) => (
            <div key={id} style={{ marginBottom: "8px" }}>
              <div style={{ color: id === worldState.locationId ? AMBER : INK, fontSize: "12.5px" }}>
                • {loc.name}{id === worldState.locationId ? " (here now)" : ""}
              </div>
              {loc.connections.length > 0 && (
                <div style={{ color: SLATE, fontSize: "10.5px", paddingLeft: "12px", marginTop: "2px" }}>
                  ↔ {loc.connections.map((cid) => worldState.locations[cid]?.name).filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          ))}
        </JournalSection>

        <JournalSection title={`Quests (${activeQuests.length} active, ${completedQuests.length} complete)`}>
          {quests.length === 0 ? (
            <div style={{ color: DIM, fontSize: "12px" }}>No quests yet.</div>
          ) : (
            quests.map((q, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ color: q.status === "complete" ? SLATE : AMBER, fontSize: "13px", textDecoration: q.status === "complete" ? "line-through" : "none" }}>{q.title}</div>
                <div style={{ color: SLATE, fontSize: "11.5px", marginTop: "2px" }}>{q.description}</div>
              </div>
            ))
          )}
        </JournalSection>

        <JournalSection title="Achievements">
          <div style={{ color: INK, fontSize: "12.5px", marginBottom: "6px" }}>Level {character.level}</div>
          {attributeMilestoneLines.map((line, i) => (
            <div key={i} style={{ color: SLATE, fontSize: "12px", marginBottom: "4px" }}>• {line}</div>
          ))}
          {unlockedAbilities.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              {unlockedAbilities.map((a) => (
                <div key={a.key} style={{ color: a.mechanical ? CODE_VOICE : AMBER, fontSize: "12px", marginBottom: "4px" }}>
                  • {a.label} <span style={{ color: DIM, fontSize: "10.5px" }}>({ATTRIBUTE_DEFS[a.attr].short} {a.min})</span>
                </div>
              ))}
            </div>
          )}
        </JournalSection>

        <JournalSection title={`Notable History (${worldState.worldFacts.length})`}>
          {worldState.worldFacts.length === 0 ? (
            <div style={{ color: DIM, fontSize: "12px" }}>Nothing recorded yet.</div>
          ) : (
            worldState.worldFacts.map((f, i) => (
              <div key={i} style={{ color: SLATE, fontSize: "12.5px", marginBottom: "6px" }}>• {f}</div>
            ))
          )}
        </JournalSection>
      </div>
    </div>
  );
}

function JournalSection({ title, children }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
        <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, transparent, ${DIM})` }} />
        <RavenGlyph size={10} color={DIM} />
        <div style={{ color: SLATE, fontFamily: DISPLAY_FONT, fontSize: "10.5px", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${DIM}, transparent)` }} />
      </div>
      {children}
    </div>
  );
}

function ShopPanel({ shopNpc, merchantType, character, onBuy, onSell, onClose, loading }) {
  const merchantDef = MERCHANT_TYPES[merchantType];
  const merchant = shopNpc.merchant;
  const trust = shopNpc.trust || 0;
  const priceMod = trustPriceModifier(trust);
  const silverTongue = hasAbility(character, "silver_tongue");
  const merchantBackground = hasBackgroundPriceEdge(character);
  const sellableItems = character.inventory.filter((item) => item.equipmentKey || item.consumableKind);

  return (
    <div style={{ margin: "20px 0", padding: "16px", border: `2px solid ${AMBER}`, background: "linear-gradient(180deg, #241D12 0%, #191510 100%)", boxShadow: "inset 0 0 24px rgba(0,0,0,0.4)", borderRadius: "3px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "10px" }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: "13px", letterSpacing: "0.05em", color: AMBER, display: "flex", alignItems: "center", gap: "8px" }}>
          <RavenGlyph size={12} color={AMBER} /> {shopNpc.name} — {merchantDef.label}
        </div>
        <button onClick={onClose} disabled={loading} style={{ flexShrink: 0, background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "4px 10px", fontFamily: "ui-monospace, monospace", fontSize: "10.5px", cursor: loading ? "default" : "pointer" }}>
          Leave shop
        </button>
      </div>
      <div style={{ color: SLATE, fontSize: "11px", marginBottom: "14px", fontFamily: "ui-monospace, monospace" }}>
        Your gold: <span style={{ color: AMBER }}>{character.gold}g</span> · {merchantDef.label.toLowerCase()}'s buying budget: <span style={{ color: CODE_VOICE }}>{merchant.gold}g</span>
        {priceMod.buyMult !== 1 && (
          <span style={{ color: priceMod.buyMult < 1 ? AMBER : WOUND }}> · {priceMod.buyMult < 1 ? "trusted — better rates" : "distrusted — worse rates"} (trust {trust})</span>
        )}
        {silverTongue && <span style={{ color: AMBER }}> · Silver Tongue active</span>}
        {merchantBackground && <span style={{ color: AMBER }}> · Merchant's instinct active</span>}
      </div>

      <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <div style={{ color: SLATE, fontFamily: DISPLAY_FONT, fontSize: "10.5px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>For sale</div>
          {merchant.stock.every((s) => s.remaining <= 0) ? (
            <div style={{ color: DIM, fontSize: "12px" }}>Sold out.</div>
          ) : (
            merchant.stock.map((s) => {
              if (s.remaining <= 0) return null;
              const price = buyPriceFor(merchantType, s.key, trust, character.attributes.cha, silverTongue, merchantBackground);
              const canAfford = character.gold >= price;
              return (
                <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ color: INK, fontSize: "12.5px", minWidth: 0 }}>
                    {displayNameForKey(s.key)} <span style={{ color: DIM }}>×{s.remaining}</span>
                  </div>
                  <button
                    onClick={() => onBuy(s.key)}
                    disabled={loading || !canAfford}
                    style={{ flexShrink: 0, background: "transparent", border: `1px solid ${canAfford ? AMBER : "#4A3F2C"}`, color: canAfford ? AMBER : DIM, padding: "3px 9px", fontFamily: "ui-monospace, monospace", fontSize: "10.5px", cursor: loading || !canAfford ? "default" : "pointer" }}
                  >
                    Buy {price}g
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div style={{ flex: "1 1 220px", minWidth: 0 }}>
          <div style={{ color: SLATE, fontFamily: DISPLAY_FONT, fontSize: "10.5px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Sell from your pack</div>
          {sellableItems.length === 0 ? (
            <div style={{ color: DIM, fontSize: "12px" }}>Nothing tradeable on you.</div>
          ) : (
            sellableItems.map((item) => {
              const price = sellPriceFor(merchantType, item, trust, character.attributes.cha, silverTongue, merchantBackground);
              const canSell = merchant.gold >= price;
              return (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ color: RARITY_TIERS[rarityOf(item)].color, fontSize: "12.5px", minWidth: 0 }}>
                    {item.name}
                    {item.quantity > 1 && <span style={{ color: SLATE }}> ×{item.quantity}</span>}
                  </div>
                  <button
                    onClick={() => onSell(item.id)}
                    disabled={loading || !canSell}
                    style={{ flexShrink: 0, background: "transparent", border: `1px solid ${canSell ? CODE_VOICE : "#4A3F2C"}`, color: canSell ? CODE_VOICE : DIM, padding: "3px 9px", fontFamily: "ui-monospace, monospace", fontSize: "10.5px", cursor: loading || !canSell ? "default" : "pointer" }}
                    title={canSell ? "" : "This merchant can't afford that right now"}
                  >
                    Sell {price}g
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// The attribute panel — same boxed, code-owned visual language as combat/shop/leveling:
// a bordered box means code has taken over and text input is paused until you're done.
// Spending never calls the AI, and there's no soft cap here beyond ATTRIBUTE_CAP itself —
// dumping every point into one attribute is a fully valid, supported build choice.
function AttributePanel({ character, onSpend, loading }) {
  return (
    <div style={{ margin: "20px 0", padding: "16px", border: `2px solid ${CODE_VOICE}`, background: "linear-gradient(180deg, #16232A 0%, #131D22 100%)", boxShadow: "inset 0 0 24px rgba(0,0,0,0.4)", borderRadius: "3px" }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: "13px", letterSpacing: "0.05em", color: CODE_VOICE, marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
        <RavenGlyph size={12} color={CODE_VOICE} /> Level {character.level} — spend your attribute points
      </div>
      <div style={{ color: SLATE, fontSize: "11px", marginBottom: "12px", fontFamily: "ui-monospace, monospace" }}>
        {character.pendingAttributePoints} point{character.pendingAttributePoints > 1 ? "s" : ""} to spend — put them anywhere, any way you like
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {Object.entries(ATTRIBUTE_DEFS).map(([key, def]) => {
          const value = character.attributes[key];
          const milestone = milestoneFor(value);
          const atCap = value >= ATTRIBUTE_CAP;
          return (
            <button
              key={key}
              onClick={() => onSpend(key)}
              disabled={loading || atCap}
              style={{ background: "linear-gradient(180deg, #1C2A30 0%, #131D22 100%)", border: `1px solid ${CODE_VOICE}`, color: INK, padding: "10px 16px", fontFamily: DISPLAY_FONT, fontSize: "12.5px", letterSpacing: "0.03em", cursor: loading || atCap ? "default" : "pointer", opacity: loading || atCap ? 0.5 : 1, borderRadius: "2px", textAlign: "left" }}
            >
              <div style={{ color: CODE_VOICE }}>
                {def.label} <span style={{ color: AMBER }}>{value}</span>
              </div>
              <div style={{ color: SLATE, fontSize: "10.5px", fontFamily: "ui-monospace, monospace", marginTop: "2px" }}>
                {atCap ? "at cap" : `${milestone ? milestone.label : ""} → +1`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// A small iron-framed progress bar — used for HP (blood) and XP (gold leaf) readouts.
function StatBar({ value, max, color, height = 8 }) {
  const pct = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;
  return (
    <div style={{ height, borderRadius: "2px", background: "#0E0C0A", border: "1px solid #33291D", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.6)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(180deg, ${color} 0%, #0E0C0A 220%)`, transition: "width 0.3s ease" }} />
    </div>
  );
}

function LedgerSection({ title, children }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
        <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, transparent, ${DIM})` }} />
        <RavenGlyph size={10} color={DIM} />
        <div style={{ color: SLATE, fontFamily: DISPLAY_FONT, fontSize: "10.5px", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{title}</div>
        <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${DIM}, transparent)` }} />
      </div>
      {children}
    </div>
  );
}
