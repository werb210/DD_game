import { HYBRID_EVOLUTIONS, RACE_TREES, TIER_LEVELS, freshRaceTree } from './RACE_TREES.js';

export const RACE_TREE_RARITY = Object.freeze({ 1: 'common', 2: 'common', 3: 'uncommon', 4: 'uncommon', 5: 'rare', 6: 'rare', 7: 'epic', 8: 'legendary' });
const stats = ['str', 'dex', 'con', 'int', 'wis', 'cha', 'arcane'];
export const statForRoot = (tree, root) => root === 'STR' ? 'str' : root === 'DEX' ? 'dex' : tree.magicStat;

export function normalizeRaceTree(value) {
  return { ...freshRaceTree(), ...(value || {}), evolutions: Array.isArray(value?.evolutions) ? [...new Set(value.evolutions)] : [] };
}

export function optionsForTier(character, tree, tier) {
  const raceTree = normalizeRaceTree(character.raceTree);
  return Object.values(tree.nodes).filter((node) => {
    if (node.tier !== tier) return false;
    if (node.native && character.startingRegion !== tree.homeRegion) return false;
    if (tier === 2) return node.parent === raceTree.tier1;
    if (tier === 3) return node.native || node.parent === raceTree.tier2;
    return true;
  });
}

export function nodeLockReason(character, tree, node) {
  const raceTree = normalizeRaceTree(character.raceTree);
  if (raceTree[`tier${node.tier}`]) return raceTree[`tier${node.tier}`] === node.id ? null : 'Another path is permanently selected';
  if ((character.level || 1) < TIER_LEVELS[node.tier]) return `Requires Level ${TIER_LEVELS[node.tier]}`;
  if (node.tier > 1 && !raceTree[`tier${node.tier - 1}`]) return `Requires a Tier ${node.tier - 1} choice`;
  if (node.tier === 8 && !raceTree.capstoneUnlocked) return 'Requires race quest completion and faction-leader teaching';
  if (node.tier <= 3 && (node.root || raceTree.tier1)) {
    const required = statForRoot(tree, node.root || raceTree.tier1);
    const highest = Math.max(...stats.map((key) => character.attributes?.[key] || 0));
    if ((character.attributes?.[required] || 0) !== highest) return `Requires ${required === 'arcane' ? 'ARC' : required.toUpperCase()} to be your highest stat`;
  }
  if (node.secondaryRequirement && (character.attributes?.[node.secondaryRequirement.stat] || 0) < node.secondaryRequirement.min) return `Requires ${node.secondaryRequirement.stat.toUpperCase()} ${node.secondaryRequirement.min}`;
  return null;
}

export function highestStatTie(character) {
  const highest = Math.max(...stats.map((key) => character.attributes?.[key] || 0));
  return stats.filter((key) => (character.attributes?.[key] || 0) === highest);
}

export function effectiveNodeEffects(character, tree, node) {
  // Converged nodes retain the character's original root as their gating/scaling stat.
  const root = node.root || normalizeRaceTree(character.raceTree).tier1;
  const scalingStat = root ? statForRoot(tree, root) : null;
  return node.effects.map((effect) => effect.numeric ? { ...effect, effectiveValue: effect.baseMagnitude * ((character.attributes?.[scalingStat] || 0) / 20), scalingStat } : { ...effect });
}

export function pendingEvolutions(character, tree) {
  const raceTree = normalizeRaceTree(character.raceTree);
  const pending = [];
  Object.values(tree.evolutions?.pure || {}).forEach((evolution) => {
    if (!raceTree.evolutions.includes(evolution.id) && evolution.triggerChain[0] === raceTree.tier2 && evolution.triggerChain[1] === raceTree.tier3) pending.push(evolution);
  });
  const counts = { STR: 0, DEX: 0, MAGIC: 0 };
  [1, 2, 3].forEach((tier) => { const node = tree.nodes[raceTree[`tier${tier}`]]; if (node?.root) counts[node.root] += 1; });
  Object.values(HYBRID_EVOLUTIONS).forEach((evolution) => { if (!raceTree.evolutions.includes(evolution.id) && evolution.roots.every((root) => counts[root] >= 2)) pending.push(evolution); });
  return pending;
}

export function raceTreeFor(character) { return RACE_TREES[character.identity?.race] || null; }
