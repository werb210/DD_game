export const DIALOGUE_TONES = Object.freeze([
  "Compassionate", "Aggressive", "Charming", "Logical", "Suspicious", "Neutral", "Deceptive",
]);

export const DEFAULT_PERSONAL_AXES = Object.freeze({ compassion: 0, honesty: 0, diplomacy: 0 });

const VOSS_REWARD = Object.freeze({
  minorOrMajor: "major",
  type: "information",
  content: "Voss tells you plainly who actually took the grain, skipping the investigation entirely.",
});

export function dialogueDefaultsFor(name = "") {
  const isVoss = name.trim().toLowerCase() === "alderman voss";
  return {
    personalAxes: { ...DEFAULT_PERSONAL_AXES },
    influenceWeight: isVoss ? 7 : 0,
    warmThreshold: 55,
    devotedThreshold: 65,
    escalationBehavior: isVoss ? "flee_and_report" : "shutdown_only",
    rewardTable: isVoss ? [{ ...VOSS_REWARD }] : [],
    dispositionOverrides: {},
    ...(isVoss ? { factionId: "house_voss" } : {}),
  };
}

export function withDialogueDefaults(npc = {}) {
  const defaults = dialogueDefaultsFor(npc.name);
  const normalized = {
    ...defaults,
    ...npc,
    personalAxes: { ...defaults.personalAxes, ...(npc.personalAxes || {}) },
    rewardTable: Array.isArray(npc.rewardTable) ? npc.rewardTable : defaults.rewardTable,
    dispositionOverrides: npc.dispositionOverrides && typeof npc.dispositionOverrides === "object" ? npc.dispositionOverrides : {},
  };
  if (npc.name?.trim().toLowerCase() === "alderman voss") {
    return { ...normalized, influenceWeight: 7, warmThreshold: 55, devotedThreshold: 65, escalationBehavior: "flee_and_report", rewardTable: [{ ...VOSS_REWARD }], dispositionOverrides: {}, factionId: "house_voss" };
  }
  return normalized;
}

export function getDisposition(npc = {}) {
  const trust = Number(npc.trust) || 0;
  const fear = Number(npc.fear) || 0;
  if (fear >= 7) return "Hostile";
  if (fear >= 4 || trust < 25) return "Wary";
  if (trust >= (Number(npc.devotedThreshold) || 65)) return "Devoted";
  if (trust >= (Number(npc.warmThreshold) || 55)) return "Warm";
  return "Neutral";
}

export function visibleDialogueChoices(npc, choices = []) {
  const disposition = getDisposition(npc);
  return choices.filter((choice) => {
    if (!DIALOGUE_TONES.includes(choice?.tag)) return false;
    if (disposition === "Hostile") return choice.allowedWhenHostile === true;
    if ((disposition === "Wary") && choice.requiresGoodwill === true) return false;
    return true;
  });
}

export function clampPersonalAxes(axes = {}, delta = {}) {
  return Object.fromEntries(Object.keys(DEFAULT_PERSONAL_AXES).map((axis) => [
    axis,
    Math.max(-100, Math.min(100, (Number(axes[axis]) || 0) + (Number(delta[axis]) || 0))),
  ]));
}

export function factionDeltaFor(axisDelta = {}, influenceWeight = 0) {
  return Math.round(Object.values(axisDelta).reduce((sum, value) => sum + (Number(value) || 0), 0) * (Number(influenceWeight) / 10));
}
