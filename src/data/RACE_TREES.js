// Race evolution content is deliberately data-owned. The engine in raceTreeEngine.js
// knows nothing about Orcs, so another race can be added as one more entry here.
const n = (id, tier, name, description, root = null, parent = null, effects = [], native = false) => ({
  id, tier, name, description, root, parent, effects, native,
});
const numeric = (key, baseMagnitude, unit = "") => ({ key, baseMagnitude, unit, numeric: true });
const binary = (key) => ({ key, numeric: false });

const orcNodes = [
  n("STR",1,"Path of the Bonecrusher","Raw physical power.","STR"), n("DEX",1,"Path of the Beastwarden","Beast-knowledge, mobility, and survival instinct.","DEX"), n("MAGIC",1,"Path of the Bloomtouched","A rare innate Bloom-magic awakening.","MAGIC"),
  n("STR1",2,"Thick Hide","A flat DEF bump.","STR","STR",[numeric("defense",2)]), n("STR2",2,"Crushing Grip","Bonus melee damage.","STR","STR",[numeric("meleeDamage",3)]),
  n("DEX1",2,"Keen Nose","Greater wilderness discovery radius and tracking instinct.","DEX","DEX",[numeric("discoveryRadius",10,"%")]), n("DEX2",2,"Quick Reflexes","Bonus Dodge.","DEX","DEX",[numeric("dodge",4,"%")]),
  n("MAG1",2,"Chosen by the Swamp","Sense Bloom-touched creatures and plants.","MAGIC","MAGIC",[binary("senseBloom")]), n("MAG2",2,"Fungal Whisper","Minor communion with small growth.","MAGIC","MAGIC",[binary("fungalCommunion")]),
  n("STR1a",3,"Callused Frame","Further flat DEF.","STR","STR1",[numeric("defense",3)]), n("STR1b",3,"Weathered Scars","Reduced injury duration.","STR","STR1",[numeric("injuryDuration",15,"%")]), n("STR1c",3,"Iron Grip","Bonus damage with two-handed weapons.","STR","STR1",[numeric("twoHandDamage",5,"%")]),
  n("STR2a",3,"Broad Shoulders","Carry capacity and melee hit chance.","STR","STR2",[numeric("carryCapacity",10,"%"),numeric("meleeHit",3,"%")]), n("STR2b",3,"Hauler's Endurance","More carry weight and less Fatigue while overloaded.","STR","STR2",[numeric("carryWeight",12),numeric("overloadFatigueReduction",10,"%")]), n("STR2c",3,"Bonecrusher's Instinct","Bonus damage against staggered enemies.","STR","STR2",[numeric("staggeredDamage",12,"%")]),
  n("DEX1a",3,"Rot-Sense","Detect Long-Rot-tainted ground and items.","DEX","DEX1",[binary("detectLongRot")]), n("DEX1b",3,"Tracker's Eye","Improved tracking and damage against fleeing enemies.","DEX","DEX1",[numeric("trackingDistance",15,"%"),numeric("fleeingHit",5,"%")]), n("DEX1c",3,"Beastspeaker","A chance to pacify or avoid wild-beast encounters.","DEX","DEX1",[numeric("beastPacifyChance",8,"%")]),
  n("DEX2a",3,"Quickdraw","Reduced weapon-swap action cost.","DEX","DEX2",[numeric("weaponSwapCostReduction",15,"%")]), n("DEX2b",3,"Feint Strike","Bonus hit chance against staggered enemies.","DEX","DEX2",[numeric("staggeredHit",8,"%")]), n("DEX2c",3,"Bog-Runner","Reduced difficult-terrain movement penalty.","DEX","DEX2",[numeric("terrainPenaltyReduction",15,"%")]),
  n("MAG1a",3,"Vinebind","A minor entangling slow.","MAGIC","MAG1",[numeric("slow",15,"%")]), n("MAG1b",3,"Spore Cloud","A minor fungal-poison area debuff.","MAGIC","MAG1",[numeric("areaDebuff",10,"%")]), n("MAG1c",3,"Living Ember","A strange growth/fire hybrid effect.","MAGIC","MAG1",[numeric("growthFireDamage",4)]),
  n("MAG2a",3,"Thorned Skin","Minor DEF and retaliation damage.","MAGIC","MAG2",[numeric("defense",1),numeric("retaliationDamage",3)]), n("MAG2b",3,"Root's Grasp","Animate a small vine/root ally briefly.","MAGIC","MAG2",[numeric("summonDuration",2," rounds")]), n("MAG2c",3,"Bloom's Mercy","Minor healing through fungal regrowth.","MAGIC","MAG2",[numeric("healing",6)]),
  n("orc_t3_native",3,"Gill-Slits","Near-immunity to swamp movement penalties.",null,null,[binary("swampMovementImmunity")],true),
  n("orc_t4_a",4,"Scarred Resolve","Reduced injury severity.",null,null,[numeric("injurySeverityReduction",10,"%")]), n("orc_t4_b",4,"Adrenal Surge","Combat-only DEX bump at low HP.",null,null,[numeric("lowHpDex",3)]), n("orc_t4_c",4,"Grim Endurance","Reduced Combat Fatigue cost.",null,null,[numeric("combatFatigueReduction",10,"%")]), n("orc_t4_d",4,"Unshaken","Resist intimidation.",null,null,[binary("resist_intimidate")]), n("orc_t4_e",4,"Waste-Not Healer","Healing received is more effective.",null,null,[numeric("healingReceived",8,"%")]), n("orc_t4_f",4,"Hard Bargain","Trust bonus with Condemned and Swamp-orc NPCs.",null,null,[numeric("swampOrcTrust",2)]),
  n("orc_t5_a",5,"Bone Density","Resist stun.",null,null,[binary("resist_stun")]), n("orc_t5_b",5,"Predator Instinct","Bonus hit chance against lower-severity enemies.",null,null,[numeric("lowerSeverityHit",8,"%")]), n("orc_t5_c",5,"Iron Lungs","More stamina and breath in swamp or underwater.",null,null,[numeric("swampBreath",15,"%")]), n("orc_t5_d",5,"Grudge-Keeper","Bonus damage against a foe type that badly hurt you before.",null,null,[numeric("grudgeDamage",10,"%")]), n("orc_t5_native",5,"Bog-Walker","Reduced swamp travel day-cost.",null,null,[numeric("swampTravelReduction",15,"%")],true),
  n("orc_t6_a",6,"Regenerative Tissue","Slow passive HP regeneration out of combat.",null,null,[numeric("outOfCombatRegen",1)]), n("orc_t6_b",6,"Toxin Tolerance","Full poison immunity.",null,null,[binary("immune_poison")]), n("orc_t6_c",6,"Second Wind Instinct","A daily chance to avoid a killing blow.",null,null,[numeric("deathAvoidChance",8,"%")]), n("orc_t6_d",6,"Weathered Constitution","Increased Max Fatigue.",null,null,[numeric("maxFatigue",10)]), n("orc_t6_e",6,"Efficient Forager","Reduced passive Hunger drain.",null,null,[numeric("hungerDrainReduction",10,"%")]), n("orc_t6_f",6,"Old Karsk's Lesson","Unlocks a hidden Sacred Rot lore beat.",null,null,[binary("oldKarskDialogue")]),
  n("orc_t7_a",7,"Ironbound Will","Resist fear.",null,null,[binary("resist_fear")]), n("orc_t7_b",7,"Relentless","Reduced daily Training Fatigue cost.",null,null,[numeric("trainingFatigueReduction",15,"%")]), n("orc_t7_c",7,"Unbroken","Reduced exhausted or starving penalties.",null,null,[numeric("resourcePenaltyReduction",15,"%")]), n("orc_t7_native",7,"Marsh-Born","Flat CON bonus while in the Swamp.",null,null,[numeric("swampCon",4)],true),
  n("orc_t8_a",8,"Apex Constitution","A flat Max HP ceiling increase.",null,null,[numeric("maxHp",20)]), n("orc_t8_b",8,"Berserker's Edge","Damage increases as HP falls.",null,null,[numeric("missingHpDamage",15,"%")]),
];

export const RACE_TREES = {
  orc: {
    raceId: "orc", homeRegion: "swamp", magicStat: "arcane",
    nodes: Object.fromEntries(orcNodes.map((node) => [node.id, node])),
    evolutions: { pure: {
      str: { id: "bonecrusher", name: "Bonecrusher", triggerChain: ["STR2", "STR2c"] },
      dex: { id: "beastwarden", name: "Beastwarden", triggerChain: ["DEX1", "DEX1c"] },
      magic: { id: "bloomtouched", name: "Bloomtouched", triggerChain: ["MAG2", "MAG2b"] },
    } },
  },
};

export const HYBRID_EVOLUTIONS = {
  paladin: { id: "paladin", name: "Paladin", roots: ["STR", "MAGIC"] },
  duelist: { id: "duelist", name: "Duelist", roots: ["STR", "DEX"] },
  spellblade: { id: "spellblade", name: "Spellblade", roots: ["DEX", "MAGIC"] },
};

export const TIER_LEVELS = Object.freeze({ 1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 30, 7: 35, 8: 40 });
export const freshRaceTree = () => ({ tier1: null, tier2: null, tier3: null, tier4: null, tier5: null, tier6: null, tier7: null, tier8: null, evolutions: [], capstoneUnlocked: false, oldKarskDialogueUnlocked: false });
