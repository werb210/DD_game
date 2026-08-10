export const FACTIONS_BY_REGION = Object.freeze({
  heartlands: ["house_ardenne", "house_caswell", "house_draymoor", "house_voss"],
  mountains: ["ironbrand_guild", "emberwright_clanhold", "deepwarden_hold"],
  desert: ["clan_ashkavar", "clan_nazreth", "clan_ithran"],
  swamp: ["mireholt", "thornback", "gravewater"],
  heavy_forest: ["sern_circle", "veyanth_line", "hollow_kin"],
  coast: ["saltmere_corrin", "tidewatch_fenwick", "duskhaven"],
  tundra: ["drakes_hollow", "ashgrim", "wintermere"],
});

export const FACTION_IDS = Object.freeze(Object.values(FACTIONS_BY_REGION).flat());

const RIVALRIES = [
  ["mireholt", "thornback", 30],
  ["sern_circle", "veyanth_line", 30],
  ["ashgrim", "wintermere", 30],
  ["clan_ashkavar", "clan_nazreth", 30],
  ["saltmere_corrin", "tidewatch_fenwick", 30],
  ["ironbrand_guild", "emberwright_clanhold", 15],
];

export function getFactionTier(rawValue) {
  const value = Math.max(-100, Math.min(100, Number(rawValue) || 0));
  if (value <= -60) return "Hostile";
  if (value <= -20) return "Distrusted";
  if (value <= 19) return "Neutral";
  if (value <= 59) return "Favored";
  if (value <= 89) return "Trusted";
  return "Exalted";
}

export function seedFactionReputation(homeRegion, homeFactionId = FACTIONS_BY_REGION[homeRegion]?.[0]) {
  const reputation = Object.fromEntries(FACTION_IDS.map((id) => [id, FACTIONS_BY_REGION[homeRegion]?.includes(id) ? 40 : 0]));
  RIVALRIES.forEach(([first, second, penalty]) => {
    if (!FACTIONS_BY_REGION[homeRegion]?.includes(first)) return;
    if (homeFactionId === first) reputation[second] -= penalty;
    else if (homeFactionId === second) reputation[first] -= penalty;
  });
  // EXTENSION POINT: future Formative-Memory choices may nudge individual factions here.
  return reputation;
}

// State-independent update helper: callers supply the current map and receive a new map.
export function adjustFactionReputation(factionId, delta, factionReputation = {}) {
  if (!FACTION_IDS.includes(factionId)) return factionReputation;
  const current = Number(factionReputation[factionId]) || 0;
  return { ...factionReputation, [factionId]: Math.max(-100, Math.min(100, Math.round(current + Number(delta || 0)))) };
}
