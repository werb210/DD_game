// Zones are location-owned navigation nodes. They deliberately carry no assumptions
// about safety or settlement type so the same graph can later describe hostile sites.
export const ZONES = {
  market_square: {
    zoneId: "market_square",
    locationId: "barrows_cross",
    name: "Market Square",
    description: "The heart of Barrow's Cross, where trade and gossip move at the same pace.",
    npcIds: ["npc_2"],
    interactables: [
      { id: "barrows_general_store", label: "Browse the general store", type: "merchant", targetId: "npc_2" },
    ],
    exits: ["voss_hall", "blacksmith", "inn", "outskirts"],
  },
  voss_hall: {
    zoneId: "voss_hall",
    locationId: "barrows_cross",
    name: "Voss Hall",
    description: "Alderman Voss's seat — cluttered ledgers, cold stone, a man who doesn't rise to greet you.",
    npcIds: ["npc_1"],
    interactables: [
      { id: "speak_with_voss", label: "Speak with Alderman Voss", type: "notice", targetId: "npc_1" },
    ],
    exits: ["market_square"],
  },
  blacksmith: {
    zoneId: "blacksmith",
    locationId: "barrows_cross",
    name: "Blacksmith",
    description: "The forge never fully cools here.",
    npcIds: ["npc_3"],
    interactables: [
      { id: "barrows_blacksmith", label: "Browse the smith's wares", type: "merchant", targetId: "npc_3" },
    ],
    exits: ["market_square"],
  },
  inn: {
    zoneId: "inn",
    locationId: "barrows_cross",
    name: "Inn",
    description: "Rest, rumor, and watered ale.",
    npcIds: ["npc_4"],
    interactables: [
      { id: "barrows_inn_stay", label: "Inn Stay", type: "rest", targetId: "npc_4" },
    ],
    exits: ["market_square"],
  },
  outskirts: {
    zoneId: "outskirts",
    locationId: "barrows_cross",
    name: "Outskirts",
    description: "Where the village gives way to road.",
    npcIds: [],
    interactables: [
      { id: "barrows_regional_travel", label: "Take the road beyond Barrow's Cross", type: "travel_exit", targetId: null },
    ],
    exits: ["market_square"],
  },
};

export const DEFAULT_ZONE_BY_LOCATION = { barrows_cross: "market_square" };

export function zonesForLocation(locationId) {
  return Object.values(ZONES).filter((zone) => zone.locationId === locationId);
}
