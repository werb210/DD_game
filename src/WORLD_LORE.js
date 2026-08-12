// Static, player-facing compendium lore. This is code-owned canon: the narrator does not generate it.
const faction = (id, name, leaderTitle, leaderName, trait, details = {}) => ({ id, name, leaderTitle, leaderName, trait, description: "", ...details });
const entry = (name, description) => ({ name, description });

export const WORLD_LORE = [
  {
    regionId: "heavy_forest", regionName: "Forest", dominantRace: "Elf", racePercent: "~60%, declining",
    politicalStructure: "Closed elder council; memory-as-wealth",
    pantheon: [
      { name: "Thaelor", title: "the All-Root", description: "first among the old gods, said to have planted the World-Root. Invoked only at Ring-bindings; teaching holds he withdrew from the world once the World-Root took hold." },
      { name: "Kaelbrond", title: "the Storm-Bough", description: "god of thunder, oath-breaking, violent change. Serious vows are sworn \"beneath Kaelbrond's branch\"; a broken vow is believed to draw his lightning to the oathbreaker's whole bloodline." },
      { name: "Lissara and Faendral", title: "the Twinned Boughs", description: "twin deities of growth, harvest, love, and fertility. Their blessing is believed to depend on a bloodline's Ring staying \"true\" — unbroken, unmixed, faithfully counted." },
      { name: "Vrackul", title: "the Root-Eater", description: "a wolf-shaped entity bound beneath the World-Root since before the first Ring was counted." },
    ],
    customs: [
      entry("The Ring ceremony", "a cord of dyed heartwood fiber tied around the family's oldest living tree at coming-of-age, encoding births, deaths, marriages, and broken oaths. A trained elder can \"read\" a family's full history from its cords."),
      entry("Bloodline purity doctrine", "a religious position, not simple superiority: marrying outward is believed to dilute a bloodline's \"wyrd\" (its destined thread within the World-Root), making it illegible to the Twins."),
    ],
    history: [
      entry("The Long Quiet", "six or seven generations ago, a large portion of the youngest Elves stopped having children, no plague or war involved. Coincided with several of the oldest heartwood groves ceasing to grow new Rings."),
      entry("The Sern/Veyanth split", "two generations ago, Faelar Veyanth's line broke from the Sern, reinterpreting the Long Quiet as the Twins' grief over a wyrd already unraveling on its own, not punishment for impurity."),
      entry("The Hollow Kin's withdrawal", "Elder Ysenne led her followers into the deep hollows generations before the Sern/Veyanth split, following \"the Grief no one else was willing to carry.\""),
    ],
    factions: [faction("sern_circle", "Sern Circle", "Eldest", "Thalindra Sern", "oldest/conservative, runs the elder council"), faction("veyanth_line", "Veyanth Line", "Ambassador", "Faelar Veyanth", "pushes outside engagement, seen as radical"), faction("hollow_kin", "Hollow Kin", "Elder", "Ysenne", "withdrawn even from council, unsettling, knows something")],
    wildcard: { name: "Lirien Half-Kin", trait: "half-elf/half-human, rejected by Sern, used as symbol by Veyanth, resents both, moves freely" },
  },
  {
    regionId: "mountains", regionName: "Mountains", dominantRace: "Dwarf", racePercent: "~65%",
    politicalStructure: "Guild-based (forge-guilds/clan-holds), High Forge Council; craft-as-legacy",
    customs: [entry("Honest wealth", "Dwarves are unapologetically focused on wealth and hard bargaining, but the one thing that gets a Dwarf permanently cast out of guild life is an unpaid debt or a broken vow. \"Count the gold twice. Count the oath once — it doesn't need a second count.\""), entry("Oath-iron", "every serious promise is sealed by forging a small iron band, worn until fulfilled. Breaking the oath means the band is publicly broken at the forge where it was made.")],
    history: [entry("Founding of the High Forge", "the first clan-holds broke through the mountain's northern face and found a cavern system already threaded with unusual ore veins. Interpreted as a debt owed to whatever shaped the mountain that way."), entry("The Ironbrand/Emberwright split", "originally one guild, split over two poles of dwarven honor: Ironbrand (honest wealth = volume) vs. Emberwright (honest wealth = mastery). Neither considers the other dishonest.")],
    factions: [faction("ironbrand_guild", "Ironbrand Guild", "Guildmaster", "Torvin Ironbrand", "largest/richest"), faction("emberwright_clanhold", "Emberwright Clanhold", "Master Smith", "Dagna Emberwright", "most skilled"), faction("deepwarden_hold", "Deepwarden Hold", "Warden", "Brokk Deepwarden", "controls the deep tunnels, secretive/neutral")],
    wildcard: { name: "Kessa Ironvein", trait: "guildless, exiled from Emberwright for heretical salvaged-metal technique" },
  },
  {
    regionId: "coast", regionName: "Coast / Archipelago", dominantRace: "Halfling", racePercent: "~50%",
    politicalStructure: "Port-city oligarchy (trade families/guild-captains); port-vs-port rivalry",
    pantheon: [
      { name: "Amphira", title: "the Tideward", description: "goddess of luck, tides, safe passage. Invoked via the toll-toss: coin and salt flicked overboard before any voyage." },
      { name: "Proteon", title: "the Bound Tongue", description: "god of trade and contracts. Halfling oaths are \"blooded contracts\" — ink mixed with the signer's blood, witnessed." },
      { name: "Ketara", title: "the Deep Mother", description: "feared, rarely worshipped outright; belief that something ancient sleeps in the trenches past the shelf." },
    ],
    customs: [entry("The First Fathom", "coming-of-age rite: first voyage past the harbor markers, alone at the tiller for at least one stretch, adult aboard but silent."), entry("Blooded contracts", "ink and blood, witnessed, sacred. Breaking one is believed to sour a merchant's luck with Amphira permanently.")],
    history: [entry("From hamlets to oligarchy", "Saltmere, Tidewatch, and Duskhaven began as fishing hamlets, turned trade-empire when magically-touched cargo was found to fetch enormous prices."), entry("The wreck of the Amphira's Due", "two generations ago, a Saltmere vessel chasing rumor of Forest-touched scavenge returned nine days later with two-thirds of its crew, none willing to fully describe what happened.")],
    factions: [faction("saltmere_corrin", "Saltmere/Corrin Trading House", "Magnate", "Pell Corrin", "wealthiest/established, complacent"), faction("tidewatch_fenwick", "Tidewatch/Fenwick Concern", "Upstart", "Wren Fenwick", "aggressive upstarts, hungry"), faction("duskhaven", "Duskhaven", "", "\"The Broker\" (identity unknown)", "shadier trade, denied officially")],
    wildcard: { name: "Captain Merrow", trait: "no port allegiance, charming but untrustworthy" },
  },
  {
    regionId: "tundra", regionName: "Tundra", dominantRace: "Human (Northern culture)", racePercent: "~60%",
    politicalStructure: "Clan-chieftain structure; internal resource rivalries; frontier tone",
    beliefSystem: [entry("The Hallowed Kin", "ancestors who walk alongside the living, most present in the hardest winters, felt rather than prayed to."), entry("The Old Cold", "the land itself, an indifferent force respected rather than resented or worshipped.")],
    customs: [entry("Earned toughness", "Northerners are genuinely hardier than Southerners because children face real cold/hardship young. An untested Northerner is unfinished regardless of age."), entry("Scar-oaths", "vows bound in deliberate, meaningful scars, sometimes re-marked at key life moments."), entry("Saga-Binders", "one person per clan whose sole duty is memorizing/performing the clan's full saga, sung not written."), entry("The Frostvigil", "coming-of-age rite: tending a deliberately small hearth fire alone through the coldest night, barely enough fuel to last till dawn.")],
    history: [entry("The First Winter", "a multi-year winter/famine nearly destroyed the North, splitting the clans into Ashgrim (isolationist) and Wintermere (pro-Southern-trade). Chieftain Torvald's line (now Drake's Hollow) held both together without fully siding with either."), entry("The Unclanned", "individuals/bands who couldn't live under any clan's disciplined oath-and-saga structure broke off entirely; the actual raiders outsiders wrongly associate with \"the North.\"")],
    factions: [
      faction("drakes_hollow", "Drake's Hollow", "Chieftain", "Torvald Drake's Hollow", "largest, first-among-equals, steady unifier", {
        sigil: "The Elk (totem, not heraldic)",
        words: "We Hold, We Endure",
        familyMembers: [
          { name: "Chieftain Torvald", role: "Chieftain" },
          { name: "Freya", role: "Daughter, trained successor", description: "Some elders are quietly uneasy the first-among-equals seat may pass to a woman for the first time." },
          { name: "Ollan", role: "Saga-Binder", description: "Keeper of the full, uncut First Winter history." },
        ],
      }),
      faction("ashgrim", "Ashgrim", "Chieftain", "Hilda Ashgrim", "hardest, isolationist, distrusts Heartlands", {
        sigil: "The Wolf (totem)",
        words: "Ice Does Not Bend",
        familyMembers: [
          { name: "Chieftain Hilda", role: "Chieftain" },
          { name: "Kaldur", role: "Son", description: "Raised even harder than his mother was, resents Wintermere more than she does." },
          { name: "Brynja", role: "Elder Saga-Binder", description: "Keeps the rivalry's original grievance alive through the sagas." },
        ],
      }),
      faction("wintermere", "Wintermere", "Chieftain", "Bjorn Wintermere", "pro-Southern-trade, seen as compromising by Ashgrim", {
        sigil: "The Raven (totem)",
        words: "The Bending Branch Outlives the Storm",
        familyMembers: [
          { name: "Chieftain Bjorn", role: "Chieftain" },
          { name: "Stigr", role: "Brother, trade-envoy", description: "Handles actual negotiation with Heartlands/Coast merchants." },
          { name: "Runa", role: "Warrior", description: "Real scar-oaths earned in real danger — a living rebuttal to Ashgrim's accusation that Wintermere has gone soft." },
        ],
      }),
      faction("skarrow", "Clan Skarrow", "", "", "", {
        sigil: "The Snow-Hare (totem)",
        words: "We Are Not Where You Look",
        description: "Semi-nomadic, follows the herds rather than holding a fixed seat, making them naturally elusive and neutral in Tundra politics.",
        governance: "Led by council vote among clan elders, decided purely on what best serves the people right now — no bloodline, no permanent seat of power. This is structurally different from the other three clans' hereditary Chieftain model, and explains why Skarrow stays neutral: their leadership never sits still long enough to develop entrenched rivalries.",
      }),
    ],
    wildcard: { name: "\"The Wintermere Orphan\"", trait: "raised by no clan, hunter-for-hire, conflicted loyalty" },
  },
  {
    regionId: "desert", regionName: "Desert", dominantRace: "Dragonborn", racePercent: "~55%",
    politicalStructure: "Merchant-clan confederacy; reputation/word-as-bond; Oath-Blade culture built on personal honor/dueling",
    pantheon: [{ name: "Ashra", title: "the Sun-Wyrm", description: "the first dragon, said to have breathed the desert's sun into the sky and cracked the earth into dunes with her wingbeats. Believed to still burn faintly inside every dragonborn's bloodline." }, { name: "Vaeloth", title: "the Truth-Scale", description: "god of oaths, honesty, trade. Breaking a vow dims your inner ember before Vaeloth — a private, not public, consequence." }, { name: "Karneth", title: "the Blade-Ember", description: "patron of ritual dueling; controlled, honorable violence used to settle truth, not conquest." }],
    customs: [entry("The Scale-Oath", "a vow sealed by ceremonially removing a scale, held by the other party until fulfilled."), entry("Duel-Law / the Oath-Blade tradition", "serious disputes settled by formal, witnessed, non-lethal ritual duel. Losing costs your position in the dispute, not your life.")],
    history: [entry("The Ember Accord", "the once-unified dragonborn confederation split into Clan Ashkavar (heritage-proud), Clan Nazreth (heritage-downplaying/business-first), and Clan Ithran (neutral broker) over how to use reputation as currency.")],
    factions: [faction("clan_ashkavar", "Clan Ashkavar", "Matriarch", "Sireth Ashkavar", "most powerful, heritage-proud"), faction("clan_nazreth", "Clan Nazreth", "Patriarch", "Corin Nazreth", "wealthy, downplays infernal ancestry"), faction("clan_ithran", "Clan Ithran", "Broker", "Yalis Ithran", "scrappy, opportunist, plays all sides")],
    wildcard: { name: "Rasha the Unclaimed", trait: "clanless caravan guide, unmapped routes, favors no clan" },
  },
  {
    regionId: "swamp", regionName: "Swamp", dominantRace: "Orc", racePercent: "~50%",
    politicalStructure: "Tribal-communal; competence-based leadership",
    beliefSystem: [entry("The Drowned Mother", "the swamp itself, a living hostile will, not prayed to for mercy, only fought and respected like a predator."), entry("The Sacred Rot", "the true sacred core of orc belief: the collective body of hard-won survival knowledge — diseases, monster weaknesses, death lessons. Losing a lesson is losing that life twice."), entry("The Condemned", "what swamp orcs call themselves. A Sisyphean identity: the fight against the Drowned Mother has no end, just the eternal push.")],
    customs: [entry("The Great Sacrifice", "after any serious loss, survivors ritually recount what happened and what was learned, adding it to the Sacred Rot."), entry("Tally-Keepers", "orcs per settlement who hold and pass down the Sacred Rot, preserving survival, not identity.")],
    history: [entry("The Long Rot", "a catastrophic outbreak generations back split survivors three ways over why it happened: Mireholt (outside knowledge/trade needed), Thornback (discipline had slipped, double down on tradition), Gravewater (moved into the worst-afflicted ground so they'd never be caught unprepared again).")],
    factions: [faction("mireholt", "Mireholt", "Chief", "Grask Mireholt", "largest, most trade, outsider-curious"), faction("thornback", "Thornback", "Elder", "Voth Thornback", "traditional, wary of outside ties"), faction("gravewater", "Gravewater", "Warden", "Ulka Gravewater", "closest to the worst danger, hardened/respected/neutral")],
    wildcard: { name: "Old Karsk", trait: "disowned by all, knows the worst places, shares grudgingly" },
  },
  {
    regionId: "heartlands", regionName: "Heartlands", dominantRace: "Human (Southern culture)", racePercent: "~70%",
    politicalStructure: "Noble houses under weak central monarchy; main political engine of the Age of Anvils",
    // TODO: Add the Heartlands pantheon, customs, and deep-history pass when those sections are written.
    // Volatile houses may rise, fall, or be added/removed through player choices and a future world-clock system; core houses remain structurally fixed.
    factions: [
      faction("house_ardenne", "House Ardenne", "King", "Edmure Ardenne", "weak crown", {
        sigil: "White stag on grey", words: "Steadfast We Endure", seat: "Ardenne Keep, in the capital, Sunhold", tier: "core",
        familyMembers: [
          { name: "King Edmure Ardenne", role: "King" },
          { name: "Crown Prince Aldric", role: "Heir", description: "Young and untested — a real succession worry under a Creed that judges steadfastness above bloodline." },
        ],
      }),
      faction("house_caswell", "House Caswell", "Lady", "Osanna Caswell", "wealthiest, patient, marriage-politics", {
        sigil: "Golden wheat sheaf on green", words: "Patience Reaps All", seat: "Goldmere Hall", tier: "core",
        familyMembers: [
          { name: "Lady Osanna Caswell", role: "Lady" },
          { name: "Seraphina Caswell", role: "Daughter", description: "Quietly being positioned as a match for Crown Prince Aldric — the literal mechanism of House Caswell's ambition toward the crown via marriage, not war." },
          { name: "Ser Halric Caswell", role: "Brother", description: "Discreetly building the House's first real private levy." },
        ],
      }),
      faction("house_draymoor", "House Draymoor", "Lord", "Rickart Draymoor", "martial, resents Caswell's wealth-influence", {
        sigil: "Crossed red war-hammer and spear on black", words: "Where We Strike, We Hold", seat: "Ironwatch", tier: "core",
        familyMembers: [
          { name: "Lord Rickart Draymoor", role: "Lord" },
          { name: "Ser Bram Draymoor", role: "Son", description: "Hot-headed, itching to prove himself." },
          { name: "Lady Wynn Draymoor", role: "Sister", description: "A ranking Warden of the Light, giving House Draymoor leverage inside the Faith itself." },
        ],
      }),
      faction("house_voss", "House Voss", "Alderman", "Voss", "minor/ambitious, holds Barrow's Cross", {
        sigil: "Grey heron over water", words: "We Rise Unseen", seat: "Barrow's Cross", tier: "core",
        familyMembers: [
          { name: "Alderman Voss", role: "Alderman" },
          { name: "Mirelle Voss", role: "Niece and heir", description: "Sharp, ambitious." },
          { name: "Ser Dennick Voss", role: "Cousin", description: "The House's only knight, embarrassingly under-equipped next to Draymoor's forces." },
        ],
      }),
      faction("house_ferrow", "House Ferrow", "", "", "", {
        sigil: "Black fox", words: "We Choose Wisely", seat: "Ferrow's Rest", tier: "volatile",
        description: "A minor house sitting on contested ground between Caswell and Draymoor territory, constantly forced to pick sides.",
      }),
      faction("house_talvane", "House Talvane", "", "", "", {
        sigil: "Crossed silver keys", words: "Every Door, A Price", seat: "Talvane's Landing", tier: "volatile",
        description: "A small house near the Coast border, punching above its weight as the overland trade link to Saltmere and Tidewatch.",
      }),
    ],
    wildcard: { name: "\"The Ledger\"", trait: "unnamed info-broker, sells secrets to all" },
  },
];
