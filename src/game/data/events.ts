// The little things that happen in the office while you work: a card going round, a collection, a lucky find. Each one
// is a few choices. Amounts are written as factors, and scaled by your pay multiplier when shown (see events.ts), so
// the cost of being generous keeps up with how well you are doing.

export type EventStat = "presents" | "cardsSigned";

export type EventChoice = {
  label: string;
  /** What it costs, as a multiple of the base amount (0 or left out for free). */
  cost?: number;
  /** What you are given, as a multiple of the base amount. */
  gain?: number;
  /** What happens next, shown after you choose. {slots} are filled in like assignment text. */
  result: string;
  /** Counters this choice adds one to. */
  stats?: readonly EventStat[];
};

export type OfficeEvent = {
  id: string;
  title: string;
  /** {slots} such as {name} and {gift} are filled in when the event happens. */
  text: string;
  choices: readonly EventChoice[];
};

export const officeEvents: readonly OfficeEvent[] = [
  {
    id: "birthday-card",
    title: "A card is going round",
    text: "It is {name}'s birthday, and a card is going round the office. It has reached your desk. There is a pen, and a lot of pressure.",
    choices: [
      {
        label: "Just sign the card",
        result: "You write 'Have a great day!' and draw a small goblin. {name} will treasure it, or at least keep it.",
        stats: ["cardsSigned"],
      },
      {
        label: "Sign it and chip in for a present",
        cost: 1,
        result: "Between you all, you bought {gift}. {name} had a little cry, which was a good sign.",
        stats: ["cardsSigned", "presents"],
      },
      {
        label: "Pretend to be busy",
        result: "You type very loudly. Nobody believes you, but they let you off.",
      },
    ],
  },
  {
    id: "leaving-collection",
    title: "A leaving collection",
    text: "{name} is leaving, after a very long time of being here. {name2} has an envelope, and is making eye contact with you.",
    choices: [
      {
        label: "Sign the leaving card",
        result: "You write 'Good luck!' and then run out of room. {name} will never know what the rest said.",
        stats: ["cardsSigned"],
      },
      {
        label: "Put money in the envelope",
        cost: 1.5,
        result: "The collection buys {gift}. {name} says it is the nicest thing anyone has given them in a meeting.",
        stats: ["cardsSigned", "presents"],
      },
      {
        label: "Look at your shoes",
        result: "{name2} moves on to the next desk, but remembers.",
      },
    ],
  },
  {
    id: "cake-sale",
    title: "A cake sale",
    text: "{name} is selling cakes for charity, and has set up a stall on top of the photocopier. The cakes look homemade, and a little bit damp.",
    choices: [
      {
        label: "Buy a slice",
        cost: 0.5,
        result: "It is a lemon cake, mostly. You feel generous, and slightly sticky.",
        stats: ["presents"],
      },
      {
        label: "Say you are on a diet",
        result: "{name} nods slowly, in a way that you will think about all day.",
      },
    ],
  },
  {
    id: "vending-windfall",
    title: "The vending machine pays out",
    text: "You press B4, and the vending machine gives you a bag of crisps, a second bag of crisps, and some coins. Nobody saw.",
    choices: [
      {
        label: "Keep the coins",
        gain: 2,
        result: "You pocket the coins and try to look innocent. The vending machine looks pleased with itself.",
      },
      {
        label: "Give the coins to a colleague",
        result: "{name} is stunned, and then suspicious. Still, it was a nice thing to do.",
        stats: ["presents"],
      },
    ],
  },
  {
    id: "fire-drill",
    title: "The fire alarm goes off",
    text: "Everyone files out of the office, very slowly, carrying their drinks. {name} has brought the plant.",
    choices: [
      {
        label: "Walk out calmly",
        result:
          "You stand in the car park for ten minutes and talk about the weather. It is the best meeting this week.",
      },
      {
        label: "Stay and keep typing",
        gain: 1,
        result: "You earn a small bonus for dedication, and a stern talk from a man in a yellow jacket.",
      },
    ],
  },
];
