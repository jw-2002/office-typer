// The goblin mode scenarios: documents that are entirely about goblins, used only while goblin mode is on (along with the
// other goblin scenarios in the normal pools). Same rules as scenarios.ts (the tests check them), and every one stays
// family friendly and is told completely straight.
import type { Scenario } from "./scenarios";

// Tier 1: short plain words, almost no punctuation, no digits, no contractions.
export const goblinIntern: readonly Scenario[] = [
  {
    id: "goblin-feast",
    kind: "email",
    title: "The goblin feast in the kitchen",
    opening: [
      "Hi {name}, the goblins have taken over the kitchen for a feast.",
      "Hello {name}, there is a goblin feast in the kitchen and you are on the list.",
    ],
    body: [
      "The goblins brought their own spoons and a very big pot.",
      "The pot is full of soup and nobody will say what is in it.",
      "{name2} tried a spoonful and said it tasted of old socks.",
      "The goblins thought that was a lovely thing to say.",
      "There is a goblin on top of the fridge guarding the biscuits.",
      "The goblins sing a loud song each time the kettle boils.",
      "One goblin has eaten a whole jar of pickles and is very proud.",
      "{dept} says goblins are not allowed to use the microwave.",
      "The goblins use the microwave anyway and cheer when it beeps.",
      "The feast will go on until {day} or until the soup runs out.",
    ],
    closing: ["Please bring a bowl and do not ask about the soup.", "Thank you and please clap for the goblins."],
  },
  {
    id: "goblin-lost-sock",
    kind: "memo",
    title: "Notice: goblins and the missing socks",
    opening: [
      "Dear all, a goblin has been taking the socks from the lost box.",
      "Hello team, we have found out who is taking the odd socks.",
    ],
    body: [
      "The goblin lives in the ceiling above the printer.",
      "The goblin wears a sock on each ear and one on its nose.",
      "{name} saw the goblin at midnight with a sack full of socks.",
      "The goblin says the socks are for a big party in the walls.",
      "A goblin party needs a lot of socks and some very warm toes.",
      "We have left a note asking the goblin to take only odd socks.",
      "The goblin wrote back in green crayon and spelled it wrong.",
      "{dept} has agreed to give the goblin a small desk in return.",
      "The desk is a shoebox and the goblin is very pleased with it.",
      "Please check your feet before you walk past the ceiling.",
    ],
    closing: ["Thank you for sharing your socks with the goblins.", "Please be kind to the goblin and its ears."],
  },
  {
    id: "goblin-night-shift",
    kind: "email",
    title: "The goblins on the night shift",
    opening: [
      "Hi {name}, the goblins have started a night shift in the office.",
      "Hello {name}, I need to tell you what the goblins do after we go home.",
    ],
    body: [
      "The goblins come out of the walls when the lights go off.",
      "They type very fast on all the keyboards at once.",
      "Most of what they type is the word goblin over and over.",
      "{name2} found a whole report written in goblin on {day}.",
      "The report was very good and had no spelling mistakes.",
      "The goblins tidy the desks and then mess them up again.",
      "A goblin was seen sliding down the banister on a tray.",
      "The goblin boss wears a tiny hat and carries a tiny clipboard.",
      "{dept} says the goblins are the best staff we have ever had.",
      "The goblins ask for nothing but biscuits and a quiet corner.",
    ],
    closing: ["Please leave a biscuit out when you go home.", "Thank you and goodnight to the goblins."],
  },
];

// Tier 2: commas, apostrophes, capitals and numbers.
export const goblinAssociate: readonly Scenario[] = [
  {
    id: "goblin-expenses",
    kind: "email",
    title: "Your expenses, and the goblin who filed them",
    opening: [
      "Hi {name}, I'm writing about the expenses claim that a goblin filed in your name.",
      "Hello {name}, we've received {n} receipts, all of them from a goblin.",
    ],
    body: [
      "The receipts are for shiny buttons, a small crown, and {q} bags of mud.",
      "The goblin has written 'client lunch' next to the mud.",
      "{name2} says the goblin was extremely polite on the phone, and a little sticky.",
      "The goblin has asked to be paid in buttons, because 'money is boring'.",
      "{dept} can confirm that mud is not a valid expense, however shiny.",
      "The crown, however, is being reviewed by a committee.",
      "The goblin has attached a drawing of itself, to prove it was there.",
      "In the drawing, the goblin is holding a very large spoon.",
      "Please don't reply to the goblin, as it will only invoice you for the stamps.",
      "A decision on the buttons will be made by {day}, probably in a damp room.",
    ],
    closing: [
      "Thank you, and please keep your receipts away from the goblins.",
      "Kind regards, {name2}, who is hiding in the stationery cupboard.",
    ],
  },
  {
    id: "goblin-trade-fair",
    kind: "memo",
    title: "The goblin trade fair, and where to put the tables",
    opening: [
      "Dear all, the goblin trade fair will be held in our lobby on {day}.",
      "Hello team, please note that {n} goblins will be arriving with stalls.",
    ],
    body: [
      "Each goblin stall will sell one thing: shiny, sticky, or loud.",
      "{name} has volunteered to guard the till, and the till's feelings.",
      "The goblins have asked for {q} extra tables and a very long rope.",
      "Please don't buy anything that blinks, as it may be listening.",
      "{dept} has issued each of us a small bell, in case a deal goes wrong.",
      "The goblin who sells hats will, of course, be wearing all of them.",
      "Cash isn't accepted, but old keys, spoons and buttons are.",
      "A goblin band will play near the lifts, on instruments of unknown origin.",
      "Anything you buy must be taken home by {day}, or it will follow you.",
      "The fair has been given a licence, and the licence has been given a hat.",
    ],
    closing: [
      "Thank you for welcoming our guests, and for keeping your keys close.",
      "Please see {name2} with any questions, but not before lunch.",
    ],
  },
  {
    id: "goblin-meeting-minutes",
    kind: "report",
    title: "Minutes of the goblin all-hands",
    opening: [
      "Minutes: the goblin all-hands was held on {day} in the broom cupboard.",
      "Summary: {n} goblins attended the meeting, and {q} of them were in charge.",
    ],
    body: [
      "The chair, a goblin in a very small tie, called the meeting to order, then to disorder.",
      "Item one was the biscuits, which were discussed, and then eaten.",
      "{name} was thanked for 'looking the other way', in a warm and slightly damp round of applause.",
      "A goblin asked whether the cupboard could be bigger, and was told to 'think smaller'.",
      "{dept} was blamed for the smell, which, for once, wasn't their fault.",
      "A motion to ban the colour beige passed by {n} votes to none.",
      "The treasurer reported that the treasury is 'a bucket, and it's full'.",
      "It was agreed that all future meetings will start with a loud shout.",
      "A goblin fell asleep during the minutes, and was recorded as 'present, but dreaming'.",
      "The meeting closed when the broom fell over, which was taken as a vote.",
    ],
    closing: [
      "Minutes taken by {name2}, who was mostly under the table.",
      "The next goblin all-hands will be announced when the goblins feel like it.",
    ],
  },
];

// Tier 3: full punctuation, brackets, quotes, symbols and longer words.
export const goblinManager: readonly Scenario[] = [
  {
    id: "goblin-merger",
    kind: "report",
    title: "Project Gobble: the proposed merger with the goblins",
    opening: [
      "Subject: Project Gobble; a proposed merger between this company & the goblins of the East Wing.",
      "Summary: on {day}, the board was approached by {n} goblins, who 'want a seat at the table (and the table)'.",
    ],
    body: [
      "The goblins have offered {n} sacks of shiny things in exchange for 'a controlling interest in snacks'.",
      "{name}, our Head of Synergy, described the offer as 'deeply damp, but promising'.",
      "Due diligence has found that the goblins' balance sheet is 'mostly buttons, with some mud'.",
      "{dept} has raised concerns about the goblins' plan to 'eat the competition (literally)'.",
      "The goblin negotiator insists on being paid in 'stories, spoons & stolen hats'.",
      "Legal has noted that the contract is written in green ink & smells of onions.",
      "Under the terms, all employees would become 'honorary goblins' (hats are provided).",
      "The goblins have promised not to chew the cables 'more than twice a week'.",
      "Shareholders are advised to 'hold on to their hats', as the goblins will not.",
      "A final decision is expected by {day}, or whenever the goblins stop laughing.",
    ],
    closing: [
      "Recommendation: proceed with caution, & lock the stationery cupboard.",
      "Please direct all questions to {name2} (who has, regrettably, already signed).",
    ],
  },
  {
    id: "goblin-audit",
    kind: "memo",
    title: "Audit findings: the goblin in the ceiling void",
    opening: [
      "Dear all, the annual audit has identified a goblin living in the ceiling void above {dept}.",
      "Hello team, please note the following findings from the audit of the third floor.",
    ],
    body: [
      "The goblin has been in residence for approximately {n} months, without a lease or a lanyard.",
      "It has furnished the void with a bed, a bookshelf & {q} stolen chairs.",
      "{name} confirms that the goblin pays 'a modest rent, in biscuits & riddles'.",
      "The audit found no evidence of fraud, but 'a great deal of glitter'.",
      "The goblin's 'home office' is not compliant with fire regulations (it has a candle).",
      "Several staff reported 'faint singing' during quarter-end, & 'a smell of cheese'.",
      "The goblin has applied for a parking permit, although it does not own a car.",
      "{dept} recommends a formal 'goblin onboarding', including a name badge & a small mug.",
      "No action will be taken against the goblin, provided it 'keeps the noise down'.",
      "A follow-up audit is planned for {day}, subject to the goblin's availability.",
    ],
    closing: [
      "Thank you for your cooperation, & for not poking the ceiling.",
      "Questions may be sent to {name2}, or slipped through the ceiling tiles.",
    ],
  },
  {
    id: "goblin-crisis-plan",
    kind: "report",
    title: "Contingency plan: what to do when the goblins take the lift",
    opening: [
      "Subject: Contingency plan #{n}; the goblins have taken control of the lift (again).",
      "Summary: at approximately midday on {day}, {q} goblins boarded the lift & pressed every button.",
    ],
    body: [
      "Step one: remain calm, & do not make eye contact with the goblin holding the buttons.",
      "Staff should not attempt to 'negotiate with the music', as the lift music is theirs now.",
      "{name} has volunteered to take the stairs, & to take a very long time about it.",
      "The lift will stop at every floor, & at several floors that do not exist.",
      "{dept} has prepared a statement: 'we are aware of the situation, & of the goblins'.",
      "Please do not feed the goblins; they have, in fact, brought sandwiches.",
      "Anyone stuck inside may be asked to 'judge a dance contest' (the scores are final).",
      "A small goblin will, at some point, ask for 'the password' (it is 'biscuit').",
      "Once released, passengers should report to reception for a sticker & a cup of tea.",
      "The goblins have promised to give the lift back 'on {day}, or sooner, or never'.",
    ],
    closing: [
      "Recommendation: carry exact change in buttons, & keep your hat on.",
      "Please report any further goblin activity to {name2} (in the stairwell, probably).",
    ],
  },
];
