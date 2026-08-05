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
  }
};
