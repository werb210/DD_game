import React, { useState, useRef, useEffect } from 'react';

import dwarfPortrait from './assets/dwarf_portrait.png';
import elfPortrait from './assets/elf_portrait.png';
import halflingPortrait from './assets/halfling_portrait.png';
import humanPortrait from './assets/human_portrait.png';
import orcPortrait from './assets/orc_portrait.png';
import tieflingPortrait from './assets/tiefling_portrait.png';
import banditSprite from './assets/bandit.png';
import goblinSprite from './assets/goblin.png';
import skeletonSprite from './assets/skeleton.png';
import wolfSprite from './assets/wolf.png';
import chainmailIcon from './assets/armor_chainmail.png';
import leatherIcon from './assets/armor_leather.png';
import plateIcon from './assets/armor_plate.png';
import robesIcon from './assets/armor_robes.png';
import swordIcon from './assets/iron_sword.png';
import axeIcon from './assets/item_axe.png';
import bowIcon from './assets/item_bow.png';
import daggerIcon from './assets/item_dagger.png';
import hammerIcon from './assets/item_hammer.png';
import spearIcon from './assets/item_spear.png';
import staffIcon from './assets/item_staff.png';
import healingPotionIcon from './assets/healing_potion.png';
import coinIcon from './assets/hud_coin.png';
import heartIcon from './assets/hud_heart.png';
import scrollIcon from './assets/hud_scroll.png';
import shieldIcon from './assets/hud_shield.png';
import dungeonLocation from './assets/loc_dungeon.png';
import forestRoadLocation from './assets/loc_forest_road.png';
import innLocation from './assets/loc_inn.png';
import villageLocation from './assets/loc_village.png';
import { LORE_DATA } from './LORE_DATA.js';
import { WORLD_LORE } from './WORLD_LORE.js';
import { STATUS_EFFECT_TABLE } from './data/statusEffectData.js';
import { WEAPON_ASPECT_TABLE } from './data/weaponAspectData.js';
import { RUNE_TABLE } from './data/runeData.js';

// ---- Design tokens ----
// Grimdark medieval reskin: cold iron, old blood, tarnished gold leaf on parchment ink.
// CODE_VOICE keeps its structural job (marking code-determined outcomes) but is now a
// "Valyrian steel" blue-grey instead of sage green, to sit inside the new palette.

const INK = "#E4D9BE";
const AMBER = "#C89B4A";
const TYPEWRITER_DELAY_MS = 45;
const ROLL_FLICKERS = 13;

const textSegments = (value) => [{ type: "text", value: String(value) }];
const rollSegments = (before, chance, outcome, after = "") => [
  { type: "text", value: before },
  { type: "roll", chance, outcome: !!outcome },
  ...(after ? [{ type: "text", value: after }] : []),
];

function entrySegments(entry) {
  if (Array.isArray(entry.segments)) return entry.segments;
  return textSegments(entry.role === "dm" ? entry.narration || "" : entry.text || "");
}

function useSequentialFeedReveal(log) {
  const [visible, setVisible] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [revealing, setRevealing] = useState(log.length > 0);

  useEffect(() => {
    if (cursor >= log.length) {
      setRevealing(false);
      return undefined;
    }
    let cancelled = false;
    const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));
    const updateSegment = (segmentIndex, rendered) => {
      if (cancelled) return;
      setVisible((current) => {
        const next = [...current];
        const line = next[cursor] ? { ...next[cursor] } : { segments: [] };
        const segments = [...line.segments];
        segments[segmentIndex] = rendered;
        line.segments = segments;
        next[cursor] = line;
        return next;
      });
    };

    setRevealing(true);
    (async () => {
      const segments = entrySegments(log[cursor]);
      for (let segmentIndex = 0; segmentIndex < segments.length && !cancelled; segmentIndex += 1) {
        const segment = segments[segmentIndex];
        if (segment.type === "roll") {
          for (let flip = 0; flip < ROLL_FLICKERS && !cancelled; flip += 1) {
            const success = Math.random() >= 0.5;
            updateSegment(segmentIndex, { type: "roll", value: success ? "success" : "failure", outcome: success, chance: segment.chance });
            await wait(35 + flip * 12);
          }
          updateSegment(segmentIndex, { type: "roll", value: segment.outcome ? "success" : "failure", outcome: segment.outcome, chance: segment.chance });
          await wait(400);
        } else {
          const value = String(segment.value || "");
          for (let length = 1; length <= value.length && !cancelled; length += 1) {
            updateSegment(segmentIndex, { type: "text", value: value.slice(0, length) });
            await wait(TYPEWRITER_DELAY_MS);
          }
        }
      }
      if (!cancelled) setCursor((value) => value + 1);
    })();
    return () => { cancelled = true; };
  }, [cursor, log.length]);

  return { visible, revealing: revealing || cursor < log.length };
}

function RevealedLine({ line }) {
  return (line?.segments || []).map((segment, index) => segment?.type === "roll" ? (
    <span key={index} title={`${segment.chance}% chance`} style={{ color: segment.outcome ? "#55C987" : "#E05D68", fontWeight: 700 }}>
      {segment.value}
    </span>
  ) : <React.Fragment key={index}>{segment?.value || ""}</React.Fragment>);
}
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

const RACE_SPRITES = {
  human: humanPortrait, elf: elfPortrait, dwarf: dwarfPortrait,
  orc: orcPortrait, halfling: halflingPortrait, tiefling: tieflingPortrait,
};
const ENEMY_SPRITES = {
  goblin: goblinSprite, wolf: wolfSprite,
  bandit: banditSprite, skeleton: skeletonSprite,
};

const EQUIPMENT_SPRITES = {
  rusty_dagger: daggerIcon, steel_dagger: daggerIcon, iron_sword: swordIcon,
  silver_rapier: swordIcon, war_axe: axeIcon, oak_staff: staffIcon,
  robes: robesIcon, leather_armor: leatherIcon, chainmail: chainmailIcon,
  plate_armor: plateIcon, starting_sword: swordIcon, starting_axe: axeIcon,
  starting_spear: spearIcon, starting_bow: bowIcon, starting_staff: staffIcon,
  starting_hammer: hammerIcon,
};

function locationSpriteFor(name = "") {
  const normalized = name.toLowerCase();
  if (normalized.includes("dungeon") || normalized.includes("crypt") || normalized.includes("cave")) return dungeonLocation;
  if (normalized.includes("forest") || normalized.includes("road") || normalized.includes("trail")) return forestRoadLocation;
  if (normalized.includes("village") || normalized.includes("town")) return villageLocation;
  return innLocation;
}

function PixelSprite({ src, alt, size = 72, style = {} }) {
  return <img src={src} alt={alt} width={size} height={size} draggable="false" style={{ display: "block", objectFit: "contain", imageRendering: "pixelated", ...style }} />;
}

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

const SEVERITY_TIERS = {
  common: { min: 0, max: 29, midpoint: 15, deathChance: 0 },
  uncommon: { min: 30, max: 49, midpoint: 40, deathChance: 0 },
  rare: { min: 50, max: 74, midpoint: 62, deathChance: 0.05 },
  epic: { min: 75, max: 104, midpoint: 90, deathChance: 0.12 },
  legendary: { min: 105, max: 139, midpoint: 122, deathChance: 0.22 },
  mythic: { min: 140, max: Infinity, midpoint: 157, deathChance: 0.35 },
};

const SKILL_CHECK_TYPES = {
  force: { attribute: "str", label: "Force" },
  finesse: { attribute: "dex", label: "Finesse" },
  endure: { attribute: "con", label: "Endure" },
  discern: { attribute: "int", label: "Discern" },
  perceive: { attribute: "wis", label: "Perceive" },
  sway: { attribute: "cha", label: "Sway" },
};

const SEVERITY_ORDER = Object.keys(SEVERITY_TIERS);
const SKILL_CHECK_DIFFICULTY_SCALING = 0.25;

function threatScoreFor(enemy) {
  return enemy.hp + enemy.attack * 3 + enemy.defense * 2;
}

function severityFor(enemy) {
  const score = threatScoreFor(enemy);
  return Object.keys(SEVERITY_TIERS).find((key) => score <= SEVERITY_TIERS[key].max) || "mythic";
}

function deathChanceForLoss(severity, playerPower, npc) {
  const tier = SEVERITY_TIERS[severity];
  // Threat scores include the enemy's entire HP pool; dividing the band's midpoint by
  // three puts it on the same per-exchange scale as ATK + DEF*2 + level*3.
  const expectedPower = tier.midpoint / 3;
  const powerRatio = playerPower / expectedPower;
  if (tier.deathChance === 0) return { chance: 0, powerRatio, relationshipAdjustment: 0 };
  const multiplier = powerRatio >= 1.5 ? 0.4 : powerRatio >= 0.85 ? 1 : powerRatio >= 0.5 ? 2 : 3.5;
  let relationshipAdjustment = 0;
  if (npc?.lastInteraction === "spared" || (npc && ((npc.trust || 0) >= 6 || (npc.respect || 0) >= 6))) relationshipAdjustment = -0.15;
  else if (npc && ((npc.trust || 0) <= -4 || (npc.fear || 0) >= 6)) relationshipAdjustment = 0.12;
  return {
    chance: clamp(tier.deathChance * multiplier + relationshipAdjustment, 0.02, 0.9),
    powerRatio,
    relationshipAdjustment,
  };
}

function factionReferenceContainsName(name) {
  const target = String(name || "").trim().toLowerCase();
  if (!target) return false;
  function contains(value) {
    if (typeof value === "string") return value.trim().toLowerCase() === target;
    if (Array.isArray(value)) return value.some(contains);
    return value && typeof value === "object" && Object.entries(value).some(([key, entry]) => key.trim().toLowerCase() === target || contains(entry));
  }
  return contains(FACTIONS_TABLE);
}

function skillCheckOdds(offer, worldState, character) {
  const check = SKILL_CHECK_TYPES[offer?.checkType];
  if (!check) return null;
  const location = worldState.locations[worldState.locationId] || WORLD_MAP[worldState.locationId];
  const baseTier = SEVERITY_TIERS[location?.dangerTier] ? location.dangerTier : "common";
  const npc = offer.npcId ? worldState.npcs.find((entry) => entry.id === offer.npcId) : null;
  const leaderBump = !!npc && factionReferenceContainsName(npc.name);
  const tierIndex = Math.min(SEVERITY_ORDER.length - 1, SEVERITY_ORDER.indexOf(baseTier) + (leaderBump ? 1 : 0));
  const difficultyTier = SEVERITY_ORDER[tierIndex];
  const difficultyNumeric = SEVERITY_TIERS[difficultyTier].midpoint;
  const baseChance = clamp(70 + (character.attributes?.[check.attribute] || 0) * 0.5 - difficultyNumeric * SKILL_CHECK_DIFFICULTY_SCALING, 10, 95);
  let relationshipAdjustment = 0;
  if (npc?.lastInteraction === "spared" || (npc && ((npc.trust || 0) >= 6 || (npc.respect || 0) >= 6))) relationshipAdjustment = 15;
  else if (npc && ((npc.trust || 0) <= -4 || (npc.fear || 0) >= 6)) relationshipAdjustment = -12;
  return {
    chance: clamp(Math.round(baseChance + relationshipAdjustment), 10, 95),
    difficultyTier,
    difficultyNumeric,
    relationshipAdjustment,
    check,
  };
}

const INJURY_TABLE = {
  chest: { statKey: "con", amount: -2, description: "A pale, ragged scar crosses the ribs." },
  arm: { statKey: "str", amount: -2, description: "A deep scar runs along the fighting arm." },
  leg: { statKey: "dex", amount: -2, description: "A crooked scar marks the wounded leg." },
  head: { statKey: "wis", amount: -1, description: "A thin scar cuts across the brow." },
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

const NPC_TRAITS = [
  "Honest", "Greedy", "Cowardly", "Brave", "Loyal", "Curious",
  "Stubborn", "Suspicious", "Kind", "Ambitious", "Superstitious", "Vengeful",
];

const INTERACTION_TYPES = new Set(["standard", "quest_decision", "climactic_dialogue"]);

function currentQuestStage(quest) {
  if (quest?.currentStage && typeof quest.currentStage === "object") return quest.currentStage;
  if (quest?.stage && typeof quest.stage === "object") return quest.stage;
  if (!Array.isArray(quest?.stages)) return null;
  const stageReference = quest.currentStageId ?? quest.stageId ?? quest.currentStage ?? quest.stage;
  if (typeof stageReference === "number") return quest.stages[stageReference] || null;
  return quest.stages.find((stage) => stage?.id === stageReference) || null;
}

function validateInteractionType(result, quests, npcs) {
  const requestedType = INTERACTION_TYPES.has(result?.interactionType) ? result.interactionType : "standard";
  if (requestedType === "quest_decision") {
    const atKeyDecision = quests.some((quest) => quest.status === "active" && currentQuestStage(quest)?.keyDecisionPoint === true);
    return atKeyDecision ? requestedType : "standard";
  }
  if (requestedType === "climactic_dialogue") {
    const involvedNpc = npcs.find((npc) => npc.id === result?.interactionNpcId);
    return involvedNpc && (involvedNpc.trust || 0) >= 7 ? requestedType : "standard";
  }
  return "standard";
}

function paceNarration(narration, interactionType) {
  if (interactionType !== "standard") return narration;
  const paragraphs = narration.split(/\n\s*\n/).filter((paragraph) => paragraph.trim());
  return paragraphs.slice(0, 2).join("\n\n");
}

// Fixed vocabulary of consumable effects. Claude may tag a "loot" event with one of these
// kinds when the item is a usable curative — the actual heal amount lives here in code,
// never in Claude's narration. Items with no kind (or an unrecognized one) are just flavor/
// equipment: they sit in inventory but have no coded effect yet.
const MATERIAL_TABLE = {
  chorus_shard: { label: "Chorus Shard", dropTier: "rare" },
};

const CONSUMABLE_TABLE = {
  minor_healing: { healAmount: 12, label: "a minor restorative" },
  healing: { healAmount: 25, label: "a restorative" },
  major_healing: { healAmount: 45, label: "a potent restorative" },
  ration: { healAmount: 0, hungerRestore: 40, label: "Heartlands Rations" },
  elven_bread: { healAmount: 0, hungerRestore: 100, fullHunger: true, buff: "hunger_immune", durationMinutes: 60, label: "Elven Bread" },
  dwarven_rations: { healAmount: 0, hungerRestore: 40, buff: "con_food", attribute: "con", amount: 2, durationMinutes: 60, label: "Dwarven Trail Rations" },
  northern_meat: { healAmount: 0, hungerRestore: 40, buff: "resist_frost", durationMinutes: 60, label: "Northern Preserved Meat" },
  desert_flatbread: { healAmount: 0, hungerRestore: 40, buff: "arc_food", attribute: "arcane", amount: 2, durationMinutes: 30, label: "Desert Flatbread" },
  honey_cake: { healAmount: 0, hungerRestore: 40, buff: "cha_food", attribute: "cha", amount: 2, durationMinutes: 60, label: "Halfling Honey-Cake" },
  preserved_fish: { healAmount: 0, hungerRestore: 40, buff: "resist_poison", durationMinutes: 60, label: "Orc Preserved Fish" },
  injury_tonic: { healAmount: 0, curesInjury: true, label: "an injury-curing tonic" },
};

// Fixed vocabulary of equipment. Claude tags a "loot" event with one of these keys when
// the item is a wearable weapon or armor piece — never with the free-text item name.
// This is deliberate: an earlier version let equip logic match on Claude's narrated
// item name directly, and even small phrasing differences ("Iron Longsword" vs
// "iron longsword") silently broke it. Picking from this fixed, code-known list is the
// same fix already applied to consumables — Claude never invents the atk/defBonus numbers.
export const ELEMENT_ADVANTAGE_TABLE = [
  { attacker: "fire", defender: "frost", modifier: 0.05 },
  { attacker: "frost", defender: "lightning", modifier: 0.05 },
  { attacker: "lightning", defender: "nature", modifier: 0.05 },
  { attacker: "nature", defender: "shadow", modifier: 0.05 },
  { attacker: "shadow", defender: "radiant", modifier: 0.05 },
  { attacker: "radiant", defender: "fire", modifier: 0.05 }
];

export const SPELL_TABLE = [
  { spellId: "firebolt", name: "Firebolt", school: "evocation", element: "fire", tier: 1, manaCost: 6, effectType: "damage", effectMagnitude: 8, levelReq: 1, region: null },
  { spellId: "frost_lance", name: "Frost Lance", school: "evocation", element: "frost", tier: 1, manaCost: 6, effectType: "damage", effectMagnitude: 7, levelReq: 1, region: null },
  { spellId: "static_shock", name: "Static Shock", school: "evocation", element: "lightning", tier: 1, manaCost: 8, effectType: "damage", effectMagnitude: 10, levelReq: 2, region: null },
  { spellId: "mend_wounds", name: "Mend Wounds", school: "restoration", element: "radiant", tier: 1, manaCost: 10, effectType: "heal", effectMagnitude: 12, levelReq: 1, region: null },
  { spellId: "natures_ward", name: "Nature's Ward", school: "arcane", element: "nature", tier: 1, manaCost: 8, effectType: "buff_def", effectMagnitude: 3, levelReq: 2, region: null },
  { spellId: "shadow_veil", name: "Shadow Veil", school: "arcane", element: "shadow", tier: 1, manaCost: 10, effectType: "buff_dodge", effectMagnitude: 20, levelReq: 3, region: null }
];

export const COMBO_TABLE = [
  { elementA: "fire", statusOnTarget: "wet", bonusEffectKey: "steam_burst" },
  { elementA: "frost", statusOnTarget: "wet", bonusEffectKey: "frozen_skip_turn" }
];

// Empty for now — spell mods to be seeded in a later pass
export const MOD_TABLE = [];

const EQUIPMENT_TABLE = {
  rusty_dagger: { slot: "weapon", atkBonus: 1 },
  steel_dagger: { slot: "weapon", atkBonus: 2 },
  iron_sword: { slot: "weapon", atkBonus: 3, strRequired: 8, aspect: "flame" },
  silver_rapier: { slot: "weapon", atkBonus: 3 },
  war_axe: { slot: "weapon", atkBonus: 4, strRequired: 14, aspect: "lightning" },
  oak_staff: { slot: "weapon", atkBonus: 2, aspect: "poison" },
  robes: { slot: "armor", defBonus: 1 },
  leather_armor: { slot: "armor", defBonus: 2 },
  chainmail: { slot: "armor", defBonus: 3 },
  plate_armor: { slot: "armor", defBonus: 5 },
  // Starting-tier weapons offered at character creation. All deliberately atkBonus: 1,
  // same as rusty_dagger — picking a spear over a sword is a flavor choice, not a power
  // choice, so no starting weapon type is objectively better than another.
  starting_sword: { slot: "weapon", atkBonus: 1 },
  starting_axe: { slot: "weapon", atkBonus: 1, strRequired: 8 },
  starting_spear: { slot: "weapon", atkBonus: 1, strRequired: 6 },
  starting_bow: { slot: "weapon", atkBonus: 1 },
  starting_staff: { slot: "weapon", atkBonus: 1 },
  starting_hammer: { slot: "weapon", atkBonus: 1, strRequired: 12 },
};

// ---- Attribute system. Seven primary attributes drive every derived combat/social number.
// Claude never sees or sets attribute values or derived stats — it only ever gets a
// narrative-flavor summary (condition, notable traits) for color in its prose.

const ATTRIBUTE_DEFS = {
  str: { label: "Strength", short: "STR" },
  dex: { label: "Dexterity", short: "DEX" },
  con: { label: "Constitution", short: "CON" },
  int: { label: "Intelligence", short: "INT" },
  wis: { label: "Wisdom", short: "WIS" },
  cha: { label: "Charisma", short: "CHA" },
  arcane: { label: "Arcane", short: "ARC" },
};

const ATTRIBUTE_CAP = 99;
const ATTRIBUTE_POINTS_PER_LEVEL = 5;
const TRAINING_FATIGUE_COST = 4;
const RESOURCE_TICK_MS = 7 * 60 * 1000;

// Training prices are deliberately code-owned. Early growth is accessible, while the
// quadratic tail makes instruction near heroic scores a serious investment.
function trainingCostFor(targetScore) {
  if (targetScore < 15) return 8;
  return Math.round(8 + Math.pow(targetScore - 14, 2) * 0.75);
}

function validTrainableStats(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.flatMap((entry) => {
    const stat = typeof entry?.stat === "string" ? entry.stat.toLowerCase() : "";
    const maxLevel = Math.floor(Number(entry?.maxLevel));
    return ATTRIBUTE_DEFS[stat] && Number.isFinite(maxLevel)
      ? [{ stat, maxLevel: clamp(maxLevel, 1, ATTRIBUTE_CAP) }]
      : [];
  });
}

const initialAttributes = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10, arcane: 10 };

// Race is pure narrative flavor — no stat effect at all. It exists so Claude has
// something true and stable to reference in narration, not to give anyone a mechanical
// edge over anyone else.

const RACE_STAT_BONUS_TABLE = {
  human: {},
  dwarf: { con: 2, str: 1 },
  elf: { dex: 2, int: 1 },
  halfling: { dex: 1, cha: 2 },
  orc: { str: 2, con: 1 },
  tiefling: { cha: 1, arcane: 1 }
};

const BACKGROUND_STAT_BONUS_TABLE = {
  mercenary: { str: 1, con: 1 },
  scholar: { int: 2 },
  noble: { cha: 2 },
  criminal: { dex: 2 },
  hedge_mage: { arcane: 2 }
};

function statBonusText(bonus = {}) {
  const entries = Object.entries(bonus).filter(([, amount]) => amount);
  if (!entries.length) return 'No stat bonuses';
  return entries.map(([k, v]) => `+${v} ${ATTRIBUTE_DEFS[k]?.short || k.toUpperCase()}`).join(', ');
}

function combinedStatBonus(...tables) {
  return tables.reduce((acc, table) => {
    Object.entries(table || {}).forEach(([key, amount]) => { acc[key] = (acc[key] || 0) + amount; });
    return acc;
  }, {});
}

const RACE_OPTIONS = [
  { key: "human", label: "Human", flavor: "Adaptable and unremarkable at a glance — humans get by on grit and versatility." },
  { key: "elf", label: "Elf", flavor: "Long-lived and keenly perceptive, elves are often underestimated by those who mistake grace for fragility." },
  { key: "dwarf", label: "Dwarf", flavor: "Stout and stubborn, dwarves are built for endurance and rarely back down once committed." },
  { key: "orc", label: "Orc", flavor: "Physically formidable, orcs are frequently misjudged as brutish by people who've never actually met one." },
  { key: "halfling", label: "Halfling", flavor: "Small, quick, and easy to overlook — which suits most halflings just fine." },
  { key: "tiefling", label: "Tiefling", flavor: "Marked by an otherworldly heritage, tieflings are used to being stared at first and judged second." },
];

// ---- Fixed world canon. These ids, routes, cultures, and danger tiers exist before
// character creation and are never authored by the narrator. loc_1 deliberately remains
// Barrow's Cross so saves and story content which already point at it continue to resolve.
const WORLD_MAP = {
  loc_1: { id: "loc_1", name: "Barrow's Cross", regionId: "heartlands", type: "settlement", dangerTier: "common", connections: ["vaelcrest", "amberfield", "ironwatch", "bleeding_field", "weeping_vale"] },
  vaelcrest: { id: "vaelcrest", name: "Vaelcrest", regionId: "heartlands", type: "settlement", dangerTier: "common", connections: ["loc_1", "amberfield", "ironwatch", "bleeding_field", "weeping_vale", "ironhold", "sernwood"] },
  amberfield: { id: "amberfield", name: "Amberfield", regionId: "heartlands", type: "settlement", dangerTier: "common", connections: ["loc_1", "vaelcrest", "ironwatch", "bleeding_field"] },
  ironwatch: { id: "ironwatch", name: "Ironwatch", regionId: "heartlands", type: "settlement", dangerTier: "common", connections: ["loc_1", "vaelcrest", "amberfield", "weeping_vale"] },
  bleeding_field: { id: "bleeding_field", name: "The Bleeding Field", regionId: "heartlands", type: "point_of_interest", dangerTier: "uncommon", connections: ["loc_1", "vaelcrest", "amberfield"] },
  weeping_vale: { id: "weeping_vale", name: "The Weeping Vale", regionId: "heartlands", type: "point_of_interest", dangerTier: "rare", connections: ["loc_1", "vaelcrest", "ironwatch"] },
  ironhold: { id: "ironhold", name: "Ironhold", regionId: "mountains", type: "settlement", dangerTier: "common", connections: ["emberhearth", "deep_warrens", "hollow_vein", "skarrow_peak", "vaelcrest", "ashkavars_rest"] },
  emberhearth: { id: "emberhearth", name: "Emberhearth", regionId: "mountains", type: "settlement", dangerTier: "common", connections: ["ironhold", "deep_warrens", "hollow_vein", "skarrow_peak"] },
  deep_warrens: { id: "deep_warrens", name: "The Deep Warrens", regionId: "mountains", type: "point_of_interest", dangerTier: "uncommon", connections: ["ironhold", "emberhearth"] },
  hollow_vein: { id: "hollow_vein", name: "The Hollow Vein", regionId: "mountains", type: "point_of_interest", dangerTier: "rare", connections: ["ironhold", "emberhearth", "skarrow_peak"] },
  skarrow_peak: { id: "skarrow_peak", name: "Skarrow Peak", regionId: "mountains", type: "point_of_interest", dangerTier: "epic", connections: ["ironhold", "emberhearth", "hollow_vein"] },
  ashkavars_rest: { id: "ashkavars_rest", name: "Ashkavar's Rest", regionId: "desert", type: "settlement", dangerTier: "common", connections: ["sunspire_court", "duskmarket", "palms_rest", "glasswastes", "glass_cathedral", "ironhold", "mireholt"] },
  sunspire_court: { id: "sunspire_court", name: "Sunspire Court", regionId: "desert", type: "settlement", dangerTier: "common", connections: ["ashkavars_rest", "duskmarket", "palms_rest", "glasswastes", "glass_cathedral"] },
  duskmarket: { id: "duskmarket", name: "Duskmarket", regionId: "desert", type: "settlement", dangerTier: "uncommon", connections: ["ashkavars_rest", "sunspire_court", "palms_rest", "glasswastes"] },
  palms_rest: { id: "palms_rest", name: "Palm's Rest", regionId: "desert", type: "point_of_interest", dangerTier: "common", connections: ["ashkavars_rest", "sunspire_court", "duskmarket"] },
  glasswastes: { id: "glasswastes", name: "The Glasswastes", regionId: "desert", type: "point_of_interest", dangerTier: "rare", connections: ["ashkavars_rest", "sunspire_court", "duskmarket", "glass_cathedral"] },
  glass_cathedral: { id: "glass_cathedral", name: "The Glass Cathedral", regionId: "desert", type: "point_of_interest", dangerTier: "legendary", connections: ["ashkavars_rest", "sunspire_court", "glasswastes"] },
  mireholt: { id: "mireholt", name: "Mireholt", regionId: "swamp", type: "settlement", dangerTier: "common", connections: ["thornback_hold", "gravewater_vigil", "drowned_choir", "ashkavars_rest", "saltmere"] },
  thornback_hold: { id: "thornback_hold", name: "Thornback Hold", regionId: "swamp", type: "settlement", dangerTier: "common", connections: ["mireholt", "gravewater_vigil", "drowned_choir"] },
  gravewater_vigil: { id: "gravewater_vigil", name: "Gravewater Vigil", regionId: "swamp", type: "settlement", dangerTier: "uncommon", connections: ["mireholt", "thornback_hold", "drowned_choir"] },
  drowned_choir: { id: "drowned_choir", name: "The Drowned Choir", regionId: "swamp", type: "point_of_interest", dangerTier: "epic", connections: ["mireholt", "thornback_hold", "gravewater_vigil"] },
  sernwood: { id: "sernwood", name: "Sernwood", regionId: "heavy_forest", type: "settlement", dangerTier: "common", connections: ["silverbough", "elderglass_grove", "fallen_spire", "hollow_root", "vaelcrest", "drakes_hollow"] },
  silverbough: { id: "silverbough", name: "Silverbough", regionId: "heavy_forest", type: "settlement", dangerTier: "common", connections: ["sernwood", "elderglass_grove", "fallen_spire", "hollow_root"] },
  elderglass_grove: { id: "elderglass_grove", name: "The Elderglass Grove", regionId: "heavy_forest", type: "point_of_interest", dangerTier: "rare", connections: ["sernwood", "silverbough"] },
  fallen_spire: { id: "fallen_spire", name: "The Fallen Spire", regionId: "heavy_forest", type: "point_of_interest", dangerTier: "epic", connections: ["sernwood", "silverbough", "hollow_root"] },
  hollow_root: { id: "hollow_root", name: "The Hollow Root", regionId: "heavy_forest", type: "point_of_interest", dangerTier: "legendary", connections: ["sernwood", "silverbough", "fallen_spire"] },
  saltmere: { id: "saltmere", name: "Saltmere", regionId: "coast", type: "settlement", dangerTier: "common", connections: ["tidewatch", "duskhaven", "widows_shoals", "last_lantern", "mireholt", "drakes_hollow"] },
  tidewatch: { id: "tidewatch", name: "Tidewatch", regionId: "coast", type: "settlement", dangerTier: "common", connections: ["saltmere", "duskhaven", "widows_shoals", "last_lantern"] },
  duskhaven: { id: "duskhaven", name: "Duskhaven", regionId: "coast", type: "settlement", dangerTier: "uncommon", connections: ["saltmere", "tidewatch", "widows_shoals", "last_lantern"] },
  widows_shoals: { id: "widows_shoals", name: "The Widow's Shoals", regionId: "coast", type: "point_of_interest", dangerTier: "uncommon", connections: ["saltmere", "tidewatch", "duskhaven"] },
  last_lantern: { id: "last_lantern", name: "The Last Lantern", regionId: "coast", type: "point_of_interest", dangerTier: "rare", connections: ["saltmere", "tidewatch", "duskhaven"] },
  drakes_hollow: { id: "drakes_hollow", name: "Drake's Hollow", regionId: "tundra", type: "settlement", dangerTier: "common", connections: ["ashgrim_hold", "wintermeres_landing", "rimefall_vault", "long_ice", "saltmere", "sernwood"] },
  ashgrim_hold: { id: "ashgrim_hold", name: "Ashgrim Hold", regionId: "tundra", type: "settlement", dangerTier: "common", connections: ["drakes_hollow", "wintermeres_landing", "rimefall_vault", "long_ice"] },
  wintermeres_landing: { id: "wintermeres_landing", name: "Wintermere's Landing", regionId: "tundra", type: "settlement", dangerTier: "common", connections: ["drakes_hollow", "ashgrim_hold", "rimefall_vault", "long_ice"] },
  rimefall_vault: { id: "rimefall_vault", name: "The Rimefall Vault", regionId: "tundra", type: "point_of_interest", dangerTier: "epic", connections: ["drakes_hollow", "ashgrim_hold", "wintermeres_landing"] },
  long_ice: { id: "long_ice", name: "The Long Ice", regionId: "tundra", type: "point_of_interest", dangerTier: "legendary", connections: ["drakes_hollow", "ashgrim_hold", "wintermeres_landing"] },
};

const REGIONS_TABLE = {
  heavy_forest: { displayName: "Forest", dominantRace: "elf", hubSettlement: "sernwood", passiveAbility: { key: "wilderness_step", description: "You move quietly and read a trail well — small edge to stealth and tracking in the wild." } },
  desert: { displayName: "Desert", dominantRace: "tiefling", hubSettlement: "ashkavars_rest", passiveAbility: { key: "sun_born", description: "Heat rarely slows you down, and traders in the sun-scoured lands deal with you a little more fairly." } },
  swamp: { displayName: "Swamp", dominantRace: "orc", hubSettlement: "mireholt", passiveAbility: { key: "hardened_constitution", description: "Poison and disease take noticeably less of a toll on you than most." } },
  mountains: { displayName: "Mountains", dominantRace: "dwarf", hubSettlement: "ironhold", passiveAbility: { key: "guild_rates", description: "Smiths and guild traders give you a modest discount — you know real craft when you see it." } },
  heartlands: { displayName: "Heartlands", dominantRace: "human_south", hubSettlement: "loc_1", passiveAbility: { key: "noble_reception", description: "Nobles and officials extend you a little more courtesy than a stranger usually gets." } },
  coast: { displayName: "Coast", dominantRace: "halfling", hubSettlement: "saltmere", passiveAbility: { key: "sailor_trade", description: "Sailors and dockhands treat you like one of their own, and you swim/handle boats with ease." } },
  tundra: { displayName: "Tundra", dominantRace: "human_north", hubSettlement: "drakes_hollow", passiveAbility: { key: "cold_resistance", description: "Cold that would slow most people barely touches you." } },
};

// The design request supplied only this placeholder, not the promised faction prose.
// Preserve it verbatim rather than inventing leaders or rivalries and presenting them as canon.
const FACTIONS_TABLE = Object.fromEntries(Object.keys(REGIONS_TABLE).map((regionId) => [regionId, {
  rulingBodies: [], rivalry: null, wildcard: null,
  canonicalReference: "[PASTE: the Heartlands/Mountains/Desert/Swamp/Forest/Coast/Tundra faction, leader, rivalry, and wildcard text from our design conversation here]",
}]));

function cloneWorldMap(startingLocationId = null) {
  const locations = Object.fromEntries(Object.entries(WORLD_MAP).map(([id, location]) => [id, {
    ...location,
    connections: [...location.connections],
    discovered: false,
    visited: false,
  }]));
  if (startingLocationId && locations[startingLocationId]) {
    locations[startingLocationId].discovered = true;
    locations[startingLocationId].visited = true;
    locations[startingLocationId].connections.forEach((id) => {
      if (locations[id]) locations[id].discovered = true;
    });
  }
  return locations;
}

function locationDisplayName(location) {
  if (!location?.visited && !location?.hintedName) return "Unknown path";
  return location.hintedName || location.name;
}

function revealArrival(locations, locationId) {
  const arrived = locations[locationId];
  if (!arrived) return;
  arrived.discovered = true;
  arrived.visited = true;
  arrived.connections.forEach((id) => {
    if (locations[id] && !locations[id].discovered) locations[id].discovered = true;
  });
}

function rollStartingRegion(race, random = Math.random()) {
  const matches = race === "human" ? ["heartlands", "tundra"] : Object.keys(REGIONS_TABLE).filter((id) => REGIONS_TABLE[id].dominantRace === race);
  const others = Object.keys(REGIONS_TABLE).filter((id) => !matches.includes(id));
  if (random < 0.55) return matches[Math.min(matches.length - 1, Math.floor((random / 0.55) * matches.length))];
  return others[Math.min(others.length - 1, Math.floor(((random - 0.55) / 0.45) * others.length))];
}

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
  hedge_mage: { label: "Hedge Mage", bonus: { arcane: 2 }, flavor: "You learned charms, wards, and forbidden alphabets far from any formal academy.", npcTag: "Witches, occultists, and suspicious villagers recognize the signs of hedge magic.", startingItem: { name: "Traveler's Robes", consumableKind: null, equipmentKey: "robes" } },
  urchin: { label: "Street Urchin", bonus: { dex: 2, con: 1 }, flavor: "You grew up fast, and learned to go hungry without complaint.", npcTag: "Beggars and street folk trust you as one of their own.", startingItem: { name: "Rations", consumableKind: "ration", equipmentKey: null } },
};
Object.entries(BACKGROUND_STAT_BONUS_TABLE).forEach(([key, bonus]) => {
  if (BACKGROUND_OPTIONS[key]) BACKGROUND_OPTIONS[key].bonus = bonus;
});

// Formative memories are narrative color only. Their trait nudges are deliberately
// kept separate from race/background selection and every other mechanical gate.
const FORMATIVE_MEMORY_QUESTIONS = [
  {
    id: "childhood_bully",
    prompt: "A bully corners your younger sibling. What do you do?",
    options: [
      { label: "Step in and fight, even outnumbered", traits: { aggression: 2 } },
      { label: "Run to get an adult", traits: { discipline: 1, empathy: 1 } },
      { label: "Talk the bully down", traits: { empathy: 2 } },
      { label: "Watch closely, ready to act if it gets bad", traits: { curiosity: 1, discipline: 1 } },
    ],
  },
  {
    id: "adolescent_find",
    prompt: "You find something valuable that isn't yours.",
    options: [
      { label: "Keep it — finders keepers", traits: { ambition: 2 } },
      { label: "Try to find the owner", traits: { empathy: 2 } },
      { label: "Sell it quietly, no questions", traits: { ambition: 1, aggression: 1 } },
      { label: "Turn it in to someone in authority", traits: { discipline: 2 } },
    ],
  },
  {
    id: "trusted_lie",
    prompt: "Someone you trusted lies to you.",
    options: [
      { label: "Confront them immediately, no matter the cost", traits: { aggression: 2 } },
      { label: "Quietly distance yourself, no confrontation", traits: { discipline: 2 } },
      { label: "Try to understand why they lied", traits: { empathy: 1, curiosity: 1 } },
      { label: "Use it against them later, when it's useful", traits: { ambition: 2 } },
    ],
  },
  {
    id: "formative_risk",
    prompt: "A dangerous opportunity presents itself — real reward, real risk.",
    options: [
      { label: "Take it without hesitation", traits: { curiosity: 2, aggression: 1 } },
      { label: "Plan carefully before acting", traits: { discipline: 2 } },
      { label: "Pass — not worth the risk", traits: { discipline: 1, empathy: 1 } },
      { label: "Take it, but bring others in on the reward", traits: { ambition: 1, empathy: 1 } },
    ],
  },
  {
    id: "leaving_home",
    prompt: "The night before leaving home — what do you actually want, if you're honest with yourself?",
    options: [
      { label: "To be remembered", traits: { ambition: 2 } },
      { label: "To understand the world", traits: { curiosity: 2 } },
      { label: "To protect the people I care about", traits: { empathy: 2 } },
      { label: "To never answer to anyone again", traits: { aggression: 1, ambition: 1 } },
    ],
  },
];

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
  arcane: [
    { min: 20, key: "runic_attunement", label: "Runic Attunement", mechanical: true, description: "Your socketed elemental runes harmonize more strongly with spells you know." },
    { min: 50, key: "occult_resonance", label: "Occult Resonance", mechanical: false, description: "You recognize hidden patterns in curses, sigils, and lingering magic." },
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
  const effectiveAttributes = { ...character.attributes };
  Object.values(character.timedEffects || {}).forEach((effect) => {
    if (effect.attribute && effect.expiresAt > Date.now()) effectiveAttributes[effect.attribute] += effect.amount;
  });
  (character.injuries || []).filter((injury) => !injury.cured).forEach((injury) => {
    if (Object.prototype.hasOwnProperty.call(effectiveAttributes, injury.statKey)) {
      effectiveAttributes[injury.statKey] = Math.max(1, effectiveAttributes[injury.statKey] + injury.amount);
    }
  });
  const base = baseStatsFromAttributes(effectiveAttributes);
  const weaponItem = character.equipped?.weapon;
  const armorItem = character.equipped?.armor;
  const weaponDef = weaponItem ? EQUIPMENT_TABLE[weaponItem.equipmentKey] : null;
  const armorDef = armorItem ? EQUIPMENT_TABLE[armorItem.equipmentKey] : null;
  const weaponRarityMult = weaponItem ? RARITY_TIERS[rarityOf(weaponItem)].statMult : 1;
  const armorRarityMult = armorItem ? RARITY_TIERS[rarityOf(armorItem)].statMult : 1;
  const weaponBonus = weaponDef ? Math.round(weaponDef.atkBonus * weaponRarityMult) : 0;
  const armorBonus = armorDef ? Math.round(armorDef.defBonus * armorRarityMult) : 0;
  const unlocked = getUnlockedAbilities(effectiveAttributes);
  const has = (key) => unlocked.some((a) => a.key === key);
  const baseAccuracy = clamp(70 + effectiveAttributes.dex * 0.5, 40, 95);
  const strengthShortfall = Math.max(0, (weaponDef?.strRequired || 0) - effectiveAttributes.str);
  return {
    atk: Math.max(0, base.attack + weaponBonus - (character.hunger <= 0 ? 3 : character.hunger < 30 ? 1 : 0)),
    def: base.defense + armorBonus + (has("iron_will") ? 2 : 0),
    maxHp: base.maxHp,
    critChance: Math.max(0, base.critChance - (character.fatigue < 30 ? 5 : 0)),
    dodgeChance: Math.max(0, base.dodgeChance - (character.hunger <= 0 ? 10 : 0) - (character.fatigue < 30 ? 10 : 0)),
    accuracy: Math.max(15, baseAccuracy - strengthShortfall * 5),
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
  traits: null, // hidden formative-memory narrative context; never used as a mechanical gate
  formativeAnswers: null,
  gold: 10,
  xp: 0,
  bankedSkillPoints: 0,
  hunger: 100,
  maxHunger: 100,
  fatigue: 100,
  maxFatigue: 100,
  timedEffects: {},
  forcedRest: false,
  inventory: [
    { id: "item_1", name: "Rusty dagger", consumableKind: null, equipmentKey: "rusty_dagger", rarity: "common", runeSlots: 0, runes: [], quantity: 1 },
    { id: "item_2", name: "Rations", consumableKind: "ration", equipmentKey: null, rarity: "common", quantity: 3 },
  ],
  equipped: { weapon: null, armor: null },
  injuries: [],
  scars: [],
  isDead: false,
  death: null,
};

const LORE_REGION_KEY = {
  heavy_forest: "forest",
};

const OPENING_TONAL_ANCHORS = {
  mountains: "A guild worker or Deepsinger takes notice of the character's gear or bearing, with guild rivalry chatter audible nearby.",
  heavy_forest: "The character is noticed near a Ring-bound tree by a Sern elder or Veyanth sympathizer.",
  coast: "The character arrives mid-haggle at the docks while a blooded contract is being signed nearby.",
  tundra: "The character is noticed near a hearth mid-Saga-Binder performance, with scar-oaths visible on nearby warriors.",
  desert: "The character arrives amid clan-trade bartering.",
  swamp: "The character overhears tribal council business.",
  heartlands: "The Barrow's Cross/Crossroads Inn tavern opening is one valid Heartlands pattern, but not a universal fallback.",
};

const FALLBACK_OPENING_ACTIONS = {
  mountains: ["Ask who judged your gear", "Listen to the guild rivalry", "Approach the Deepsinger"],
  heavy_forest: ["Greet the elder by the Ring-tree", "Ask what the cords record", "Listen to the Veyanth sympathizer"],
  coast: ["Watch the blooded contract", "Haggle with the dock trader", "Ask which captain needs hands"],
  tundra: ["Listen to the Saga-Binder", "Ask about the scar-oaths", "Warm yourself by the hearth"],
  desert: ["Join the clan-trade bartering", "Ask what caravan just arrived", "Study the merchants' tokens"],
  swamp: ["Listen to the council dispute", "Ask which tribe called council", "Approach the reed-marked speaker"],
  heartlands: ["Talk to the innkeeper", "Approach the locals in the corner", "Ask about work in the village"],
};

function loreForRegion(startingRegion) {
  return LORE_DATA[LORE_REGION_KEY[startingRegion] || startingRegion] || null;
}

function buildOpeningTurnPrompt(identity, startingRegion, openingWorldState, openingQuests = []) {
  const region = REGIONS_TABLE[startingRegion] || REGIONS_TABLE.heartlands;
  const startingLocationId = region.hubSettlement;
  const regionOpeningContext = {
    startingRegion,
    region,
    startingLocation: WORLD_MAP[startingLocationId],
    factions: FACTIONS_TABLE[startingRegion] || null,
    lore: loreForRegion(startingRegion),
    tonalAnchor: OPENING_TONAL_ANCHORS[startingRegion] || null,
  };

  return `WORLD STATE:
${JSON.stringify(openingWorldState, null, 2)}

CHARACTER SUMMARY (for narrative color only — do not cite numbers):
${JSON.stringify(
    characterSummaryForPrompt({ ...initialCharacter, identity }, openingQuests),
    null,
    2
  )}

OPENING TURN CONTEXT (use this for the very first scene after character creation):
${JSON.stringify(regionOpeningContext, null, 2)}

OPENING TURN INSTRUCTIONS:
This is the first narration the player sees immediately after character creation, before any player action. Ground the scene and all three suggestedActions in the starting region's actual culture, location, factions, and lore above. Do not default to a generic tavern-arrival scene with an innkeeper, locals in a corner, and village work. The tonalAnchor is only a tonal anchor, not literal text to copy. Heartlands may use the Barrow's Cross/Crossroads Inn tavern opening as one valid regional pattern, but that pattern must not be used as the fallback for other regions.

PLAYER ACTION: Begin the character's story in their starting region.`;
}

function craftFallbackOpeningNarration(identity, startingRegion = "heartlands") {
  const race = RACE_OPTIONS.find((r) => r.key === identity.race) || RACE_OPTIONS[0];
  const background = BACKGROUND_OPTIONS[identity.background] || BACKGROUND_OPTIONS.farmer;
  const weapon = STARTING_WEAPON_OPTIONS[identity.weapon] || STARTING_WEAPON_OPTIONS.dagger;
  const backstoryLine = identity.backstory && identity.backstory.trim()
    ? identity.backstory.trim()
    : "Whatever brought you here, you've kept it to yourself.";
  const appearanceLine = identity.appearance && identity.appearance.trim() ? ` ${identity.appearance.trim()}` : "";
  const region = REGIONS_TABLE[startingRegion] || REGIONS_TABLE.heartlands;
  const locationName = WORLD_MAP[region.hubSettlement].name;
  const anchor = OPENING_TONAL_ANCHORS[startingRegion] || OPENING_TONAL_ANCHORS.heartlands;
  const narration = startingRegion === "heartlands"
    ? `Rain taps the shutters of the Crossroads Inn. ${identity.name}, a ${race.label.toLowerCase()} formerly a ${background.label.toLowerCase()}, has just arrived in Millbrook, a farming village that smells of woodsmoke and wet hay, a ${weapon.name.toLowerCase()} at your side.${appearanceLine} ${backstoryLine} The innkeeper eyes you — a stranger — while three locals mutter over their ale in the corner.`
    : `${identity.name}, a ${race.label.toLowerCase()} formerly a ${background.label.toLowerCase()}, begins this road in ${locationName}, the hub of the ${region.displayName.toLowerCase()}, a ${weapon.name.toLowerCase()} at your side.${appearanceLine} ${backstoryLine} ${anchor}`;
  return {
    role: "dm",
    narration,
    suggestedActions: FALLBACK_OPENING_ACTIONS[startingRegion] || FALLBACK_OPENING_ACTIONS.heartlands,
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
    body: "Most turns move through the suggested action buttons. At key quest decisions and climactic conversations, a free-text box also appears so you can try anything you want. Claude narrates the world and decides what happens — but every number (HP, gold, damage, prices) is handled by code, never by the AI. That split is why the ledger on the right calls itself \"code-owned.\"",
  },
  {
    title: "HP, Level & XP",
    body: "Your health and level/XP show at the top of the screen and in the Character Ledger. Defeat by a dangerous foe can leave an injury, a permanent scar, or even end your story. XP fills a bar until you level up.",
  },
  {
    title: "Attributes",
    body: "You have seven attributes: STR, DEX, CON, INT, WIS, CHA, ARC. Every level banks 5 skill points. Trusted trainers can turn those points into growth, up to two lessons per in-game day, provided you can pay their fee.",
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
  day: 1,
  locationId: "loc_1",
  locations: cloneWorldMap("loc_1"),
  npcs: [],
  reputation: "Unknown — a stranger passing through",
  worldFacts: [],
};

// ---- Deterministic combat math. No AI involved in any of this. ----

function rollDamage(base, targetDefense) {
  const variance = Math.floor(Math.random() * 4) - 1; // -1..+2
  return Math.max(1, base + variance - Math.floor(targetDefense / 2));
}

function hitChanceFor(attackerAccuracy, defenderEvasion) {
  return clamp(attackerAccuracy - defenderEvasion, 0, 100);
}

// DEX-driven dodge: rolled once per incoming hit, independent of the damage roll itself.
// Accuracy is rolled first; only an attack that lands can subsequently be dodged.
function rollIncomingHit(enemyAttack, defenseTotal, dodgeChancePercent, hitChancePercent) {
  if (Math.random() * 100 >= hitChancePercent) {
    return { dmg: 0, dodged: false, missed: true };
  }
  if (Math.random() * 100 < dodgeChancePercent) {
    return { dmg: 0, dodged: true, missed: false };
  }
  return { dmg: rollDamage(enemyAttack, defenseTotal), dodged: false, missed: false };
}

// DEX-driven critical hits: a flat 1.5x multiplier on an already-rolled damage number,
// rather than its own separate roll — keeps one source of truth for "how hard did this
// swing land" instead of two competing damage formulas.
function rollOutgoingHit(atk, enemyDefense, critChancePercent, hitChancePercent, critMultiplier = 1.5) {
  if (Math.random() * 100 >= hitChancePercent) {
    return { dmg: 0, crit: false, missed: true };
  }
  const dmg = rollDamage(atk, enemyDefense);
  const crit = Math.random() * 100 < critChancePercent;
  return { dmg: crit ? Math.round(dmg * critMultiplier) : dmg, crit, missed: false };
}

function rollGoldForTier(tier) {
  const [lo, hi] = GOLD_TIERS[tier] || GOLD_TIERS.small;
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function addXp(character, amount) {
  let { xp, level, bankedSkillPoints } = character;
  bankedSkillPoints = bankedSkillPoints || 0;
  xp += amount;
  const levelUps = [];
  let healToFull = false;
  while (xp >= xpToNextLevel(level)) {
    xp -= xpToNextLevel(level);
    level += 1;
    bankedSkillPoints += ATTRIBUTE_POINTS_PER_LEVEL;
    healToFull = true; // leveling still tops you off, even before you've spent the points
    levelUps.push(level);
  }
  const newMaxHp = getEffectiveStats({ ...character, attributes: character.attributes }).maxHp;
  return { ...character, xp, level, bankedSkillPoints, hp: healToFull ? newMaxHp : character.hp, levelUps };
}

// ---- AI calls. System prompts explicitly forbid the model from inventing numbers. ----

const EXPLORATION_SYSTEM_PROMPT = `You are the narrator for a fantasy RPG. You do NOT control game numbers — HP, gold amounts, XP, and combat math are all handled by game code, not you. Your job is narration and deciding WHAT happens qualitatively, never how much.

FIXED WORLD CANON (never rename, relocate, replace, or contradict it):
REGIONS: ${JSON.stringify(REGIONS_TABLE)}
WORLD MAP: ${JSON.stringify(WORLD_MAP)}
FACTIONS: ${JSON.stringify(FACTIONS_TABLE)}
LORE DATA: ${JSON.stringify(LORE_DATA)}

LORE DATA is code-owned mythology and deep history. When narrating regional lore, NPC beliefs, customs, history, or mysteries for covered regions, use it as fixed canon and do not invent conflicting details. If a region or topic is not covered there, you may narrate freely as long as you do not contradict the fixed canon above.

You'll receive the current WORLD STATE, CHARACTER SUMMARY (level/rough HP status/inventory/active quests/notable traits — for narrative color only), and the player's action.

If CHARACTER SUMMARY includes "notableTraits" (e.g. "Strength: Skilled"), feel free to let those color your narration when relevant — a strong character might force a door, a perceptive one might notice something others miss — but never state the underlying number, and never let a trait's absence mean the player categorically fails at something; these are flavor, not hard gates. The same goes for "narrativeAbilities" (e.g. "Keen Analysis: You notice details others miss") — weave them in when they fit the scene, but they're color, not permission or denial for anything mechanical.

CHARACTER SUMMARY also includes "name", "race", "background", "backgroundNote", "gender", "age", "appearance", "voice", and "backstory". Use the player's name naturally sometimes (NPCs addressing them, narration referencing them) — but don't force it into every paragraph, and second person ("you") is still your default voice. Race, background, gender, age, and appearance are flavor for physical description and reputation, never a mechanical gate (an Elf isn't secretly better at anything the numbers don't already say, and a Noble isn't guaranteed a warm welcome everywhere). "backgroundNote" is a recognition cue (e.g. a Farmer's "villagers warm to you quickly") — let it surface when a scene plausibly involves people who'd notice, not every scene. "voice" (e.g. "Rough", "Noble") should color how the player's own manner and implied dialogue read, not how NPCs speak. Treat "backstory" as established, private history — you can have it surface in the world (a stranger who recognizes something about them, a rumor that fits) but never contradict it, and never expose details the player hasn't chosen to share in-fiction just because you know them.

"formativeTraits" and "formativeAnswers" describe private memories and instinctive tendencies. Let them subtly color reactions and narration, but never mention their numbers, reveal the answers as a ledger, restrict or remove suggested actions, or treat them as mechanical permission, success, or failure.

IMPORTANT — identity: WORLD STATE gives every NPC a stable "id" (e.g. "npc_3") and every known place a stable id inside "locations" (e.g. "loc_2"). Whenever you reference an EXISTING NPC or place in structured fields (npcUpdates, npc_relationship, shop_open, or moving to a known location), you MUST use that exact id — never their name or a paraphrase of the place. Names and display text can vary in your prose however you like; ids must be copied exactly. Only omit an id when you are introducing someone or somewhere brand new, since code assigns the id for anything new.

Rules:
- Tag every response with interactionType: "standard", "quest_decision", or "climactic_dialogue". Use "quest_decision" only when the current stage of an active quest in CHARACTER SUMMARY is explicitly marked keyDecisionPoint: true. Use "climactic_dialogue" only for a pivotal conversation with an existing NPC whose exact id you also return as interactionNpcId; code will require that NPC's trust to be at least 7. Otherwise use "standard".
- For "standard", keep narration quick: one short paragraph, occasionally two short paragraphs, or just one or two lines of dialogue with no scene-setting for minor moments. Routine actions such as drinks, small talk, errands, and simple purchases must not receive full scene treatment. Only "quest_decision" and "climactic_dialogue" may use unrestricted, multi-paragraph scene detail.
- Within a scene or conversation, do not repeat the same sentence construction. In particular, avoid reusing templates such as "She/He doesn't offer X. She/He offers Y" or similar negation-then-restatement constructions. Do not default to an extended simile (such as "like a firm hand" or "the way a smith holds hot metal") to end paragraphs; vary paragraph conclusions.
- NEVER state specific HP, gold, or XP numbers in your narration — code reports those separately.
- NEVER contradict existing world state (dead NPCs stay dead, hostile factions stay hostile, etc).
- Only emit an "encounter" event when the fiction genuinely calls for a fight.
- Use "tier" (small/medium/large) for any loot/gold/quest reward — never a specific amount.

Respond with ONLY valid JSON, no markdown fences, no preamble:
{
  "interactionType": "standard|quest_decision|climactic_dialogue",
  "interactionNpcId": "exact existing NPC id when interactionType is climactic_dialogue; otherwise omit",
  "narration": "string",
  "stateUpdates": {
    "location": null,
    "newNPCs": [{"name": "string", "memory": "short fact", "traits": "array of 1-3 strings from the fixed trait list below, optional", "goal": "short string, what this NPC wants, optional", "secret": "short string, something hidden about them, optional", "isTrainer": "boolean, optional", "trainerSubtype": "standard|deepsinger, optional", "trainableStats": "optional array of {stat: STR|DEX|CON|INT|WIS|CHA|ARC, maxLevel: integer}; maxLevel must equal this NPC's own ability", "trustRequired": "integer, optional; minimum trust for instruction"}],
    "npcUpdates": [{"id": "string — exact existing npc id from WORLD STATE", "name": "string, optional — only when this NPC's real name is genuinely revealed in the fiction for the first time", "memory": "updated fact, optional", "traits": "array of 1-3 strings from the fixed trait list, optional — only include if it should change", "goal": "short string, optional — only include if it changes", "secret": "short string, optional — only include if newly revealed or changed", "isTrainer": "boolean, optional", "trainerSubtype": "standard|deepsinger, optional", "trainableStats": "optional array of {stat: STR|DEX|CON|INT|WIS|CHA|ARC, maxLevel: integer}", "trustRequired": "integer, optional"}],
    "reputationDelta": "string or null",
    "worldFacts": ["short new persistent facts, if any"]
  },
  "events": [
    {"type": "encounter", "enemyType": "goblin|wolf|bandit|skeleton", "npcId": "string, optional — exact existing NPC id when this enemy is that named NPC"},
    {"type": "loot", "itemName": "string", "consumableKind": "minor_healing|healing|major_healing|ration|injury_tonic|null", "equipmentKey": "rusty_dagger|steel_dagger|iron_sword|silver_rapier|war_axe|oak_staff|robes|leather_armor|chainmail|plate_armor|null"},
    {"type": "gold_found", "tier": "small|medium|large"},
    {"type": "gold_spent", "tier": "small|medium|large", "reason": "short description, e.g. 'a room for the night'"},
    {"type": "quest_offer", "title": "string", "description": "string", "tier": "small|medium|large", "requiresNpcId": "string, optional — exact existing npc id this quest depends on trusting", "minTrust": "number, optional — minimum trust with that npc, only meaningful alongside requiresNpcId"},
    {"type": "quest_complete", "title": "string — must match an active quest title exactly"},
    {"type": "npc_relationship", "id": "string — exact existing npc id from WORLD STATE", "interaction": "helped|betrayed|threatened|impressed|protected|insulted|spared|smallKindness|smallSlight"},
    {"type": "shop_open", "id": "string — exact existing npc id from WORLD STATE", "merchantType": "general_store|blacksmith|apothecary|fence"}
    ,{"type": "training_offer", "id": "exact existing trainer npc id", "stat": "STR|DEX|CON|INT|WIS|CHA|ARC"}
    ,{"type": "location_hint", "existingId": "exact WORLD MAP location id"}
    ,{"type": "day_advance", "reason": "short description of the sleep or time skip"}
    ,{"type": "skill_check_offer", "checkType": "force|finesse|endure|discern|perceive|sway", "npcId": "optional exact existing npc id when a specific person is involved"}
  ],
  "suggestedActions": ["string", "string", "string"]
}

For "location": use null if unchanged or {"existingId": "exact id"} for every real named settlement or point of interest in WORLD MAP. The rare {"newDisplayName": "string"} path is reserved only for minor, disposable, scene-specific flavor spots such as a particular room, back alley, or campsite. Never use newDisplayName to create a settlement, landmark, dungeon, or persistent travel destination, and never use it for a named WORLD MAP place.

Emit location_hint only when the fiction clearly gives the player a real, actionable lead to a WORLD MAP place: an NPC names a destination, gives clear directions, or marks it on a map. Use its exact existingId. Do NOT emit it for passing references, distant lore, or vague world-flavor mentions that do not tell the player where they could actually go.

Each entry in WORLD STATE.locations has a "connections" array — the other location ids directly reachable from it based on where the player has actually traveled before. Moving to a location already listed in the current location's connections is a short, ordinary trip — narrate it briefly. Moving to a known location that ISN'T in the current connections (somewhere the player has heard of but never traveled to directly from here) should read like a real journey — time passing, distance covered — rather than an instant unexplained jump, even though it's still a single action. Code will automatically treat any move as establishing a new direct route between the two places, so once you've narrated that journey once, future trips between them can be brief.

Omit event types that don't apply this turn — an empty array is fine and common.

Use skill_check_offer only when the player is about to make a genuinely uncertain, consequential attempt: persuasion or intimidation, forcing something open, picking a lock, deciphering difficult text, noticing a meaningfully hidden detail, or resisting a serious physical or mental effect. Do not use it for minor actions or ordinary choices. The governing attributes are force→STR, finesse→DEX, endure→CON, discern→INT, perceive→WIS, and sway→CHA. Emit the offer before resolving the attempt; code will ask the player how they proceed and will return authoritative SKILL CHECK FACTS on their next action. When those facts are present, narrate the stated binary pass/fail without reconsidering or grading the player's wording. On failure, always redirect with a complication, cost, or worse alternative path—never create a hard dead-end or game-over from a failed skill check. There is no partial success.

For training: only emit training_offer while the player is speaking with an existing NPC whose WORLD STATE record has isTrainer true, whose trust requirement is met, and whose requested stat is listed in trainableStats and not taughtOut. Code presents the price and enforces every resource/cap check. If fatigue is below the 4-point lesson cost, narrate that the player is too fatigued and do not emit another offer. Emit day_advance whenever a full in-game day passes (sleeping, an inn stay, or a story-forced time skip); code increments the day and resolves rest recovery.

Whenever your narration describes the player paying for anything — a room, a meal, a bribe, goods from a merchant — you MUST include a matching "gold_spent" event with an appropriate tier. Narrating a purchase without the matching event means the cost never actually happens to the player's gold, which breaks the game's economy — never narrate spending money without it.

If what's purchased is a physical, carryable good (food, drink, supplies, a trinket, equipment) rather than a pure service (lodging, information, a favor), ALSO include a matching "loot" event so it lands in the player's inventory — narrate it as something they now have, not something already consumed on the spot, even for food or drink. The player decides later when to use it.

For "loot" events: set "consumableKind" ONLY when the item is a usable curative the player could consume later — a healing potion, an elixir, a ration, a poultice — and it must be one of the five fixed kinds listed above (pick whichever best matches the narrative potency you described: minor_healing < healing < major_healing; rations are always "ration"; a remedy explicitly meant to treat a lasting wound is "injury_tonic"). For anything else — weapons, armor, quest items, trinkets, keys, curios — omit consumableKind or set it to null. Never invent a new kind, and never tag equipment or quest items as consumable.

Likewise, set "equipmentKey" ONLY when the item is a wearable weapon or armor piece, and it must be exactly one of the fixed keys listed above — pick whichever fits your narration best (e.g. narrating "a battered iron blade" would use "iron_sword"; "a suit of banded steel" would use "chainmail"). A single item should have at most ONE of consumableKind or equipmentKey set, never both — pick whichever the item actually is, or leave both null for quest items, trinkets, and curios with no coded effect yet. Never invent a new equipment key.

Every item you loot is automatically assigned a rarity by code (Common through Mythic) using fixed drop odds — you have no input into this and never see or set it. Narrate loot however the scene calls for; don't try to hedge your description toward a "safe" rarity, since the actual tier is decided independently and reported separately in the game's own log line.

For npc_relationship: use this liberally for small, easy-to-miss moments, not just dramatic ones — a passing kindness or a minor slight is exactly as valid as betrayal or heroics. Never invent an interaction label outside the fixed list above; if nothing fits, omit the event.

For "traits", "goal", and "secret" on newNPCs/npcUpdates: these are optional and meant for NPCs who actually matter to the current scene or an active thread — not every passing name needs a full profile. "traits" must be 1-3 entries from this exact fixed list: Honest, Greedy, Cowardly, Brave, Loyal, Curious, Stubborn, Suspicious, Kind, Ambitious, Superstitious, Vengeful — never invent a trait outside this list. "goal" and "secret" are free text, kept to a single short sentence. A "secret" being stored here does NOT mean the player knows it — it's private narrative memory for you to reference consistently and reveal in-fiction only if and when the story actually earns that reveal; never have an NPC blurt out their own secret unprompted just because it exists in this field. Only include a field in npcUpdates when it's actually changing — omit memory/traits/goal/secret entirely rather than repeating unchanged values.

Include "name" in an npcUpdates entry whenever an NPC previously introduced under a placeholder or descriptive label (e.g. "The map-folder," "Two laborers by the fire") reveals their real name, or a name they go by, for the first time in the story. Once renamed, always refer to them by that real name in narration going forward — never fall back to the old placeholder label again. If a group label covers multiple people and only one of them gives a name, use your judgment: either rename the whole entry to that person's name if they become the one the player is actually dealing with, or leave the group entry as-is and introduce the named person as a separate new NPC if they're meaningfully distinct from the group.

For Deepsinger trainers: use isTrainer true with trainerSubtype "deepsinger". They follow the same trustRequired gate as other trainers and can socket runes into equipment using RUNE_TABLE when the fiction describes rune work.

For "shop_open": use this whenever the player's action would plausibly put them in front of a merchant to browse or trade — approaching a shopkeeper, stepping into a store, asking a trader what they have. The NPC being shopped with MUST already exist (introduce them via newNPCs first if they're new, then use their id — never open a shop on the same turn you introduce the NPC, since their id isn't assigned until after this turn resolves; narrate the approach that turn and let the player's next action open the shop). Pick "merchantType" based on what kind of trader the fiction calls for: "general_store" for a village shop selling odds and ends, "blacksmith" for weapons/armor, "apothecary" for potions/herbs/curatives, "fence" for a black-market or disreputable buyer/seller who deals in stolen or rare goods, usually found in shadier settings. Code handles the actual stock and prices — never narrate specific prices or invent items in the shop yourself. If an NPC's fear value in WORLD STATE is very high (7+), code will silently refuse to open their shop — so don't narrate a hostile, frightened NPC warmly welcoming the player to trade; narrate the refusal or distrust instead. Likewise, an NPC with high trust (5+) genuinely does give the player better prices and one with very low/negative trust gives worse ones — feel free to reflect that in narration (a warm discount, a suspicious markup) since it's already true in the numbers.

For "quest_offer": most quests need no gating. Use "requiresNpcId" + "minTrust" only when the fiction genuinely implies an NPC wouldn't share this with a stranger or someone they distrust — a secret, a family matter, something risky. Code enforces the threshold; if it isn't met, the quest is silently not created even though you narrated the offer, so avoid narrating a confident "quest accepted" beat for a gated quest — narrate the NPC's actual willingness (hesitant, testing the player, holding back) and let a future turn re-offer it once trust has grown.`;

const COMBAT_NARRATION_SYSTEM_PROMPT = `You are narrating one exchange of combat in a fantasy RPG. Game code has ALREADY resolved the mechanics — damage dealt, HP remaining, victory/defeat — and gives you those exact facts. Your only job is to narrate that outcome vividly in 2-3 sentences. Avoid repeating sentence constructions, negation-then-restatement templates, and extended similes as routine paragraph endings.

CRITICAL: Do not invent a different outcome, different damage, or different result than what's given. You are describing what already happened, not deciding it.

The facts may include "playerMissed": true (the player's attack failed to connect), "enemyMissed": true (the enemy's attack failed to connect), "playerCrit": true (the player's attack landed as a solid, exceptional hit — narrate it as such), or "playerDodged": true (an incoming attack was cleanly evaded and dealt no damage at all — narrate an actual dodge, not just a graze). They may also include "powerStrike": true (the player committed to an unusually heavy, all-in blow — narrate bigger wind-up and impact, and note they're left a little exposed), "secondWindHeal": a number (the player caught a genuine second wind and recovered that much health mid-fight — narrate a real moment of resilience, not a minor breather), or "enemyFled": true (the enemy's nerve broke entirely and they ran — this is NOT a defeat, narrate them escaping alive, rattled). If "playerDied" is true, narrate an unambiguous death. If "injuryArea" is present, make the surviving wound fit that fixed body area.

Respond with ONLY valid JSON: {"interactionType": "standard", "narration": "string"}`;

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

function runeSlotsForRarity(rarity) {
  const tier = rarityOf({ rarity });
  if (tier === "rare") return 1;
  if (tier === "epic") return 2;
  if (tier === "legendary" || tier === "mythic") return 3;
  return 0;
}

function aspectForWeapon(def) {
  return WEAPON_ASPECT_TABLE.find((aspect) => aspect.aspectId === def?.aspect) || null;
}

function canUseWeaponAspect(character, def) {
  const aspect = aspectForWeapon(def);
  if (!aspect) return true;
  return (character.attributes?.[aspect.scalesWith] || 0) >= aspect.statRequired;
}

function resourceStatuses(character) {
  const statuses = [];
  if (character.hunger <= 0) statuses.push({ id: "starving", label: "Starving", color: "#B23A3A", description: "-3 ATK and -10% dodge" });
  else if (character.hunger < 30) statuses.push({ id: "hungry", label: "Hungry", color: "#C58A35", description: "-1 ATK" });
  if (character.fatigue <= 0) statuses.push({ id: "exhausted", label: "Exhausted", color: "#B23A3A", description: "Forced rest required" });
  else if (character.fatigue < 30) statuses.push({ id: "tired", label: "Tired", color: "#77808C", description: "-10% dodge and -5% crit" });
  return statuses;
}

function getStatusDef(statusId) {
  return STATUS_EFFECT_TABLE.find((status) => status.statusId === statusId) || null;
}

function attemptApplyStatus(target, statusId, sourceStat = 10, random = Math.random) {
  const status = getStatusDef(statusId);
  if (!status) return { target, applied: false, reason: "unknown_status" };
  const cooldowns = { ...(target.statusCooldowns || {}) };
  if (statusId === "stunned" && (cooldowns.stunned || 0) > 0) return { target, applied: false, reason: "stun_cooldown" };
  if (statusId === "stunned" && random() >= (status.procCap ?? 1)) return { target, applied: false, reason: "proc_cap" };
  const activeStatuses = { ...(target.activeStatuses || {}) };
  activeStatuses[statusId] = { turns: statusId === "stunned" || statusId === "frozen" ? 1 : 3, sourceStat };
  return { target: { ...target, activeStatuses }, applied: true, status };
}

function tickStatuses(target) {
  const activeStatuses = { ...(target.activeStatuses || {}) };
  const statusCooldowns = Object.fromEntries(Object.entries(target.statusCooldowns || {}).flatMap(([k, v]) => v > 1 ? [[k, v - 1]] : []));
  Object.entries(activeStatuses).forEach(([statusId, data]) => {
    const nextTurns = (data.turns || 1) - 1;
    if (nextTurns <= 0) {
      delete activeStatuses[statusId];
      const status = getStatusDef(statusId);
      if (statusId === "stunned" && status?.cooldownTurns) statusCooldowns.stunned = status.cooldownTurns;
    } else activeStatuses[statusId] = { ...data, turns: nextTurns };
  });
  return { ...target, activeStatuses, statusCooldowns };
}

export function applyTrivializationRule({ attackerStat = 1, defenderStat = 1, attackerLevel = 1, defenderLevel = 1, outgoingDamage = 1 }) {
  const statRatio = Math.max(attackerStat, 1) >= Math.max(defenderStat, 1) * 3;
  const reverseStatRatio = Math.max(defenderStat, 1) >= Math.max(attackerStat, 1) * 3;
  const levelRatio = Math.max(attackerLevel, 1) >= Math.max(defenderLevel, 1) * 3;
  const reverseLevelRatio = Math.max(defenderLevel, 1) >= Math.max(attackerLevel, 1) * 3;
  if (reverseStatRatio || reverseLevelRatio) return 1;
  if (statRatio || levelRatio) return Math.max(1, outgoingDamage);
  return outgoingDamage;
}

function runeElement(effect = "") {
  const match = String(effect).match(/^bonus_(fire|frost|lightning|nature|shadow|radiant|poison)_damage$/);
  return match?.[1] || null;
}

function runicSynergyBonus(character, element) {
  const known = (character.knownSpells || []).some((id) => SPELL_TABLE.find((spell) => spell.spellId === id && spell.element === element));
  const socketed = Object.values(character.equipped || {}).flatMap((item) => item?.runes || []).some((runeId) => runeElement(RUNE_TABLE.find((r) => r.runeId === runeId)?.effect) === element);
  return known && socketed ? (character.attributes?.arcane || 0) * 0.01 : 0;
}

const ITEM_VALUE_TABLE = {
  // consumables
  minor_healing: 8,
  healing: 18,
  major_healing: 40,
  ration: 4,
  elven_bread: 18,
  dwarven_rations: 8,
  northern_meat: 8,
  desert_flatbread: 8,
  honey_cake: 8,
  preserved_fish: 8,
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
      { key: "elven_bread", quantity: 2 },
      { key: "dwarven_rations", quantity: 2 },
      { key: "northern_meat", quantity: 2 },
      { key: "desert_flatbread", quantity: 2 },
      { key: "honey_cake", quantity: 2 },
      { key: "preserved_fish", quantity: 2 },
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
    formativeTraits: character.traits || null,
    formativeAnswers: character.formativeAnswers || null,
    startingRegion: character.startingRegion || null,
    regionalPassive: character.regionalPassive || null,
    level: character.level,
    condition: hpStatus,
    trainingStatus: character.fatigue < TRAINING_FATIGUE_COST ? "too fatigued to train" : "able to train",
    hasBankedSkillPoints: (character.bankedSkillPoints || 0) > 0,
    notableTraits, // for narrative color only — never cite the numbers behind these
    narrativeAbilities, // flavor-only unlocked traits — never a hard mechanical gate
    inventory: character.inventory.map((item) =>
      item.quantity > 1 ? `${item.name} (x${item.quantity})` : item.name
    ),
    equipped: {
      weapon: character.equipped?.weapon?.name || "nothing",
      armor: character.equipped?.armor?.name || "nothing",
    },
    activeQuests: quests.filter((q) => q.status === "active").map((q) => ({
      title: q.title,
      currentStage: currentQuestStage(q),
    })),
  };
}

export default function DMMemoryTest() {
  const [worldState, setWorldState] = useState(initialWorldState);
  const [character, setCharacter] = useState(initialCharacter);
  const [quests, setQuests] = useState([]);
  const [interactionType, setInteractionType] = useState("standard");
  const [combat, setCombat] = useState(null); // { enemyType, enemy: {name,hp,maxHp,attack,defense} }
  const [shop, setShop] = useState(null); // { npcId, merchantType }
  const [pendingPurchase, setPendingPurchase] = useState(null); // { reason, tier, amount }
  const [trainingOffer, setTrainingOffer] = useState(null); // { npcId, stat }
  const [pendingSkillCheck, setPendingSkillCheck] = useState(null); // { checkType, npcId? }
  // Monotonic ID counters — refs, not state, since incrementing them shouldn't itself
  // trigger a render. Code is the only thing that ever assigns an id; Claude only ever
  // receives and echoes them back (for npc/location ids) or never sees them at all (items).
  const nextNpcIdRef = useRef(1);
  const nextLocationIdRef = useRef(1); // disposable flavor locations use flavor_loc_N
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
  const [ledgerTab, setLedgerTab] = useState("character");
  const [needsIdentity, setNeedsIdentity] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [manualSaveExists, setManualSaveExists] = useState(false);
  const [manualSaveAt, setManualSaveAt] = useState(null);
  const [manualSaveStatus, setManualSaveStatus] = useState(null); // transient message, e.g. "Saved!" / "Loaded!"
  const [identityMode, setIdentityMode] = useState("new"); // "new" = fresh game, "migrate" = an existing save from before this system existed
  const [tutorialStep, setTutorialStep] = useState(0);
  const [combatActionTab, setCombatActionTab] = useState("physical");
  const scrollRef = useRef(null);
  const previousCombatRef = useRef(false);
  const { visible: revealedLog, revealing: feedRevealing } = useSequentialFeedReveal(log);
  const actionsDisabled = loading || feedRevealing;

  useEffect(() => {
    if (combat && !previousCombatRef.current) setCombatActionTab("physical");
    previousCombatRef.current = !!combat;
  }, [combat]);

  // Hunger and fatigue share one active-play clock. Fractional fatigue preserves the
  // exact 0.375 relative rate and remains saveable like every other character field.
  useEffect(() => {
    if (!saveChecked || needsIdentity || pauseOpen || character.isDead) return undefined;
    const timer = window.setInterval(() => {
      setCharacter((current) => {
        const immune = current.timedEffects?.hunger_immune?.expiresAt > Date.now();
        const fatigue = clamp(current.fatigue - 0.375, 0, current.maxFatigue);
        return { ...current, hunger: immune ? current.hunger : clamp(current.hunger - 1, 0, current.maxHunger), fatigue, forcedRest: current.forcedRest || fatigue === 0 };
      });
    }, RESOURCE_TICK_MS);
    return () => window.clearInterval(timer);
  }, [saveChecked, needsIdentity, pauseOpen, character.isDead]);

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
  }, [log, loading, revealedLog]);

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
      const savedLocationId = saved.worldState.locationId || "loc_1";
      const migratedLocations = cloneWorldMap(savedLocationId);
      Object.entries(saved.worldState.locations || {}).forEach(([id, value]) => {
        const savedLocation = typeof value === "string" ? { name: value, connections: [] } : { connections: [], ...value };
        const canonical = WORLD_MAP[id];
        migratedLocations[id] = canonical
          ? { ...migratedLocations[id], ...savedLocation, ...canonical, connections: [...new Set([...canonical.connections, ...(savedLocation.connections || [])])] }
          : { ...savedLocation, discovered: savedLocation.discovered ?? true, visited: savedLocation.visited ?? true };
      });
      revealArrival(migratedLocations, savedLocationId);
      const migratedNpcs = (saved.worldState.npcs || []).map((npc) => ({
        ...npc,
        isTrainer: !!npc.isTrainer,
        trainableStats: Array.isArray(npc.trainableStats) ? npc.trainableStats : [],
        taughtOut: npc.taughtOut || {},
      }));
      setWorldState({ day: 1, ...saved.worldState, locations: migratedLocations, npcs: migratedNpcs });
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
      const inferredStartingRegion = saved.character.startingRegion
        || WORLD_MAP[saved.worldState?.locationId]?.regionId
        || "heartlands";
      setCharacter({
        equipped: { weapon: null, armor: null },
        injuries: [],
        scars: [],
        isDead: false,
        death: null,
        bankedSkillPoints: saved.character.bankedSkillPoints ?? migratedPendingPoints,
        hunger: clamp(saved.character.hunger ?? 100, 0, 100),
        maxHunger: 100,
        fatigue: clamp(saved.character.fatigue ?? 100, 0, 100),
        maxFatigue: 100,
        timedEffects: saved.character.timedEffects || {},
        forcedRest: saved.character.forcedRest || false,
        startingRegion: inferredStartingRegion,
        regionalPassive: saved.character.regionalPassive || { ...REGIONS_TABLE[inferredStartingRegion].passiveAbility },
        ...restOfSavedCharacter,
        attributes: migratedAttributes,
        inventory: migratedInventory,
      });
    }
    if (saved.quests) setQuests(saved.quests);
    if (saved.log) {
      setLog(saved.log);
      const latestDmTurn = [...saved.log].reverse().find((entry) => entry.role === "dm");
      setInteractionType(INTERACTION_TYPES.has(latestDmTurn?.interactionType) ? latestDmTurn.interactionType : "standard");
    }
    if (saved.combat !== undefined) setCombat(saved.combat);
    setShop(null); // shop panels never persist — always resume back out in the world
    setPendingPurchase(null); // unresolved purchase prompts are transient, like shops
    setTrainingOffer(null);
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
    if (!saveChecked || needsIdentity) return;
    (async () => {
      try {
        const payload = buildSavePayload();
        const result = await window.storage.set(SAVE_KEY, payload, false);
        if (result) setLastSavedAt(new Date().toLocaleTimeString());
      } catch (e) {
        // Best-effort — a failed save write shouldn't interrupt gameplay.
      }
    })();
  }, [worldState, character, quests, log, combat, saveChecked, needsIdentity]);

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
    setInteractionType("standard");
    setCombat(null);
    setShop(null);
    setPendingPurchase(null);
    setLog(INITIAL_LOG);
    nextNpcIdRef.current = 1;
    nextLocationIdRef.current = 1;
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
      { id: `item_${nextItemIdRef.current++}`, name: weapon.name, consumableKind: null, equipmentKey: weapon.equipmentKey, rarity: "common", runeSlots: 0, runes: [], quantity: 1 },
      { id: `item_${nextItemIdRef.current++}`, name: "Rations", consumableKind: "ration", equipmentKey: null, rarity: "common", quantity: 3 },
    ];
    if (background?.startingItem) {
      const si = background.startingItem;
      const match = items.find((i) => i.name === si.name && i.consumableKind === (si.consumableKind || null) && i.equipmentKey === (si.equipmentKey || null));
      if (match) {
        match.quantity += 1;
      } else {
        items.push({ id: `item_${nextItemIdRef.current++}`, name: si.name, consumableKind: si.consumableKind || null, equipmentKey: si.equipmentKey || null, rarity: "common", runeSlots: 0, runes: [], quantity: 1 });
      }
    }
    return items;
  }

  function submitIdentity(identity) {
    const { traits, formativeAnswers, ...identityDetails } = identity;
    if (identityMode === "new") {
      const startingRegion = rollStartingRegion(identityDetails.race);
      const regionalPassive = { ...REGIONS_TABLE[startingRegion].passiveAbility };
      const identityWithRegion = { ...identityDetails, startingRegion, regionalPassive };
      const background = BACKGROUND_OPTIONS[identityDetails.background] || BACKGROUND_OPTIONS.farmer;
      const startingAttributes = { ...initialAttributes };
      const creationBonuses = combinedStatBonus(RACE_STAT_BONUS_TABLE[identityDetails.race], BACKGROUND_STAT_BONUS_TABLE[identityDetails.background] || background.bonus);
      Object.entries(creationBonuses).forEach(([key, amount]) => {
        startingAttributes[key] = Math.min(ATTRIBUTE_CAP, startingAttributes[key] + amount);
      });
      const startingGold = 10 + (background.startingGold || 0);
      const startingInventory = buildStartingInventory(identityDetails.weapon, identityDetails.background);
      const openingCharacter = { ...initialCharacter, attributes: startingAttributes, gold: startingGold, inventory: startingInventory, identity: identityWithRegion, traits, formativeAnswers, startingRegion, regionalPassive };
      const startingLocationId = REGIONS_TABLE[startingRegion].hubSettlement;
      const openingWorldState = { ...initialWorldState, day: 1, locationId: startingLocationId, locations: cloneWorldMap(startingLocationId) };
      setCharacter(openingCharacter);
      setWorldState(openingWorldState);
      setLog([craftFallbackOpeningNarration(identityWithRegion, startingRegion)]);
      setLoading(true);
      callModel(EXPLORATION_SYSTEM_PROMPT, buildOpeningTurnPrompt(identityWithRegion, startingRegion, openingWorldState), 1200, 1, null, (info) => pushDebugEntry("opening scene", info))
        .then((result) => {
          const narration = typeof result.narration === "string" ? result.narration : null;
          const suggestedActions = Array.isArray(result.suggestedActions) && result.suggestedActions.length
            ? result.suggestedActions.slice(0, 3)
            : null;
          if (narration) {
            const validatedType = validateInteractionType(result, [], openingWorldState.npcs);
            setInteractionType(validatedType);
            setLog([{ role: "dm", narration: paceNarration(narration, validatedType), suggestedActions: suggestedActions || FALLBACK_OPENING_ACTIONS[startingRegion] || FALLBACK_OPENING_ACTIONS.heartlands, interactionType: validatedType }]);
          }
        })
        .catch((e) => {
          setError(`Opening scene fell back to regional narration because Claude was unavailable: ${e.message}`);
        })
        .finally(() => setLoading(false));
    } else {
      setCharacter((c) => ({ ...c, identity: identityDetails, traits, formativeAnswers }));
      pushSystemLine(`✎ ${identityDetails.name} — the story continues.`);
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

  function pushSystemLine(content) {
    const segments = Array.isArray(content) ? content : textSegments(content);
    setLog((l) => [...l, { role: "system", segments }]);
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
        runeSlots: equipmentKey ? runeSlotsForRarity(safeRarity) : 0,
        runes: [],
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
    if (def.slot === "weapon" && !canUseWeaponAspect(character, def)) {
      const aspect = aspectForWeapon(def);
      pushSystemLine(`⚠ Cannot equip ${item.name}: requires ${ATTRIBUTE_DEFS[aspect.scalesWith].short} ${aspect.statRequired} to control its ${aspect.aspectId} aspect.`);
      return;
    }
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
        equipped: { ...c.equipped, [slot]: { id: invItem.id, name: invItem.name, equipmentKey: invItem.equipmentKey, rarity: invItem.rarity || "common", runeSlots: runeSlotsForRarity(invItem.rarity), runes: invItem.runes || [] } },
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
  function useConsumable(itemId) {
    const idx = character.inventory.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    const item = character.inventory[idx];
    const effect = CONSUMABLE_TABLE[item.consumableKind];
    if (!effect) return;

    const activeInjuries = (character.injuries || []).filter((injury) => !injury.cured);
    if (effect.curesInjury && activeInjuries.length === 0) {
      pushSystemLine(`You have no injury for ${item.name} to cure.`);
      return;
    }
    const maxHp = getEffectiveStats(character).maxHp;
    const scaledHeal = Math.round(effect.healAmount * RARITY_TIERS[rarityOf(item)].statMult);
    const healedAmount = Math.min(scaledHeal, maxHp - character.hp);
    const newHp = character.hp + healedAmount;
    const hungerGained = Math.min(effect.hungerRestore || 0, character.maxHunger - character.hunger);
    const nextInventory = [...character.inventory];
    if (item.quantity > 1) {
      nextInventory[idx] = { ...item, quantity: item.quantity - 1 };
    } else {
      nextInventory.splice(idx, 1);
    }

    setCharacter((c) => ({
      ...c,
      hp: newHp,
      hunger: effect.fullHunger ? c.maxHunger : clamp(c.hunger + (effect.hungerRestore || 0), 0, c.maxHunger),
      timedEffects: effect.buff ? { ...(c.timedEffects || {}), [effect.buff]: { attribute: effect.attribute, amount: effect.amount, expiresAt: Date.now() + effect.durationMinutes * 60 * 1000 } } : c.timedEffects,
      inventory: nextInventory,
      injuries: effect.curesInjury ? (c.injuries || []).filter((_, index) => index !== 0) : c.injuries,
    }));
    pushSystemLine(
      effect.hungerRestore
        ? `+ Ate ${item.name}: restored ${hungerGained} Hunger (${Math.min(character.maxHunger, character.hunger + effect.hungerRestore)}/${character.maxHunger})${effect.buff ? ` · ${effect.buff} active for ${effect.durationMinutes} minutes` : ""}`
        : effect.curesInjury
        ? `+ Used ${item.name}: your oldest injury has healed (the scar remains).`
        : healedAmount > 0
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

  function payPendingPurchase() {
    if (!pendingPurchase) return;
    const { amount, reason } = pendingPurchase;
    const actuallySpent = Math.min(amount, character.gold);
    setCharacter((c) => ({
      ...c,
      gold: c.gold - Math.min(amount, c.gold),
      injuries: pendingPurchase.healsInjury ? (c.injuries || []).filter((_, index) => index !== 0) : c.injuries,
    }));
    pushSystemLine(`- ${actuallySpent} gold for ${reason}`);
    if (pendingPurchase.healsInjury) pushSystemLine(`+ A healer tends your oldest injury; its scar remains.`);
    setPendingPurchase(null);
  }

  function declinePendingPurchase() {
    if (!pendingPurchase) return;
    pushSystemLine(`Declined to pay ${pendingPurchase.amount} gold for ${pendingPurchase.reason}.`);
    setPendingPurchase(null);
  }

  function processEvents(events) {
    let combatStartedThisTurn = combat;
    (events || []).forEach((event) => {
      if (event.type === "encounter" && !combatStartedThisTurn) {
        if (character.forcedRest || character.fatigue <= 0) {
          pushSystemLine(`You are exhausted and must rest before facing further danger.`);
          return;
        }
        const enemyDef = ENEMY_TABLE[event.enemyType] || ENEMY_TABLE.goblin;
        const severity = severityFor(enemyDef);
        setCombat({
          enemyType: event.enemyType,
          enemy: { name: enemyDef.name, hp: enemyDef.hp, maxHp: enemyDef.hp, attack: enemyDef.attack, defense: enemyDef.defense },
          npcId: event.npcId || null,
          severity,
          threatScore: threatScoreFor(enemyDef),
          secondWindUsed: false,
        });
        combatStartedThisTurn = true;
        setCharacter((current) => { const fatigue = clamp(current.fatigue - 2, 0, current.maxFatigue); return { ...current, hunger: clamp(current.hunger - 3, 0, current.maxHunger), fatigue, forcedRest: current.forcedRest || fatigue === 0 }; });
        pushSystemLine(`⚔ A ${enemyDef.name.toLowerCase()} attacks! (${severity.toUpperCase()} threat · HP ${enemyDef.hp}, ATK ${enemyDef.attack}, DEF ${enemyDef.defense})`);
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
        if (rarity === MATERIAL_TABLE.chorus_shard.dropTier && Math.random() < 0.35) {
          addItemToInventory(MATERIAL_TABLE.chorus_shard.label, null, null, "rare");
          pushSystemLine(`+ Material: ${MATERIAL_TABLE.chorus_shard.label}`);
        }
      } else if (event.type === "gold_found") {
        const amount = rollGoldForTier(event.tier);
        setCharacter((c) => ({ ...c, gold: c.gold + amount }));
        pushSystemLine(`+ ${amount} gold`);
      } else if (event.type === "gold_spent") {
        const amount = rollGoldForTier(event.tier);
        const reason = event.reason || "a purchase";
        const healsInjury = /heal(?:er|ing)?|treat|injur|physician/i.test(reason) && (character.injuries || []).length > 0;
        setPendingPurchase({ reason, tier: event.tier, amount, healsInjury });
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
            if (withXp.levelUps.length) pushSystemLine(`★ Level up! Now level ${withXp.level}. ${ATTRIBUTE_POINTS_PER_LEVEL} skill points banked for training.`);
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
          const updatedNpc = { ...npc, lastInteraction: event.interaction };
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
      } else if (event.type === "training_offer") {
        const trainer = worldState.npcs.find((n) => n.id === event.id);
        const stat = typeof event.stat === "string" ? event.stat.toLowerCase() : "";
        const lesson = trainer?.trainableStats?.find((entry) => entry.stat === stat);
        if (!trainer?.isTrainer || !lesson || (trainer.trust || 0) < (trainer.trustRequired || 0) || trainer.taughtOut?.[stat]) {
          pushSystemLine(`⚠ Invalid training offer was ignored.`);
        } else if (character.fatigue < TRAINING_FATIGUE_COST) {
          pushSystemLine(`You are too fatigued to train. Rest before taking another lesson.`);
        } else {
          setTrainingOffer({ npcId: trainer.id, stat });
        }
      } else if (event.type === "location_hint") {
        setWorldState((prev) => {
          const location = prev.locations[event.existingId];
          if (!location || !WORLD_MAP[event.existingId]) return prev;
          return {
            ...prev,
            locations: {
              ...prev.locations,
              [event.existingId]: { ...location, discovered: true, hintedName: WORLD_MAP[event.existingId].name },
            },
          };
        });
      } else if (event.type === "day_advance") {
        setWorldState((prev) => ({ ...prev, day: (prev.day || 1) + 1 }));
        const camping = /camp/i.test(event.reason || "");
        setCharacter((prev) => ({ ...prev, fatigue: camping ? clamp(prev.fatigue + 60, 0, prev.maxFatigue) : prev.maxFatigue, forcedRest: false, injuries: (prev.injuries || []).slice(1) }));
        setTrainingOffer(null);
        pushSystemLine(`☀ A new day begins${event.reason ? ` — ${event.reason}` : ""}. ${camping ? "Camping restores 60 Fatigue." : "Fatigue fully restored."}`);
        if ((character.injuries || []).length > 0) pushSystemLine(`+ A full rest heals your oldest injury; its scar remains.`);
      } else if (event.type === "skill_check_offer") {
        if (SKILL_CHECK_TYPES[event.checkType]) {
          const npcId = event.npcId && worldState.npcs.some((npc) => npc.id === event.npcId) ? event.npcId : null;
          setPendingSkillCheck({ checkType: event.checkType, npcId });
        }
      }
    });
  }

  function acceptTraining() {
    if (!trainingOffer) return;
    const trainer = worldState.npcs.find((npc) => npc.id === trainingOffer.npcId);
    const lesson = trainer?.trainableStats?.find((entry) => entry.stat === trainingOffer.stat);
    const current = character.attributes[trainingOffer.stat];
    const cost = trainingCostFor(current);
    let failure = null;
    if (!trainer?.isTrainer || !lesson || (trainer.trust || 0) < (trainer.trustRequired || 0)) failure = "This trainer is not willing or able to teach you.";
    else if (trainer.taughtOut?.[trainingOffer.stat] || current >= lesson.maxLevel) failure = `${trainer.name} has taught you all they know about ${ATTRIBUTE_DEFS[trainingOffer.stat].label}.`;
    else if ((character.bankedSkillPoints || 0) <= 0) failure = "You have no banked skill points to invest.";
    else if (character.fatigue < TRAINING_FATIGUE_COST) failure = "You are too fatigued to train.";
    else if (character.gold < cost) failure = `You need ${cost} gold for this lesson.`;
    if (failure) {
      pushSystemLine(failure);
      setTrainingOffer(null);
      return;
    }

    const nextScore = current + 1;
    setCharacter((prev) => ({
      ...prev,
      gold: prev.gold - cost,
      bankedSkillPoints: prev.bankedSkillPoints - 1,
      hunger: clamp(prev.hunger - 1, 0, prev.maxHunger),
      fatigue: clamp(prev.fatigue - TRAINING_FATIGUE_COST, 0, prev.maxFatigue),
      forcedRest: prev.fatigue - TRAINING_FATIGUE_COST <= 0,
      attributes: { ...prev.attributes, [trainingOffer.stat]: nextScore },
    }));
    if (nextScore >= lesson.maxLevel) {
      setWorldState((prev) => ({
        ...prev,
        npcs: prev.npcs.map((npc) => npc.id !== trainer.id ? npc : {
          ...npc,
          taughtOut: { ...(npc.taughtOut || {}), [trainingOffer.stat]: true },
          memory: `${npc.memory || ""} ${npc.name} has taught Caden all they know about ${ATTRIBUTE_DEFS[trainingOffer.stat].label}.`.trim(),
        }),
      }));
    }
    setInteractionType("standard");
    setLog((prev) => [...prev, { role: "dm", narration: `${trainer.name} puts you through a focused lesson in ${ATTRIBUTE_DEFS[trainingOffer.stat].label.toLowerCase()}. The drills are punishing, but by the end your hard-won improvement is unmistakable.`, suggestedActions: null, interactionType: "standard" }]);
    pushSystemLine(`↑ ${ATTRIBUTE_DEFS[trainingOffer.stat].short} ${current} → ${nextScore} · -${cost} gold · -1 Hunger · -4 Fatigue`);
    setTrainingOffer(null);
  }

  async function submitAction(action) {
    if (!action.trim() || loading || combat || shop || pendingPurchase || trainingOffer) return;
    if ((character.forcedRest || character.fatigue <= 0) && !/\b(rest|sleep|camp|inn)\b/i.test(action)) {
      pushSystemLine(`You are exhausted. A forced rest is required before you can take further risky actions.`);
      return;
    }
    setLoading(true);
    setError(null);
    setLog((l) => [...l, { role: "player", text: action }]);
    setInput("");

    const offeredCheck = pendingSkillCheck;
    const odds = offeredCheck ? skillCheckOdds(offeredCheck, worldState, character) : null;
    const skillCheckFacts = odds ? {
      passed: Math.random() * 100 < odds.chance,
      checkType: offeredCheck.checkType,
      difficultyTier: odds.difficultyTier,
      ...(offeredCheck.npcId ? { npcId: offeredCheck.npcId } : {}),
    } : null;
    const userMessage = `WORLD STATE:\n${JSON.stringify(worldState, null, 2)}\n\nCHARACTER SUMMARY (for narrative color only — do not cite numbers):\n${JSON.stringify(
      characterSummaryForPrompt(character, quests),
      null,
      2
    )}${skillCheckFacts ? `\n\nSKILL CHECK FACTS (authoritative code-owned result; the player's prose is flavor only):\n${JSON.stringify(skillCheckFacts, null, 2)}` : ""}\n\nPLAYER ACTION: ${action}`;

    try {
      const result = await callModel(EXPLORATION_SYSTEM_PROMPT, userMessage, 1200, 1, null, (info) => pushDebugEntry(action, info));
      // Defensive defaults: Claude's JSON can be syntactically valid but structurally
      // incomplete (e.g. missing stateUpdates entirely). Falling back to safe empty
      // values here means a partially-shaped response degrades gracefully — the turn
      // still narrates, it just doesn't update anything it didn't mention — instead of
      // throwing on the next line down (e.g. stateUpdates.reputationDelta of undefined).
      const rawNarration = typeof result.narration === "string" ? result.narration : "(the DM's response was missing narration text)";
      const stateUpdates = result.stateUpdates && typeof result.stateUpdates === "object" ? result.stateUpdates : {};
      const events = Array.isArray(result.events) ? result.events : [];
      const suggestedActions = Array.isArray(result.suggestedActions) ? result.suggestedActions : [];
      const validatedInteractionType = validateInteractionType(result, quests, worldState.npcs);
      const narration = paceNarration(rawNarration, validatedInteractionType);
      setInteractionType(validatedInteractionType);

      setWorldState((prev) => {
        const next = {
          day: prev.day || 1,
          locationId: prev.locationId,
          locations: Object.fromEntries(Object.entries(prev.locations).map(([id, location]) => [id, { ...location, connections: [...(location.connections || [])] }])),
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
            if (next.locations[locUpdate.existingId].discovered || locUpdate.existingId === prevLocationId) {
              next.locationId = locUpdate.existingId;
            } else {
              pushSystemLine(`⚠ You don't know a route to that location yet.`);
            }
          } else {
            pushSystemLine(`⚠ location referenced existingId "${locUpdate.existingId}" which isn't registered — ignored, location unchanged.`);
          }
        } else if (locUpdate && locUpdate.newDisplayName) {
          const newId = `flavor_loc_${nextLocationIdRef.current++}`;
          next.locations[newId] = { id: newId, name: locUpdate.newDisplayName, regionId: next.locations[prevLocationId]?.regionId || null, type: "scene", dangerTier: "common", connections: [], discovered: true, visited: true };
          next.locationId = newId;
        }
        // Whenever the location actually changed this turn, the old and new place are
        // now a known route between each other — link them regardless of whether this
        // was a brand-new discovery or a return to somewhere already known. This is how
        // the map graph builds itself purely from what actually happened in play.
        if (next.locationId !== prevLocationId) {
          linkLocations(next.locations, prevLocationId, next.locationId);
          revealArrival(next.locations, next.locationId);
          if (WORLD_MAP[next.locationId]) {
            const destination = next.locations[next.locationId];
            const days = next.locations[prevLocationId]?.regionId === destination.regionId ? 1 : 3;
            next.day += days;
            setCharacter((current) => { const fatigue = clamp(current.fatigue - 3, 0, current.maxFatigue); return { ...current, hunger: clamp(current.hunger - 2, 0, current.maxHunger), fatigue, forcedRest: current.forcedRest || fatigue === 0 }; });
            setTrainingOffer(null);
            pushSystemLine(days === 1
              ? `→ A day passes reaching ${destination.name}.`
              : `→ Three days pass on the road to ${destination.name}.`);
          }
        }

        (stateUpdates.newNPCs || []).forEach((npc) => {
          const validTraits = Array.isArray(npc.traits) ? npc.traits.filter((t) => NPC_TRAITS.includes(t)) : [];
          const existingByName = next.npcs.findIndex((n) => n.name === npc.name);
          if (existingByName >= 0) {
            const trainerStats = validTrainableStats(npc.trainableStats);
            next.npcs[existingByName] = {
              ...next.npcs[existingByName],
              memory: npc.memory,
              ...(validTraits.length ? { traits: validTraits } : {}),
              ...(npc.goal ? { goal: npc.goal } : {}),
              ...(npc.secret ? { secret: npc.secret } : {}),
              ...(typeof npc.isTrainer === "boolean" ? { isTrainer: npc.isTrainer } : {}),
              trainerSubtype: npc.trainerSubtype === "deepsinger" ? "deepsinger" : (next.npcs[existingByName].trainerSubtype || "standard"),
              ...(trainerStats.length ? { trainableStats: trainerStats } : {}),
              ...(Number.isFinite(Number(npc.trustRequired)) ? { trustRequired: Math.floor(Number(npc.trustRequired)) } : {}),
            };
          } else {
            const newId = `npc_${nextNpcIdRef.current++}`;
            next.npcs.push({
              id: newId,
              name: npc.name,
              memory: npc.memory,
              trust: 0,
              respect: 0,
              fear: 0,
              traits: validTraits,
              goal: npc.goal || null,
              secret: npc.secret || null,
              personalFear: null,
              isTrainer: !!npc.isTrainer,
              trainerSubtype: npc.trainerSubtype === "deepsinger" ? "deepsinger" : "standard",
              trainableStats: validTrainableStats(npc.trainableStats),
              trustRequired: Number.isFinite(Number(npc.trustRequired)) ? Math.floor(Number(npc.trustRequired)) : 0,
              taughtOut: {},
            });
          }
        });

        (stateUpdates.npcUpdates || []).forEach((update) => {
          const idx = next.npcs.findIndex((n) => n.id === update.id);
          if (idx === -1) {
            pushSystemLine(`⚠ npcUpdates referenced id "${update.id}" which doesn't exist — skipped.`);
            return;
          }
          const validTraits = Array.isArray(update.traits) ? update.traits.filter((t) => NPC_TRAITS.includes(t)) : null;
          const trainerStats = validTrainableStats(update.trainableStats);
          next.npcs[idx] = {
            ...next.npcs[idx],
            ...(update.name ? { name: update.name } : {}),
            ...(update.memory ? { memory: update.memory } : {}),
            ...(validTraits && validTraits.length ? { traits: validTraits } : {}),
            ...(update.goal ? { goal: update.goal } : {}),
            ...(update.secret ? { secret: update.secret } : {}),
            ...(typeof update.isTrainer === "boolean" ? { isTrainer: update.isTrainer } : {}),
            ...(update.trainerSubtype === "deepsinger" ? { trainerSubtype: "deepsinger" } : {}),
            ...(trainerStats.length ? { trainableStats: trainerStats } : {}),
            ...(Number.isFinite(Number(update.trustRequired)) ? { trustRequired: Math.floor(Number(update.trustRequired)) } : {}),
          };
        });

        return next;
      });

      if (offeredCheck) {
        setPendingSkillCheck(null);
        pushSystemLine(rollSegments(`${odds.check.label} check (${odds.chance}% · ${odds.difficultyTier.toUpperCase()}): `, odds.chance, skillCheckFacts.passed));
      }
      setLog((l) => [...l, { role: "dm", narration, suggestedActions, interactionType: validatedInteractionType }]);
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

    let enemy = tickStatuses({ ...combat.enemy });
    let nextCharacter = { ...character };
    const facts = { action: actionType };
    // Always fight with gear-adjusted stats, never the raw base numbers — this is the
    // only place attack/defense bonuses from equipped items take effect.
    const effStats = getEffectiveStats(nextCharacter);
    const playerHitChance = hitChanceFor(effStats.accuracy, 0);
    const enemyBaseHitChance = clamp(hitChanceFor(70, effStats.dodgeChance * 1.2), 10, 90);

    if (actionType === "flee") {
      const escaped = Math.random() < effStats.fleeChance;
      facts.fled = escaped;
      facts.fleeChance = effStats.fleeChance * 100;
      if (!escaped) {
        const { dmg, dodged, missed } = rollIncomingHit(enemy.attack, effStats.def, effStats.dodgeChance, enemyBaseHitChance);
        nextCharacter.hp = Math.max(0, nextCharacter.hp - dmg);
        facts.enemyDamageDealt = dmg;
        facts.playerDodged = dodged;
        facts.enemyMissed = missed;
        facts.enemyHitChance = enemyBaseHitChance;
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
      const { dmg, dodged, missed } = rollIncomingHit(enemy.attack, effStats.def, effStats.dodgeChance, enemyBaseHitChance);
      nextCharacter.hp = Math.max(0, nextCharacter.hp - dmg);
      facts.enemyDamageDealt = dmg;
      facts.playerDodged = dodged;
      facts.enemyMissed = missed;
      facts.enemyHitChance = enemyBaseHitChance;
      facts.playerHpRemaining = nextCharacter.hp;
    } else {
      const incomingDefenseBonus = actionType === "defend" ? Math.floor(effStats.def / 2) + 3 : 0;
      // Power Strike trades defense for damage: a bigger hit now, but a weaker guard on
      // the counter that follows if the enemy is still standing.
      const isPowerStrike = actionType === "power_strike" && effStats.hasPowerStrike;
      if (actionType === "attack" || isPowerStrike) {
        const atk = isPowerStrike ? Math.round(effStats.atk * 1.6) : effStats.atk;
        const attackHitChance = isPowerStrike ? Math.max(15, playerHitChance - 20) : playerHitChance;
        const { dmg, crit, missed } = rollOutgoingHit(atk, enemy.defense, effStats.critChance, attackHitChance, effStats.critMultiplier);
        const relevantStat = isPowerStrike ? nextCharacter.attributes.str : Math.max(nextCharacter.attributes.str || 1, nextCharacter.attributes.arcane || 1);
        const finalDmg = applyTrivializationRule({ attackerStat: relevantStat, defenderStat: enemy.defense || 1, attackerLevel: nextCharacter.level, defenderLevel: combat.severity === "mythic" ? 5 : combat.severity === "legendary" ? 4 : combat.severity === "epic" ? 3 : combat.severity === "rare" ? 2 : 1, outgoingDamage: dmg });
        enemy.hp = Math.max(0, enemy.hp - finalDmg);
        facts.playerDamageDealt = finalDmg;
        facts.playerCrit = crit;
        facts.playerMissed = missed;
        facts.playerHitChance = attackHitChance;
        facts.critChance = effStats.critChance;
        facts.powerStrike = isPowerStrike;
        const weaponDef = nextCharacter.equipped?.weapon ? EQUIPMENT_TABLE[nextCharacter.equipped.weapon.equipmentKey] : null;
        const aspect = aspectForWeapon(weaponDef);
        if (!missed && aspect?.appliesStatus && canUseWeaponAspect(nextCharacter, weaponDef)) {
          const statusAttempt = attemptApplyStatus(enemy, aspect.appliesStatus, nextCharacter.attributes[aspect.scalesWith] || 10);
          enemy = statusAttempt.target;
          facts.aspectStatus = { aspect: aspect.aspectId, status: aspect.appliesStatus, applied: statusAttempt.applied, reason: statusAttempt.reason || null };
          facts.aspectProcChance = (getStatusDef(aspect.appliesStatus)?.procCap ?? 1) * 100;
        }
        facts.enemyHpRemaining = enemy.hp;
      }
      facts.enemyDefeated = enemy.hp <= 0;
      // Intimidating Presence: only ever checked after the player's own attack actually
      // lands and doesn't finish the enemy off — a weaker foe may just break and run.
      if (!facts.enemyDefeated && !facts.playerMissed && (actionType === "attack" || isPowerStrike) && effStats.hasIntimidatingPresence) {
        facts.enemyFled = Math.random() < 0.2;
        facts.intimidateChance = 20;
      }
      if (!facts.enemyDefeated && !facts.enemyFled) {
        const openDefense = isPowerStrike ? Math.floor(effStats.def / 2) : effStats.def + incomingDefenseBonus;
        const enemyHitChance = actionType === "defend" ? hitChanceFor(enemyBaseHitChance, 15) : enemyBaseHitChance;
        const { dmg, dodged, missed } = rollIncomingHit(enemy.attack, openDefense, effStats.dodgeChance, enemyHitChance);
        const finalEnemyDmg = applyTrivializationRule({ attackerStat: enemy.attack || 1, defenderStat: nextCharacter.attributes.con || 1, attackerLevel: combat.severity === "mythic" ? 5 : combat.severity === "legendary" ? 4 : combat.severity === "epic" ? 3 : combat.severity === "rare" ? 2 : 1, defenderLevel: nextCharacter.level, outgoingDamage: dmg });
        nextCharacter.hp = Math.max(0, nextCharacter.hp - finalEnemyDmg);
        facts.enemyDamageDealt = finalEnemyDmg;
        facts.playerDodged = dodged;
        facts.enemyMissed = missed;
        facts.enemyHitChance = enemyHitChance;
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
      const enemyDef = ENEMY_TABLE[combat.enemyType] || ENEMY_TABLE.goblin;
      const severity = combat.severity || severityFor(enemyDef);
      const linkedNpc = combat.npcId ? worldState.npcs.find((npc) => npc.id === combat.npcId) : null;
      const playerPower = effStats.atk + effStats.def * 2 + nextCharacter.level * 3;
      const deathRisk = deathChanceForLoss(severity, playerPower, linkedNpc);
      const died = Math.random() < deathRisk.chance;
      facts.severity = severity;
      facts.deathChance = deathRisk.chance;
      facts.powerRatio = deathRisk.powerRatio;
      facts.playerDied = died;
      facts.deathRollChance = deathRisk.chance * 100;

      if (died) {
        nextCharacter.hp = 0;
        nextCharacter.isDead = true;
        nextCharacter.death = { enemyName: enemyDef.name, severity };
      } else {
        nextCharacter.hp = 1;
        if (severity === "common" || severity === "uncommon") {
          const goldLost = Math.min(nextCharacter.gold, rollGoldForTier("small"));
          nextCharacter.gold -= goldLost;
          facts.goldLost = goldLost;
        } else {
          const areas = Object.keys(INJURY_TABLE);
          const area = areas[Math.floor(Math.random() * areas.length)];
          const injury = INJURY_TABLE[area];
          nextCharacter.injuries = [...(nextCharacter.injuries || []), { area, statKey: injury.statKey, amount: injury.amount, cured: false }];
          nextCharacter.scars = [...(nextCharacter.scars || []), { area, description: injury.description }];
          facts.injuryArea = area;
        }
      }
    }

    setCharacter(nextCharacter);

    const combatEnded = facts.enemyDefeated || facts.playerDefeated || facts.fled === true || facts.enemyFled === true;
    setCombat(combatEnded ? null : { ...combat, enemy, secondWindUsed: combat.secondWindUsed || actionType === "second_wind" });

    const rollLines = [];
    if (typeof facts.fleeChance === "number") rollLines.push(rollSegments(`Flee attempt (${facts.fleeChance.toFixed(0)}%): `, facts.fleeChance, facts.fled));
    if (typeof facts.playerHitChance === "number") {
      rollLines.push(rollSegments(`Attack accuracy (${facts.playerHitChance.toFixed(0)}%): `, facts.playerHitChance, !facts.playerMissed));
      if (!facts.playerMissed) rollLines.push(rollSegments(`Critical strike (${facts.critChance.toFixed(0)}%): `, facts.critChance, facts.playerCrit));
    }
    if (typeof facts.aspectProcChance === "number" && facts.aspectProcChance < 100) rollLines.push(rollSegments(`${facts.aspectStatus.status} proc (${facts.aspectProcChance.toFixed(0)}%): `, facts.aspectProcChance, facts.aspectStatus.applied));
    if (typeof facts.intimidateChance === "number") rollLines.push(rollSegments(`Intimidating Presence (${facts.intimidateChance}%): `, facts.intimidateChance, facts.enemyFled));
    if (typeof facts.enemyHitChance === "number") {
      rollLines.push(rollSegments(`Enemy accuracy (${facts.enemyHitChance.toFixed(0)}%): `, facts.enemyHitChance, !facts.enemyMissed));
      if (!facts.enemyMissed) rollLines.push(rollSegments(`Dodge (${effStats.dodgeChance.toFixed(0)}%): `, effStats.dodgeChance, facts.playerDodged));
    }
    if (typeof facts.deathRollChance === "number") rollLines.push(rollSegments(`Mortal peril (${facts.deathRollChance.toFixed(0)}%): `, facts.deathRollChance, facts.playerDied));
    if (rollLines.length) setLog((current) => [...current, ...rollLines.map((segments) => ({ role: "system", segments }))]);
    // Display metadata never enters the narrator request; its payload remains the same
    // already-resolved mechanical facts it received before this presentation overhaul.
    const {
      fleeChance: _fleeChance, enemyHitChance: _enemyHitChance,
      playerHitChance: _playerHitChance, critChance: _critChance,
      aspectProcChance: _aspectProcChance, intimidateChance: _intimidateChance,
      deathRollChance: _deathRollChance, ...narrationFacts
    } = facts;

    try {
      const result = await callModel(COMBAT_NARRATION_SYSTEM_PROMPT, JSON.stringify(narrationFacts, null, 2), 400, 1, null, (info) => pushDebugEntry(`combat:${actionType}`, info));
      setInteractionType("standard");
      setLog((l) => [...l, { role: "dm", narration: result.narration, suggestedActions: combatEnded ? ["Look around", "Check inventory", "Continue on"] : null, interactionType: "standard" }]);
      if (facts.enemyDefeated) pushSystemLine(`✓ Enemy defeated (+${facts.xpGained} XP, +${facts.goldGained} gold)${nextCharacter.levelUps?.length ? ` — Level up! Now level ${nextCharacter.level}; ${ATTRIBUTE_POINTS_PER_LEVEL} skill points banked.` : ""}`);
      if (facts.playerDefeated && facts.playerDied) pushSystemLine(`✝ ${combat.enemy.name} has ended your story.`);
      else if (facts.playerDefeated && facts.injuryArea) pushSystemLine(`✝ You survive at 1 HP with a ${facts.injuryArea} injury and a permanent scar.`);
      else if (facts.playerDefeated) pushSystemLine(`✝ You wake at 1 HP, missing ${facts.goldLost || 0} gold.`);
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

  if (character.isDead) {
    const death = character.death || { enemyName: "an unknown foe", severity: "unknown" };
    return (
      <>
        {FONT_IMPORTS}
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "radial-gradient(ellipse at center, #2B1115 0%, #14110D 68%)", color: INK, fontFamily: BODY_FONT }}>
          <div style={{ width: "min(520px, 100%)", padding: "38px", textAlign: "center", border: `2px solid ${BLOOD}`, background: "linear-gradient(180deg, #241719 0%, #171210 100%)", boxShadow: "0 18px 60px rgba(0,0,0,.55)" }}>
            <RavenGlyph size={34} color={WOUND} style={{ margin: "0 auto 14px" }} />
            <h1 style={{ margin: 0, color: WOUND, fontFamily: DISPLAY_FONT, fontSize: "34px", letterSpacing: ".08em", textTransform: "uppercase" }}>You have died</h1>
            <p style={{ color: SLATE, fontSize: "16px", lineHeight: 1.7, margin: "18px 0 26px" }}>
              {character.identity?.name || "Your adventurer"} fell to {death.enemyName} — a <span style={{ color: AMBER }}>{death.severity}</span> threat. The chronicle ends here.
            </p>
            <button onClick={startNewGame} style={{ border: `1px solid ${AMBER}`, background: "linear-gradient(180deg, #5B3B18 0%, #33200F 100%)", color: INK, padding: "11px 22px", fontFamily: DISPLAY_FONT, fontSize: "13px", letterSpacing: ".06em", textTransform: "uppercase", cursor: "pointer" }}>
              Start a new game
            </button>
          </div>
        </div>
      </>
    );
  }

  const characterEffStats = getEffectiveStats(character);
  const combatPlayerHitChance = hitChanceFor(characterEffStats.accuracy, 0);
  const combatEnemyHitChance = clamp(hitChanceFor(70, characterEffStats.dodgeChance * 1.2), 10, 90);
  const combatActionLabels = {
    attack: `Attack (${combatPlayerHitChance.toFixed(0)}%)`,
    defend: `Defend (avoid dmg: ${hitChanceFor(100, combatEnemyHitChance - 15).toFixed(0)}%)`,
    flee: `Flee (${(characterEffStats.fleeChance * 100).toFixed(0)}%)`,
  };
  const shopNpc = shop ? worldState.npcs.find((n) => n.id === shop.npcId) : null;
  const trainingNpc = trainingOffer ? worldState.npcs.find((n) => n.id === trainingOffer.npcId) : null;

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
          onTravel={(id, label) => { setMapOpen(false); submitAction(`Travel to ${label} [destination existingId: ${id}]`); }}
          canTravel={!loading && !combat && !shop && !pendingPurchase}
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
          <div style={{ position: "relative", height: "150px", marginBottom: "22px", overflow: "hidden", border: "1px solid #33291D", borderRadius: "3px" }}>
            <PixelSprite
              src={locationSpriteFor(worldState.locations[worldState.locationId]?.name)}
              alt={worldState.locations[worldState.locationId]?.name || "Current location"}
              size={undefined}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: "auto 0 0", padding: "18px 14px 10px", background: "linear-gradient(transparent, rgba(10,8,6,0.95))", color: AMBER, fontFamily: DISPLAY_FONT, fontSize: "12px", letterSpacing: "0.06em" }}>
              {worldState.locations[worldState.locationId]?.name}
            </div>
          </div>
          {log.map((entry, i) => {
            const revealed = revealedLog[i];
            if (entry.role === "player") {
              return (
                <div key={i} style={{ margin: "20px 0", paddingLeft: "16px", borderLeft: `3px solid ${AMBER}`, color: AMBER, fontFamily: DISPLAY_FONT, fontSize: "13.5px", letterSpacing: "0.03em" }}>
                  <RevealedLine line={revealed} />
                </div>
              );
            }
            if (entry.role === "system") {
              return (
                <div key={i} style={{ margin: "6px 0", color: CODE_VOICE, fontFamily: "ui-monospace, monospace", fontSize: "13px" }}>
                  <RevealedLine line={revealed} />
                </div>
              );
            }
            return (
              <div key={i} style={{ margin: "22px 0", paddingLeft: "16px", borderLeft: "1px solid #2E2820" }}>
                <p style={{ lineHeight: 1.75, fontSize: "17px", margin: 0, whiteSpace: "pre-wrap" }}>
                  <RevealedLine line={revealed} />
                </p>
                {entry.suggestedActions && (
                  <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {entry.suggestedActions.map((a, j) => (
                      <button key={j} onClick={() => submitAction(a)} disabled={actionsDisabled || !!combat || !!shop || !!pendingPurchase || !!trainingOffer} style={{ background: "linear-gradient(180deg, #241D15 0%, #1A150F 100%)", border: "1px solid #4A3F2C", color: INK, padding: "7px 14px", fontFamily: DISPLAY_FONT, fontSize: "11.5px", letterSpacing: "0.03em", cursor: actionsDisabled || combat || shop || pendingPurchase || trainingOffer ? "default" : "pointer", opacity: actionsDisabled || combat || shop || pendingPurchase || trainingOffer ? 0.5 : 1, borderRadius: "2px" }}>
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
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "8px" }}>
                <PixelSprite src={ENEMY_SPRITES[combat.enemyType] || ENEMY_SPRITES.goblin} alt={`${combat.enemy.name} sprite`} size={76} style={{ background: "#120d0b", border: "1px solid #4a2828" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: DISPLAY_FONT, fontSize: "13px", letterSpacing: "0.05em", color: AMBER, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <RavenGlyph size={12} color={BLOOD} /> {combat.enemy.name} — {combat.enemy.hp}/{combat.enemy.maxHp} HP
                  </div>
                  <StatBar value={combat.enemy.hp} max={combat.enemy.maxHp} color={BLOOD} height={7} />
                </div>
              </div>
              <div role="tablist" aria-label="Combat action categories" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px", margin: "14px 0 10px" }}>
                {["physical", "magic", "tactics"].map((tab) => <button key={tab} role="tab" aria-selected={combatActionTab === tab} onClick={() => setCombatActionTab(tab)} style={{ padding: "8px", cursor: "pointer", fontFamily: DISPLAY_FONT, letterSpacing: ".08em", textTransform: "uppercase", fontSize: "10.5px", color: combatActionTab === tab ? AMBER : SLATE, background: combatActionTab === tab ? "linear-gradient(180deg, #2A2116, #17130F)" : "#100D0A", border: `1px solid ${combatActionTab === tab ? AMBER : DIM}`, boxShadow: combatActionTab === tab ? "inset 0 0 0 1px #33291D" : "none" }}>{tab}</button>)}
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {combatActionTab === "physical" && [
                  { id: "attack", label: combatActionLabels.attack },
                  ...(characterEffStats.hasPowerStrike ? [{ id: "power_strike", label: `Power Strike (${Math.max(15, combatPlayerHitChance - 20).toFixed(0)}%)` }] : []),
                ].map((action) => <button key={action.id} onClick={() => handleCombatAction(action.id)} disabled={actionsDisabled} style={{ background: `linear-gradient(180deg, ${BLOOD} 0%, #4A1620 100%)`, border: `1px solid ${BLOOD}`, color: INK, padding: "9px 18px", fontFamily: DISPLAY_FONT, fontSize: "12.5px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: actionsDisabled ? "default" : "pointer", opacity: actionsDisabled ? 0.5 : 1, borderRadius: "2px" }}>{action.label}</button>)}
                {combatActionTab === "magic" && <span style={{ color: DIM, fontStyle: "italic" }}>No mana abilities available.</span>}
                {combatActionTab === "tactics" && [
                  { id: "defend", label: combatActionLabels.defend }, { id: "flee", label: combatActionLabels.flee },
                  ...(characterEffStats.hasSecondWind && !combat.secondWindUsed ? [{ id: "second_wind", label: "Second Wind" }] : []),
                ].map((action) => <button key={action.id} onClick={() => handleCombatAction(action.id)} disabled={actionsDisabled} style={{ background: "linear-gradient(180deg, #241D15 0%, #1A150F 100%)", border: "1px solid #4A3F2C", color: INK, padding: "9px 18px", fontFamily: DISPLAY_FONT, fontSize: "12.5px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: actionsDisabled ? "default" : "pointer", opacity: actionsDisabled ? 0.5 : 1, borderRadius: "2px" }}>{action.label}</button>)}
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
              loading={actionsDisabled}
            />
          )}

          {pendingPurchase && (
            <PurchaseConfirmPanel
              purchase={pendingPurchase}
              character={character}
              onPay={payPendingPurchase}
              onDecline={declinePendingPurchase}
              loading={actionsDisabled}
            />
          )}

          {trainingOffer && trainingNpc && (
            <TrainingPanel
              trainer={trainingNpc}
              stat={trainingOffer.stat}
              character={character}
              onAccept={acceptTraining}
              onDecline={() => setTrainingOffer(null)}
              disabled={actionsDisabled}
            />
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

        {pendingSkillCheck && (() => {
          const odds = skillCheckOdds(pendingSkillCheck, worldState, character);
          return odds && <div style={{ borderTop: "1px solid #33291D", padding: "10px 16px 0", color: CODE_VOICE, fontFamily: DISPLAY_FONT, fontSize: "12px", letterSpacing: "0.04em" }}>
            {odds.check.label} check — {odds.chance}% likely to land <span style={{ color: DIM }}>· {odds.difficultyTier} difficulty</span>
          </div>;
        })()}
        {(interactionType === "quest_decision" || interactionType === "climactic_dialogue") && <form onSubmit={(e) => { e.preventDefault(); submitAction(input); }} style={{ display: "flex", borderTop: pendingSkillCheck ? "none" : "1px solid #33291D", padding: "12px 16px", gap: "10px" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={combat ? "Resolve combat above first..." : shop ? "Finish trading above first..." : pendingPurchase ? "Answer the purchase prompt above first..." : trainingOffer ? "Answer the training offer above first..." : "What do you do?"} disabled={actionsDisabled || !!combat || !!shop || !!pendingPurchase || !!trainingOffer} style={{ flex: 1, background: "#1A1611", border: "1px solid #33291D", color: INK, padding: "10px 12px", fontFamily: BODY_FONT, fontSize: "15px", outline: "none", opacity: combat || shop || pendingPurchase || trainingOffer ? 0.4 : 1, borderRadius: "2px" }} />
          <button type="submit" disabled={actionsDisabled || !!combat || !!shop || !!pendingPurchase || !!trainingOffer} style={{ background: `linear-gradient(180deg, ${BLOOD} 0%, #4A1620 100%)`, border: `1px solid ${BLOOD}`, color: INK, padding: "10px 20px", fontFamily: DISPLAY_FONT, fontSize: "12.5px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: actionsDisabled || combat || shop || pendingPurchase || trainingOffer ? "default" : "pointer", opacity: actionsDisabled || combat || shop || pendingPurchase || trainingOffer ? 0.5 : 1, borderRadius: "2px" }}>
            Act
          </button>
        </form>}
      </div>

      <div style={{ flex: "1 1 40%", overflowY: "auto", padding: "20px 22px", fontFamily: "ui-monospace, monospace", fontSize: "12.5px", background: "linear-gradient(180deg, #17130F 0%, #120F0B 100%)" }}>
        <div style={{ fontSize: "12px", letterSpacing: "0.14em", textTransform: "uppercase", color: AMBER, marginBottom: "18px", paddingBottom: "12px", borderBottom: `2px solid #33291D`, boxShadow: `0 1px 0 rgba(200,155,74,0.25)`, fontFamily: DISPLAY_FONT, display: "flex", alignItems: "center", gap: "8px" }}>
          <RavenGlyph size={14} /> Character Ledger <span style={{ color: DIM, textTransform: "none", letterSpacing: 0, fontFamily: "ui-monospace, monospace", fontSize: "10px" }}>(code-owned)</span>
        </div>

        <div role="tablist" aria-label="Character Ledger sections" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "20px" }}>
          {[['character', 'Character'], ['world', 'World']].map(([tab, label]) => (
            <button key={tab} role="tab" aria-selected={ledgerTab === tab} onClick={() => setLedgerTab(tab)} style={{ padding: "8px", cursor: "pointer", fontFamily: DISPLAY_FONT, letterSpacing: ".08em", textTransform: "uppercase", fontSize: "10.5px", color: ledgerTab === tab ? AMBER : SLATE, background: ledgerTab === tab ? "linear-gradient(180deg, #2A2116, #17130F)" : "#100D0A", border: `1px solid ${ledgerTab === tab ? AMBER : DIM}`, boxShadow: ledgerTab === tab ? "inset 0 0 0 1px #33291D" : "none" }}>
              {label}
            </button>
          ))}
        </div>

        {ledgerTab === "character" ? <>

        {character.identity && (
          <LedgerSection title="Identity">
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <PixelSprite src={RACE_SPRITES[character.identity.race] || RACE_SPRITES.human} alt={`${character.identity.race} character sprite`} size={64} style={{ background: "#0e0c09", border: "1px solid #33291D" }} />
              <div>
                <div style={{ color: AMBER, fontFamily: DISPLAY_FONT, fontSize: "13px" }}>{character.identity.name}</div>
                <div style={{ color: SLATE, fontSize: "11px", marginTop: "2px" }}>
                  {RACE_OPTIONS.find((r) => r.key === character.identity.race)?.label || character.identity.race} · {BACKGROUND_OPTIONS[character.identity.background]?.label || character.identity.background}
                  {character.identity.gender ? ` · ${character.identity.gender}` : ""}
                  {character.identity.age ? ` · Age ${character.identity.age}` : ""}
                </div>
              </div>
            </div>
            {character.identity.voice && <div style={{ color: SLATE, fontSize: "11px", marginTop: "2px" }}>Voice: {character.identity.voice}</div>}
            {character.regionalPassive && (
              <div style={{ color: CODE_VOICE, fontSize: "11px", marginTop: "7px", lineHeight: 1.5 }}>
                Regional Passive — {character.regionalPassive.key}: {character.regionalPassive.description}
              </div>
            )}
            {character.identity.appearance && (
              <div style={{ color: SLATE, fontSize: "11px", marginTop: "6px", lineHeight: 1.5 }}>{character.identity.appearance}</div>
            )}
            {character.identity.backstory && (
              <div style={{ color: SLATE, fontSize: "11px", marginTop: "6px", fontStyle: "italic", lineHeight: 1.5 }}>{character.identity.backstory}</div>
            )}
          </LedgerSection>
        )}

        <LedgerSection title="Stats & Resources">
          <div style={{ color: INK }}>
            Level {character.level}
            {character.bankedSkillPoints > 0 && (
              <span style={{ color: CODE_VOICE, fontSize: "10.5px", marginLeft: "8px" }}>
                ★ {character.bankedSkillPoints} skill point{character.bankedSkillPoints > 1 ? "s" : ""} banked
              </span>
            )}
          </div>
          <div style={{ marginTop: "4px", color: character.hp <= characterEffStats.maxHp * 0.3 ? WOUND : INK, display: "flex", alignItems: "center", gap: "6px" }}>
            <PixelSprite src={heartIcon} alt="" size={18} /> HP {character.hp} / {characterEffStats.maxHp}
          </div>
          <div style={{ marginTop: "4px" }}>
            <StatBar value={character.hp} max={characterEffStats.maxHp} color={character.hp <= characterEffStats.maxHp * 0.3 ? WOUND : BLOOD} />
          </div>
          <div style={{ marginTop: "10px", color: AMBER }}>Hunger {Math.floor(character.hunger)}/{character.maxHunger}</div>
          <StatBar value={character.hunger} max={character.maxHunger} color="#C58A35" />
          <div style={{ marginTop: "8px", color: SLATE }}>Fatigue {Math.floor(character.fatigue)}/{character.maxFatigue}</div>
          <StatBar value={character.fatigue} max={character.maxFatigue} color="#77808C" />
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "9px" }}>
            {resourceStatuses(character).map((status) => <span key={status.id} title={status.description} style={{ border: `1px solid ${status.color}`, color: status.color, padding: "2px 6px", fontSize: "10px", cursor: "help" }}>● {status.label}</span>)}
            {Object.entries(character.timedEffects || {}).filter(([, effect]) => effect.expiresAt > Date.now()).map(([id]) => { const def = getStatusDef(id); return def ? <span key={id} title={def.description} style={{ border: `1px solid ${CODE_VOICE}`, color: CODE_VOICE, padding: "2px 6px", fontSize: "10px", cursor: "help" }}>● {id.replaceAll("_", " ")}</span> : null; })}
          </div>
          <div style={{ marginTop: "8px", color: SLATE, fontSize: "11px", display: "flex", alignItems: "center", gap: "5px", flexWrap: "wrap" }}>
            XP {character.xp} / {xpToNextLevel(character.level)} · ATK {characterEffStats.atk} · <PixelSprite src={shieldIcon} alt="" size={16} /> DEF {characterEffStats.def}
          </div>
          <div style={{ marginTop: "2px", color: SLATE, fontSize: "11px" }}>
            Crit {characterEffStats.critChance.toFixed(0)}% · Dodge {characterEffStats.dodgeChance.toFixed(0)}%
          </div>
          <div style={{ marginTop: "4px" }}>
            <StatBar value={character.xp} max={xpToNextLevel(character.level)} color={AMBER} height={5} />
          </div>
        </LedgerSection>

        <LedgerSection title="Training">
          <div style={{ color: INK }}>Banked skill points: <span style={{ color: AMBER }}>{character.bankedSkillPoints || 0}</span></div>
          <div style={{ color: CODE_VOICE, marginTop: "3px" }}>Each session costs 4 Fatigue · {Math.floor(character.fatigue / TRAINING_FATIGUE_COST)} session(s) affordable</div>
        </LedgerSection>

        <LedgerSection title="Attributes">
          {Object.entries(ATTRIBUTE_DEFS).map(([key, def]) => {
            const value = character.attributes[key];
            const milestone = milestoneFor(value);
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                <div style={{ color: INK, minWidth: 0 }}>
                  {def.short} <span style={{ color: AMBER }}>{value}</span>
                  {milestone && <span style={{ color: SLATE, fontSize: "10.5px", marginLeft: "6px" }}>{milestone.label}</span>}
                </div>
              </div>
            );
          })}
        </LedgerSection>

        {((character.injuries || []).length > 0 || (character.scars || []).length > 0) && (
          <LedgerSection title="Injuries & Scars">
            {(character.injuries || []).map((injury, index) => (
              <div key={`injury-${index}`} style={{ color: WOUND, marginBottom: "5px", textTransform: "capitalize" }}>
                {injury.area} injury · {ATTRIBUTE_DEFS[injury.statKey].short} {injury.amount}
              </div>
            ))}
            {(character.scars || []).map((scar, index) => (
              <div key={`scar-${index}`} style={{ color: SLATE, fontSize: "10.5px", marginBottom: "4px" }}>{scar.description}</div>
            ))}
          </LedgerSection>
        )}

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
          <div style={{ color: AMBER, display: "flex", alignItems: "center", gap: "6px" }}><PixelSprite src={coinIcon} alt="" size={20} /> {character.gold}g</div>
        </LedgerSection>

        <LedgerSection title="Equipped">
          {["weapon", "armor"].map((slot) => {
            const equippedItem = character.equipped?.[slot];
            const def = equippedItem ? EQUIPMENT_TABLE[equippedItem.equipmentKey] : null;
            const rarity = equippedItem ? RARITY_TIERS[rarityOf(equippedItem)] : null;
            const itemSprite = equippedItem ? EQUIPMENT_SPRITES[equippedItem.equipmentKey] : null;
            return (
              <div key={slot} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                <div style={{ minWidth: 0, textTransform: "capitalize", display: "flex", alignItems: "center", gap: "6px" }}>
                  {itemSprite && <PixelSprite src={itemSprite} alt="" size={28} style={{ flexShrink: 0 }} />}
                  <div>
                  <span style={{ color: equippedItem ? SLATE : DIM }}>{slot}: </span>
                  <span style={{ color: equippedItem ? rarity.color : DIM }}>{equippedItem ? equippedItem.name : "none"}</span>
                  {equippedItem && rarity.label !== "Common" && <span style={{ color: rarity.color, fontSize: "10px", marginLeft: "5px" }}>({rarity.label})</span>}
                  {def && (
                    <span style={{ color: CODE_VOICE, fontSize: "10.5px", marginLeft: "6px" }}>
                      (+{Math.round((slot === "weapon" ? def.atkBonus : def.defBonus) * rarity.statMult)} {slot === "weapon" ? "ATK" : "DEF"})
                    </span>
                  )}
                  </div>
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
              const itemSprite = isConsumable ? healingPotionIcon : EQUIPMENT_SPRITES[item.equipmentKey];
              return (
                <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                  <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                    {itemSprite && <PixelSprite src={itemSprite} alt="" size={28} style={{ flexShrink: 0 }} />}
                    <div>
                      <span style={{ color: nameColor }}>• {item.name}</span>
                      {rarity.label !== "Common" && <span style={{ color: nameColor, fontSize: "10px", marginLeft: "5px" }}>({rarity.label})</span>}
                      {item.quantity > 1 && <span style={{ color: SLATE }}> ×{item.quantity}</span>}
                      {isConsumable && <span style={{ color: CODE_VOICE, fontSize: "10.5px", marginLeft: "6px" }}>{CONSUMABLE_TABLE[item.consumableKind].curesInjury ? "(cures one injury)" : CONSUMABLE_TABLE[item.consumableKind].hungerRestore ? `(+${CONSUMABLE_TABLE[item.consumableKind].hungerRestore} Hunger)` : `(+${Math.round(CONSUMABLE_TABLE[item.consumableKind].healAmount * rarity.statMult)} HP)`}</span>}
                      {equipDef && <span style={{ color: CODE_VOICE, fontSize: "10.5px", marginLeft: "6px" }}>(+{Math.round((equipDef.slot === "weapon" ? equipDef.atkBonus : equipDef.defBonus) * rarity.statMult)} {equipDef.slot === "weapon" ? "ATK" : "DEF"})</span>}
                    </div>
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

        <LedgerSection title={<span style={{ display: "flex", alignItems: "center", gap: "6px" }}><PixelSprite src={scrollIcon} alt="" size={18} /> Quests ({quests.length})</span>}>
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
                {worldState.locations[worldState.locationId].connections.filter((id) => worldState.locations[id]?.discovered).map((id) => {
                  const location = worldState.locations[id];
                  const label = locationDisplayName(location);
                  return (
                  <button
                    key={id}
                    onClick={() => submitAction(`Travel to ${label} [destination existingId: ${id}]`)}
                    disabled={loading || !!combat || !!shop || !!pendingPurchase}
                    style={{ background: "transparent", border: `1px ${location.visited ? "solid" : "dashed"} #4A3F2C`, color: location.visited ? SLATE : DIM, padding: "3px 9px", fontFamily: "ui-monospace, monospace", fontSize: "10.5px", fontStyle: location.visited ? "normal" : "italic", cursor: loading || combat || shop || pendingPurchase ? "default" : "pointer", opacity: loading || combat || shop || pendingPurchase ? 0.5 : 1 }}
                  >
                    → {label}
                  </button>
                  );
                })}
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
                {n.traits?.length > 0 && (
                  <div style={{ color: CODE_VOICE, paddingLeft: "8px", fontSize: "11px", marginTop: "2px" }}>{n.traits.join(" · ")}</div>
                )}
                {n.goal && (
                  <div style={{ color: SLATE, paddingLeft: "8px", fontSize: "11px", marginTop: "2px", fontStyle: "italic" }}>Wants: {n.goal}</div>
                )}
                {n.secret && (
                  <div style={{ color: WOUND, paddingLeft: "8px", fontSize: "11px", marginTop: "2px", fontStyle: "italic" }}>Secret: {n.secret}</div>
                )}
                {n.isTrainer && (
                  <div style={{ color: AMBER, paddingLeft: "8px", fontSize: "11px", marginTop: "3px" }}>
                    {n.trainerSubtype === "deepsinger" ? "Deepsinger" : "Trainer"} · trust required {n.trustRequired || 0} · {(n.trainableStats || []).map((entry) => `${ATTRIBUTE_DEFS[entry.stat]?.short || entry.stat.toUpperCase()} to ${entry.maxLevel}${n.taughtOut?.[entry.stat] ? " (taught out)" : ""}`).join(" · ") || "no disciplines"}
                  </div>
                )}
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
        </> : <WorldCompendium worldState={worldState} />}
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
  const [formativeSelections, setFormativeSelections] = useState({});
  const [weapon, setWeapon] = useState("dagger");
  const [voice, setVoice] = useState(null);
  const [backstory, setBackstory] = useState("");

  const allMemoriesAnswered = FORMATIVE_MEMORY_QUESTIONS.every((question) => formativeSelections[question.id] !== undefined);
  const canSubmit = name.trim().length > 0 && race && background && allMemoriesAnswered;
  const GENDER_OPTIONS = ["Male", "Female", "Nonbinary", "Prefer not to say"];
  const raceBonus = RACE_STAT_BONUS_TABLE[race] || {};
  const backgroundBonus = background ? (BACKGROUND_STAT_BONUS_TABLE[background] || BACKGROUND_OPTIONS[background]?.bonus || {}) : {};
  const previewBonus = combinedStatBonus(raceBonus, backgroundBonus);

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

  function raceButton(r) {
    const selected = race === r.key;
    return (
      <button key={r.key} onClick={() => setRace(r.key)} aria-pressed={selected} style={{ width: "88px", padding: "7px", background: selected ? `linear-gradient(180deg, ${BLOOD} 0%, #4A1620 100%)` : "#17120e", border: `1px solid ${selected ? AMBER : "#4A3F2C"}`, color: INK, cursor: "pointer", borderRadius: "2px", fontFamily: DISPLAY_FONT, fontSize: "11px" }}>
        <PixelSprite src={RACE_SPRITES[r.key]} alt="" size={72} style={{ margin: "0 auto 5px", background: "#090806" }} />
        {r.label}
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
            {RACE_OPTIONS.map(raceButton)}
          </div>
          {race && <p style={{ color: SLATE, fontSize: "11.5px", marginTop: "8px", lineHeight: 1.5 }}>{RACE_OPTIONS.find((r) => r.key === race).flavor} <span style={{ color: CODE_VOICE }}>Race bonus: {statBonusText(raceBonus)}</span></p>}
        </div>

        <div style={{ marginBottom: "22px" }}>
          {fieldLabel("Background")}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {Object.entries(BACKGROUND_OPTIONS).map(([key, b]) => {
              const selected = background === key;
              const bonusText = statBonusText(BACKGROUND_STAT_BONUS_TABLE[key] || b.bonus);
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
          {(race || background) && mode !== "migrate" && (
            <div style={{ marginTop: "10px", padding: "9px 10px", border: "1px solid #33291D", background: "#17120e", color: CODE_VOICE, fontSize: "12px" }}>
              Base stat preview: {statBonusText(previewBonus)}
            </div>
          )}
        </div>

        <div style={{ marginBottom: "22px" }}>
          {fieldLabel("Formative Memories")}
          {FORMATIVE_MEMORY_QUESTIONS.map((question) => (
            <div key={question.id} style={{ marginBottom: "16px" }}>
              <div style={{ color: INK, fontSize: "13.5px", marginBottom: "8px", lineHeight: 1.5 }}>{question.prompt}</div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {question.options.map((option, optionIndex) => pillButton(
                  `${question.id}-${optionIndex}`,
                  option.label,
                  formativeSelections[question.id] === optionIndex,
                  () => setFormativeSelections((current) => ({ ...current, [question.id]: optionIndex }))
                ))}
              </div>
            </div>
          ))}
        </div>

        {mode !== "migrate" && allMemoriesAnswered && (
          <div style={{ marginBottom: "22px" }}>
            {fieldLabel("Starting Weapon")}
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              <PixelSprite src={EQUIPMENT_SPRITES[STARTING_WEAPON_OPTIONS[weapon].equipmentKey]} alt={`${STARTING_WEAPON_OPTIONS[weapon].label} icon`} size={82} style={{ background: "#0e0c09", border: "1px solid #33291D" }} />
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1 }}>
                {Object.entries(STARTING_WEAPON_OPTIONS).map(([key, w]) => pillButton(key, w.label, weapon === key, () => setWeapon(key)))}
              </div>
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
          onClick={() => {
            const traits = { aggression: 0, empathy: 0, discipline: 0, curiosity: 0, ambition: 0 };
            const formativeAnswers = FORMATIVE_MEMORY_QUESTIONS.map((question) => {
              const option = question.options[formativeSelections[question.id]];
              Object.entries(option.traits).forEach(([trait, amount]) => { traits[trait] += amount; });
              return option.label;
            });
            onSubmit({ name: name.trim(), gender, age: age.trim(), appearance: appearance.trim(), race, background, weapon, voice, backstory: backstory.trim(), traits, formativeAnswers });
          }}
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
  const visibleLocations = Object.fromEntries(Object.entries(locations).filter(([, location]) => location.discovered));
  const positions = computeMapLayout(visibleLocations, locationId);
  const ids = Object.keys(visibleLocations);

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
    (visibleLocations[id]?.connections || []).forEach((cid) => {
      if (!visibleLocations[cid]) return;
      const key = [id, cid].sort().join("|");
      if (drawnEdges.has(key)) return;
      drawnEdges.add(key);
      edges.push([id, cid]);
    });
  });

  const currentConnections = new Set(visibleLocations[locationId]?.connections || []);
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
            const loc = visibleLocations[id];
            const isCurrent = id === locationId;
            const isReachable = currentConnections.has(id);
            const canClick = !isCurrent && loc.discovered && canTravel;
            const isHazy = !loc.visited;
            const label = locationDisplayName(loc);
            return (
              <g
                key={id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => canClick && onTravel(id, label)}
                style={{ cursor: canClick ? "pointer" : "default" }}
              >
                {isCurrent ? (
                  <>
                    <circle r={16} fill={BLOOD} opacity={0.18} />
                    <path d="M0,-11 C5,-4 5,4 0,11 C-5,4 -5,-4 0,-11 Z" fill={BLOOD} stroke={MAP_INK} strokeWidth={1.5} />
                    <circle cy={-4} r={2.5} fill={PARCHMENT_LIGHT} />
                  </>
                ) : (
                  <circle r={isHazy ? 8 : 5} fill={isHazy ? PARCHMENT_MID : (isReachable ? MAP_INK : "none")} stroke={MAP_INK} strokeWidth={1.5} strokeDasharray={isHazy ? "2 3" : undefined} opacity={isHazy ? 0.45 : (isReachable ? 1 : 0.55)} />
                )}
                <text
                  y={isCurrent ? 30 : 20}
                  textAnchor="middle"
                  fill={MAP_INK}
                  fontFamily={DISPLAY_FONT}
                  fontSize={isCurrent ? 13 : 11}
                  fontWeight={isCurrent ? 700 : 400}
                  textDecoration={canClick ? "underline" : "none"}
                  fontStyle={isHazy ? "italic" : "normal"}
                  opacity={isHazy ? 0.5 : (isCurrent || isReachable ? 1 : 0.7)}
                >
                  {shortLocationLabel(label)}
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

        <JournalSection title="Wounds & Scars">
          {(character.injuries || []).length === 0 && (character.scars || []).length === 0 ? (
            <div style={{ color: DIM, fontSize: "12px" }}>No lasting marks recorded.</div>
          ) : (
            <>
              {(character.injuries || []).map((injury, index) => <div key={`journal-injury-${index}`} style={{ color: WOUND, fontSize: "12px", marginBottom: "5px", textTransform: "capitalize" }}>{injury.area} injury ({ATTRIBUTE_DEFS[injury.statKey].short} {injury.amount})</div>)}
              {(character.scars || []).map((scar, index) => <div key={`journal-scar-${index}`} style={{ color: SLATE, fontSize: "11.5px", marginBottom: "5px" }}>{scar.description}</div>)}
            </>
          )}
        </JournalSection>

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
                  {n.traits?.length > 0 && (
                    <div style={{ color: CODE_VOICE, fontSize: "10.5px", marginTop: "2px" }}>{n.traits.join(" · ")}</div>
                  )}
                  {n.goal && (
                    <div style={{ color: SLATE, fontSize: "11.5px", marginTop: "2px", fontStyle: "italic" }}>Wants: {n.goal}</div>
                  )}
                  {n.secret && (
                    <div style={{ color: WOUND, fontSize: "11.5px", marginTop: "2px", fontStyle: "italic" }}>Secret: {n.secret}</div>
                  )}
                </div>
              );
            })
          )}
        </JournalSection>

        <JournalSection title={`Locations Discovered (${Object.values(worldState.locations).filter((loc) => loc.discovered).length})`}>
          {Object.entries(worldState.locations).filter(([, loc]) => loc.discovered).map(([id, loc]) => (
            <div key={id} style={{ marginBottom: "8px" }}>
              <div style={{ color: id === worldState.locationId ? AMBER : (loc.visited ? INK : DIM), fontSize: "12.5px", fontStyle: loc.visited ? "normal" : "italic" }}>
                • {locationDisplayName(loc)}{id === worldState.locationId ? " (here now)" : ""}
              </div>
              {loc.visited && loc.connections.some((cid) => worldState.locations[cid]?.discovered) && (
                <div style={{ color: SLATE, fontSize: "10.5px", paddingLeft: "12px", marginTop: "2px" }}>
                  ↔ {loc.connections.map((cid) => worldState.locations[cid]).filter((connected) => connected?.discovered).map(locationDisplayName).join(", ")}
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

function PurchaseConfirmPanel({ purchase, character, onPay, onDecline, loading }) {
  const canAfford = character.gold >= purchase.amount;

  return (
    <div style={{ margin: "20px 0", padding: "16px", border: `2px solid ${AMBER}`, background: "linear-gradient(180deg, #241D12 0%, #191510 100%)", boxShadow: "inset 0 0 24px rgba(0,0,0,0.4)", borderRadius: "3px" }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: "13px", letterSpacing: "0.05em", color: AMBER, display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <RavenGlyph size={12} color={AMBER} /> Confirm Purchase
      </div>
      <div style={{ color: INK, fontSize: "14px", marginBottom: "8px" }}>{purchase.reason}</div>
      <div style={{ color: SLATE, fontSize: "11px", marginBottom: "14px", fontFamily: "ui-monospace, monospace" }}>
        Cost: <span style={{ color: canAfford ? AMBER : WOUND }}>{purchase.amount}g</span> · Your gold: <span style={{ color: AMBER }}>{character.gold}g</span>
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={onPay}
          disabled={loading || !canAfford}
          style={{ background: "transparent", border: `1px solid ${canAfford ? AMBER : "#4A3F2C"}`, color: canAfford ? AMBER : DIM, padding: "5px 11px", fontFamily: "ui-monospace, monospace", fontSize: "11px", cursor: loading || !canAfford ? "default" : "pointer" }}
        >
          Pay {purchase.amount}g
        </button>
        <button onClick={onDecline} disabled={loading} style={{ background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "5px 11px", fontFamily: "ui-monospace, monospace", fontSize: "11px", cursor: loading ? "default" : "pointer" }}>
          Decline
        </button>
      </div>
    </div>
  );
}

// The attribute panel — same boxed, code-owned visual language as combat/shop/leveling:
// a bordered box means code has taken over and text input is paused until you're done.
// Spending never calls the AI, and there's no soft cap here beyond ATTRIBUTE_CAP itself —
// dumping every point into one attribute is a fully valid, supported build choice.
function TrainingPanel({ trainer, stat, character, onAccept, onDecline, disabled = false }) {
  const lesson = trainer.trainableStats.find((entry) => entry.stat === stat);
  const current = character.attributes[stat];
  const cost = trainingCostFor(current);
  const reason = current >= lesson.maxLevel ? `${trainer.name} has taught you all they know.`
    : (character.bankedSkillPoints || 0) <= 0 ? "No banked skill points."
    : character.fatigue < TRAINING_FATIGUE_COST ? "You are too fatigued to train."
    : character.gold < cost ? `You need ${cost} gold.` : null;
  return (
    <div style={{ margin: "20px 0", padding: "16px", border: `2px solid ${AMBER}`, background: "linear-gradient(180deg, #292216 0%, #1C1710 100%)", borderRadius: "3px" }}>
      <div style={{ fontFamily: DISPLAY_FONT, color: AMBER, marginBottom: "7px" }}><RavenGlyph size={12} /> Training with {trainer.name}</div>
      <div style={{ color: INK, marginBottom: "5px" }}>{ATTRIBUTE_DEFS[stat].label} {current} → {current + 1}</div>
      <div style={{ color: SLATE, fontFamily: "ui-monospace, monospace", fontSize: "11px", marginBottom: "12px" }}>{cost} gold · 1 banked skill point · 4 Fatigue</div>
      {reason && <div style={{ color: WOUND, marginBottom: "10px" }}>{reason}</div>}
      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={onAccept} disabled={disabled || !!reason} style={{ background: reason ? "transparent" : `linear-gradient(180deg, ${BLOOD} 0%, #4A1620 100%)`, border: `1px solid ${reason ? DIM : BLOOD}`, color: reason ? DIM : INK, padding: "8px 16px", cursor: disabled || reason ? "default" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: DISPLAY_FONT }}>Accept lesson</button>
        <button onClick={onDecline} disabled={disabled} style={{ background: "transparent", border: "1px solid #4A3F2C", color: SLATE, padding: "8px 16px", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1, fontFamily: DISPLAY_FONT }}>Not now</button>
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

function WorldCompendium({ worldState }) {
  const [expandedRegion, setExpandedRegion] = useState(null);
  const discoveredRegions = new Set(Object.values(worldState.locations).filter((location) => location.discovered).map((location) => location.regionId));
  const loreSection = (title, items, pantheon = false) => items?.length ? (
    <div style={{ marginTop: "15px" }}>
      <div style={{ color: AMBER, fontFamily: DISPLAY_FONT, fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", borderBottom: `1px solid ${DIM}`, paddingBottom: "4px", marginBottom: "8px" }}>{title}</div>
      {items.map((item) => (
        <div key={`${item.name}-${item.title || ""}`} style={{ marginBottom: "10px", lineHeight: 1.5 }}>
          <div style={{ color: INK, fontFamily: BODY_FONT, fontWeight: 600, fontSize: "14px" }}>{item.name}{pantheon && item.title ? `, ${item.title}` : ""}</div>
          <div style={{ color: SLATE, fontFamily: BODY_FONT, fontSize: "13px" }}>{item.description}</div>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <div>
      <div style={{ color: SLATE, fontFamily: BODY_FONT, fontSize: "13px", lineHeight: 1.5, marginBottom: "14px" }}>Discover a location to unlock all recorded lore for its region.</div>
      {WORLD_LORE.map((region) => {
        const unlocked = discoveredRegions.has(region.regionId);
        const expanded = unlocked && expandedRegion === region.regionId;
        return (
          <div key={region.regionId} style={{ marginBottom: "10px", border: `1px solid ${unlocked ? "#4A3F2C" : "#292620"}`, background: unlocked ? "linear-gradient(145deg, #211B14, #14110D)" : "linear-gradient(145deg, #161513, #0E0D0C)", boxShadow: unlocked ? "inset 0 0 0 1px rgba(200,155,74,.08), 0 3px 10px rgba(0,0,0,.25)" : "inset 0 0 12px rgba(0,0,0,.7)", opacity: unlocked ? 1 : .58 }}>
            <button disabled={!unlocked} aria-expanded={expanded} onClick={() => setExpandedRegion(expanded ? null : region.regionId)} style={{ width: "100%", border: 0, background: "transparent", padding: "12px", cursor: unlocked ? "pointer" : "default", display: "flex", justifyContent: "space-between", alignItems: "center", color: unlocked ? AMBER : DIM, fontFamily: DISPLAY_FONT, letterSpacing: ".08em", textTransform: "uppercase", textAlign: "left" }}>
              <span>{region.regionName}</span>
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "9px", letterSpacing: ".06em", color: unlocked ? SLATE : DIM }}>{unlocked ? (expanded ? "close −" : "open +") : "undiscovered"}</span>
            </button>
            {expanded && (
              <div style={{ borderTop: `1px solid ${DIM}`, padding: "12px", background: "linear-gradient(180deg, rgba(233,218,180,.035), transparent)" }}>
                <div style={{ color: INK, fontFamily: BODY_FONT, fontSize: "13px" }}>{region.dominantRace} · {region.racePercent}</div>
                <div style={{ marginTop: "12px" }}>
                  <div style={{ color: AMBER, fontFamily: DISPLAY_FONT, fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: "5px" }}>Political Structure</div>
                  <div style={{ color: SLATE, fontFamily: BODY_FONT, fontSize: "13px", lineHeight: 1.5 }}>{region.politicalStructure}</div>
                </div>
                {loreSection(region.pantheon ? "Pantheon" : "Belief System", region.pantheon || region.beliefSystem, !!region.pantheon)}
                {loreSection("Customs", region.customs)}
                {loreSection("History", region.history)}
                <div style={{ marginTop: "15px" }}>
                  <div style={{ color: AMBER, fontFamily: DISPLAY_FONT, fontSize: "10px", letterSpacing: ".12em", textTransform: "uppercase", borderBottom: `1px solid ${DIM}`, paddingBottom: "4px", marginBottom: "8px" }}>Factions</div>
                  {region.factions.map((group) => <div key={group.name} style={{ marginBottom: "10px", fontFamily: BODY_FONT, lineHeight: 1.45 }}><div style={{ color: INK, fontWeight: 600, fontSize: "14px" }}>{group.name}</div><div style={{ color: SLATE, fontSize: "13px" }}>{[group.leaderTitle, group.leaderName].filter(Boolean).join(" ")} — {group.trait}{group.description ? ` ${group.description}` : ""}</div></div>)}
                  {region.wildcard && <div style={{ marginTop: "12px", paddingTop: "9px", borderTop: "1px dashed #4A3F2C", fontFamily: BODY_FONT }}><div style={{ color: CODE_VOICE, fontSize: "10px", textTransform: "uppercase", letterSpacing: ".1em" }}>Wildcard</div><div style={{ color: INK, fontWeight: 600, fontSize: "14px" }}>{region.wildcard.name}</div><div style={{ color: SLATE, fontSize: "13px" }}>{region.wildcard.trait}</div></div>}
                </div>
              </div>
            )}
          </div>
        );
      })}
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
