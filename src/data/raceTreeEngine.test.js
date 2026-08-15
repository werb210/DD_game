import assert from 'node:assert/strict';
import test from 'node:test';

import { RACE_TREES } from './RACE_TREES.js';
import { nodeLockReason, optionsForTier } from './raceTreeEngine.js';

const tree = RACE_TREES.orc;
const character = (raceTree = {}, level = 40) => ({
  level,
  startingRegion: 'swamp',
  attributes: { str: 20, dex: 20, con: 20, int: 20, wis: 20, cha: 20, arcane: 20 },
  raceTree,
});

test('tiers 2 and 3 expose every eligible option before their parent is selected', () => {
  const blankCharacter = character();

  assert.deepEqual(optionsForTier(blankCharacter, tree, 2).map(({ id }) => id), [
    'STR1', 'STR2', 'DEX1', 'DEX2', 'MAG1', 'MAG2',
  ]);
  assert.equal(optionsForTier(blankCharacter, tree, 3).length, 19);
  assert.ok(optionsForTier(blankCharacter, tree, 3).some(({ id }) => id === 'orc_t3_native'));
});

test('tiers 2 and 3 narrow to the selected parent branch', () => {
  assert.deepEqual(optionsForTier(character({ tier1: 'STR' }), tree, 2).map(({ id }) => id), ['STR1', 'STR2']);
  assert.deepEqual(optionsForTier(character({ tier1: 'STR', tier2: 'STR1' }), tree, 3).map(({ id }) => id), [
    'STR1a', 'STR1b', 'STR1c', 'orc_t3_native',
  ]);
});

test('missing parent is the primary tier 2/3 lock reason, ahead of the level gate', () => {
  const lowLevelCharacter = character({}, 1);

  assert.equal(nodeLockReason(lowLevelCharacter, tree, tree.nodes.STR1), 'Pick a Tier 1 path first');
  assert.equal(nodeLockReason(lowLevelCharacter, tree, tree.nodes.STR1a), 'Pick a Tier 2 path first');
  assert.equal(nodeLockReason(character({ tier1: 'STR' }, 1), tree, tree.nodes.STR1), 'Requires Level 10');
});

test('unconditional tiers retain their complete option sets', () => {
  const blankCharacter = character();

  for (const tier of [1, 4, 5, 6, 7, 8]) {
    const expected = Object.values(tree.nodes).filter((node) =>
      node.tier === tier && (!node.native || blankCharacter.startingRegion === tree.homeRegion));
    assert.deepEqual(optionsForTier(blankCharacter, tree, tier), expected);
  }
});
