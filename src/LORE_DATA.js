// LORE_DATA.js — code-owned mythology and deep history reference.
// Claude reads from this when narrating regional lore, NPC beliefs,
// or history. Claude does not invent conflicting details for regions
// covered here — if something isn't in this file yet, it's open for
// Claude to narrate freely, but anything listed below is fixed canon.

export const LORE_DATA = {
  forest: {
    displayName: "The Heavy Forest / Rainforest",
    pantheon: [
      {
        name: "Thaelor, the All-Root",
        domain: "Creation, withdrawal",
        summary: "First among the old gods, said to have planted the World-Root. Not worshipped directly — invoked only at Ring-bindings. Elven teaching holds he withdrew from the world the moment the World-Root took hold, leaving it to grow and remember on its own."
      },
      {
        name: "Kaelbrond, the Storm-Bough",
        domain: "Thunder, oath-breaking, violent change",
        summary: "Elves swear their most serious vows 'beneath Kaelbrond's branch.' A broken vow is believed to draw his lightning to the oathbreaker's entire bloodline, not just the individual."
      },
      {
        name: "Lissara and Faendral, the Twinned Boughs",
        domain: "Growth, harvest, love, fertility",
        summary: "Twin deities whose blessing is believed to depend on a bloodline's Ring staying 'true' — unbroken, unmixed, faithfully counted. The Sern Circle attributes the Long Quiet to the Twins growing quiet toward the Elves, not to any natural decline."
      },
      {
        name: "Vrackul, the Root-Eater",
        domain: "Devouring, unraveling, the end of things",
        summary: "A wolf-shaped entity said to be bound beneath the World-Root since before the first Ring was counted. Prophecy holds that when the World-Root's oldest heartwood withers, Vrackul's binding withers with it, beginning 'the Unraveling.' No elder will define this term fully. Several privately believe it has already begun."
      }
    ],
    customs: [
      {
        name: "The Ring ceremony",
        summary: "When an elf comes of age, their bloodline elder ties a cord of dyed heartwood fiber around the family's oldest living tree, marking that generation's Ring. The cord's color, knot pattern, and placement encode births, deaths, marriages, and broken oaths. A trained elder can 'read' a family's full history from its cords. Losing a cord, or losing the person who can read it, is treated as erasing a vow the Twins were keeping track of — a form of death worse than dying."
      },
      {
        name: "Bloodline purity doctrine",
        summary: "The Sern Circle's resistance to outsiders is a religious position, not simple superiority: marrying outward is believed to dilute a bloodline's 'wyrd' (its destined thread within the World-Root), making it illegible to the Twins. This is why the Sern believe the Long Quiet began with the Twins' blessing thinning — not with an ordinary biological cause."
      }
    ],
    history: [
      {
        name: "The Long Quiet",
        summary: "Roughly six or seven generations ago, a large portion of the youngest Elves stopped having children, with no plague or war to explain it. The Sern Circle privately believes this coincided with several of the oldest heartwood groves ceasing to grow new Rings."
      },
      {
        name: "The Sern/Veyanth split",
        summary: "Two generations ago, Faelar Veyanth's line broke from the Sern, reinterpreting the Long Quiet as the Twins' grief over a wyrd already unraveling on its own — not punishment for impurity. Their solution is to marry and ally outward, weaving new thread into a fraying wyrd before nothing is left to weave. The Sern see this as blasphemy against the Twins. The conflict is understood in-world as grief, not hatred — both sides agree the Twins have gone quiet, they disagree on why and what to do about it."
      },
      {
        name: "The Hollow Kin's withdrawal",
        summary: "Elder Ysenne led her followers into the deep hollows generations before the Sern/Veyanth split existed, following what oral history only calls 'the Grief no one else was willing to carry.' Fragmentary Hollow Kin tradition suggests she went looking for Vrackul's binding herself, to see whether it was fraying. What she found is never spoken of. She returned changed enough that even Sern elders treat her as closer to an oracle than an elf."
      }
    ],
    mysteries: [
      {
        name: "The World-Root and the Undersong",
        summary: "The World-Root is believed to be the source of all magic on Vaelmarr, not just Elven magic — its threads run beneath the whole continent as a network the Elves call the Undersong, which every caster of any race draws from, knowingly or not. A hidden order within the Sern Circle, sometimes called Rootwardens, exists solely to ritually tend the Undersong so it keeps flowing beyond the Forest. This order is shrinking along with the general Elf population, meaning the Long Quiet may be a slow-building problem for magic across the entire world, not just an Elven one. Almost no one outside the Forest knows this."
      },
      {
        name: "The Elder Grove Ruins",
        summary: "The oldest heartwood grove, privately believed by Sern elders to be the World-Root itself, or what remains of it after something wounded it generations ago. Contains the oldest Ring-cords in existence, which no living elder can fully read. The Sern actively discourage travel there."
      }
    ]
  },

  mountains: {
    displayName: "The Mountains",
    values: [
      {
        name: "Honest wealth",
        summary: "Dwarves are unapologetically focused on wealth and hard bargaining, but the one thing that gets a Dwarf permanently cast out of guild life isn't greed — it's an unpaid debt or a broken vow. Common saying: 'Count the gold twice. Count the oath once — it doesn't need a second count.'"
      },
      {
        name: "Oath-iron",
        summary: "Every serious Dwarven promise — marriage, guild contract, blood debt — is sealed by forging a small iron band, worn until the oath is fulfilled. Breaking the oath means the band is publicly broken at the forge where it was made, in front of guild witnesses — considered far worse than any financial loss."
      }
    ],
    history: [
      {
        name: "Founding of the High Forge",
        summary: "The first clan-holds broke through the mountain's northern face and found a cavern system already threaded with unusual ore veins. Dwarves interpreted this as a debt owed to whatever shaped the mountain that way. Early guild oaths were framed as repayment — every ingot forged was symbolically a partial payment on a debt no Dwarf could ever fully settle. This is the origin of the Age of Anvils' guiding principle: whoever forges the most honest wealth from the mountain's gift earns the loudest voice."
      },
      {
        name: "The Ironbrand/Emberwright split",
        summary: "Originally one guild, founded by a master smith whose name is now largely ceremonial. Split not over ideology but over two poles of dwarven honor: Ironbrand's founders believed honest wealth meant volume (turning the mountain's gift into value for the most people); Emberwright's founders believed it meant mastery (a single masterwork piece repaying the debt better than a thousand ordinary ones). Neither side considers the other dishonest — the rivalry has never curdled into real hostility across five generations because it's an unresolved argument between two honest answers to the same question."
      }
    ],
    mysteries: [
      {
        name: "The Deep Chorus",
        summary: "Rune magic does not come from ore itself, but from something bound beneath it since before the first clan-hold broke through the mountain's northern face — a multitude of ancient, half-aware voices the Dwarves call the Deep Chorus. It is not worshipped as a god, but treated with the same caution as one. Every rune inscribed into a weapon, armor piece, or golem core is a fragment of the Chorus coaxed loose and bound into metal by a Dwarven order called the Deepsingers, tied to Deepwarden Hold."
      },
      {
        name: "The fraying seal",
        summary: "Every rune forged very slightly loosens the Deep Chorus's seal. Five generations of expanding rune-work by Ironbrand and Emberwright have unknowingly borrowed against a debt the mountain can't visibly see accruing. Deepwarden Hold's neutrality in the guild rivalry is not just old-oath solemnity — they are the only ones who know the ledger is going negative. Almost no one outside Deepwarden Hold knows this."
      },
      {
        name: "The Sunken Foundry",
        summary: "The site of the oldest oath-iron in the mountain, one nobody currently living has seen unforged. Officially closed due to unstable tunnels; unofficially believed to be the source of the original bargain with the Deep Chorus. Kessa Ironvein's exile from Emberwright was over a technique reforging metal recovered from beneath the Foundry's sealed levels — which, given Deepwarden's silence, suggests the guilds are quietly avoiding finding out what she found down there."
      }
    ]
  },

  coast: {
    displayName: "The Coast / Archipelago",
    pantheon: [
      {
        name: "Amphira, the Tideward",
        domain: "Luck, tides, safe passage",
        summary: "Invoked with the toll-toss: a coin and a pinch of salt flicked overboard before any voyage. Skipping it isn't forbidden, just bad form — a captain who skips it and has a rough voyage will hear about it from the crew for years."
      },
      {
        name: "Proteon, the Bound Tongue",
        domain: "Trade, contracts, fair dealing",
        summary: "Halfling oaths are sealed as 'blooded contracts' — ink mixed with the signer's own blood, witnessed. The belief is that a promise only becomes real once physically bound, echoing old stories of Proteon being forced to speak truth only once caught and held fast. Breaking a blooded contract is believed to sour a merchant's luck with Amphira permanently."
      },
      {
        name: "Ketara, the Deep Mother",
        domain: "The unknown depths, sea monsters",
        summary: "Rarely worshipped outright — an old sailor's belief that something ancient sleeps in the trenches past the shelf. Most educated Halflings call it superstition. Older captains dislike hearing that said too loudly on open water."
      }
    ],
    customs: [
      {
        name: "The First Fathom",
        summary: "The coming-of-age rite: at a certain age, every Halfling child takes their first voyage past the harbor markers, alone at the tiller for at least one stretch, with a silent adult aboard. Less about sailing skill, more about proving they can sit with the sea's uncertainty without panicking."
      },
      {
        name: "Blooded contracts",
        summary: "See Proteon above. Ink and blood, always witnessed, treated as sacred and legally binding within Halfling trade culture."
      }
    ],
    history: [
      {
        name: "From hamlets to oligarchy",
        summary: "Saltmere, Tidewatch, and Duskhaven began as fishing hamlets. The turn to trade-empire status came when magically-touched cargo — spent Mountain rune-work, Undersong-resonant Forest scavenge — was found to fetch enormous prices from buyers with no other access to it. The ports became the continent's middlemen for magic itself, producing none of their own."
      },
      {
        name: "The wreck of the Amphira's Due",
        summary: "Two generations ago, a Saltmere trade vessel went out past the shelf chasing rumor of Forest-touched scavenge from a wrecked Elven trade envoy, and returned nine days later with two-thirds of its crew, none of whom would fully describe what happened to the rest. Survivor accounts agreed on only two details: something vast, and a compass that would not stop spinning. The ship was quietly scrapped within the month. The Corrin family, who owned her, has never fully explained why."
      }
    ],
    mysteries: [
      {
        name: "The Fathoms Rot",
        summary: "Enchanted cargo does not stay stable forever — spent rune-work and expired Undersong-touched goods eventually go inert or curdle. Proper disposal is slow and expensive. For generations, the cheaper practice has quietly been to dump such waste deep past the shelf, where no official oversight looks."
      },
      {
        name: "Duskhaven's real business",
        summary: "Officially, Duskhaven is 'shadier trade, less-legal, denied by all, used by all as neutral ground.' In truth, it is where the dumping contracts are actually brokered, quietly blooded and sealed like any other trade deal, never entered into Saltmere or Tidewatch's official ledgers. 'The Broker' personally handles most of these arrangements, which is part of why their identity is kept so carefully unconfirmed."
      },
      {
        name: "Captain Merrow's silence",
        summary: "Merrow takes contracts from all three coastal powers and holds loyalty to none, usually read as mercenary charm. In truth, Merrow was a surviving crew member of the Amphira's Due and never told the full story. Merrow will always find a professional-sounding reason to decline any contract requiring travel toward open trench water, without ever admitting why."
      },
      {
        name: "Ketara, reconsidered",
        summary: "Decades of dumped magical waste may have been slowly saturating something already resting in the deep. If Ketara is real, she may not have started as a threat — she may have been made into one, the same way Dwarven rune-work quietly borrows against the Deep Chorus, and Elven neglect quietly starves the Undersong."
      }
    ]
  },

  tundra: {
    displayName: "The Frozen North / Tundra",
    beliefSystem: [
      {
        name: "The Hallowed Kin",
        summary: "Tundra humans do not worship gods in the way the Heartlands or Forest do. They believe their ancestors, the Hallowed Kin, walk alongside the living, most present during the hardest winters, guiding descendants through dreams or a felt presence in a whiteout. One does not pray to a Hallowed Kin so much as listen for one."
      },
      {
        name: "The Old Cold",
        summary: "The land itself, understood as an indifferent force rather than a god or a villain — it will kill you exactly as readily as it will test you. Northerners do not resent the Old Cold; resenting weather is considered soft Southern thinking. You respect it, prepare for it, and never assume you have beaten it permanently."
      }
    ],
    values: [
      {
        name: "Earned toughness",
        summary: "Northerners are genuinely hardier than Southerners, and the culture treats this as earned rather than innate luck. Children are exposed to real cold and hardship from a young age because comfort is believed to soften a body the same way it softens resolve. A Northerner who has never been tested is considered unfinished regardless of age. This is the root of the North's warrior reputation — physical toughness is a basic requirement for being taken seriously at all."
      },
      {
        name: "Scar-oaths",
        summary: "Where Dwarves bind vows in iron and Elves bind them in Ring-cords, Northerners bind theirs in their own skin. A major vow, great feat, or blood debt earns a warrior a deliberate scar, placed and shaped with meaning, sometimes re-opened and re-marked at key life moments. A Northerner's scars are readable, the same way a Ring-cord is — their whole life visible to anyone who knows how to read the pattern."
      }
    ],
    customs: [
      {
        name: "Saga-Binders",
        summary: "Every clan keeps one person whose sole duty is memorizing and performing the clan's full saga at hearth-gatherings — every notable deed, death, feud, and debt, sung rather than written. Losing a Saga-Binder without a trained successor is treated as the clan forgetting who it is."
      },
      {
        name: "The Frostvigil",
        summary: "The coming-of-age rite: on the coldest night of the year, a youth sits alone beside a deliberately small hearth fire, with barely enough fuel to last till dawn if tended perfectly. The task is discipline, not wilderness survival — keeping the coals alive through the whole night alone. Northern belief holds the Hallowed Kin are most likely to visit during a Frostvigil. Failing does not mean death, but a youth who lets the fire die is quietly and permanently regarded as untested."
      }
    ],
    history: [
      {
        name: "The First Winter and the founding of the three clans",
        summary: "Generations back, a multi-year winter and famine remembered as the First Winter nearly destroyed the North entirely. Survival split into two answers: pull inward and rely on nobody (the philosophy behind Clan Ashgrim), or reach south for trade and aid even at the cost of pride (the philosophy behind Clan Wintermere). Chieftain Torvald's line, now Drake's Hollow, held both factions together through the crisis without fully siding with either — the reason Drake's Hollow still holds first-among-equals status today. The Ashgrim/Wintermere rivalry is the First Winter's original argument, unresolved, with different faces on it now."
      }
    ],
    reputation: [
      {
        name: "The Unclanned",
        summary: "The three great clans are structured, disciplined, oath-and-saga societies, not raiders. Over generations, individuals and small bands who could not or would not live under any clan's authority have broken off entirely, forming warbands with no Saga-Binder and no scar-oath tradition anyone honors. Having lost the thing Northern culture values most — being remembered — the Unclanned often lean fully into fear and violence as the only legacy left available to them. They are the ones who actually raid and terrorize southern caravans, and the three clans deeply resent being lumped in with them; a Northerner from one of the three clans is insulted not by being called tough, but by being compared to the Unclanned specifically."
      }
    ],
    mysteries: [
      {
        name: "Vaerakk, the Hollow Cold",
        summary: "An old, mostly-forgotten belief that something ancient and aware is bound beneath the deepest permafrost past the Frostgate — not the Old Cold itself, but something the Old Cold was partly shaped to contain. Most Northerners treat this as an old scare-story."
      },
      {
        name: "The lengthening winters",
        summary: "Within living memory, winters have grown measurably harsher and started earlier than the oldest Saga-Binders' records say they should. Most clans blame bad luck or Southern meddling with trade routes. A handful of the oldest Saga-Binders quietly believe the First Winter never fully ended, and that Vaerakk's binding may be the only reason it hasn't worsened further. The Frostgate is where caravans report the strangest cold, and where fewer of them turn back each season than they used to."
      }
    ]
  }

};
