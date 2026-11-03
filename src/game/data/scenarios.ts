// Each scenario is one small, coherent document: an opening line, a pool of sentences about the
// same topic, and a closing line. An assignment picks one scenario, then one opening, as many
// body sentences (shuffled) as the length needs, and one closing.
//
// Writing rules, all enforced by tests where possible:
// - Body sentences must make sense in ANY order, so never start one with "It", "That", "Then" or
//   anything that refers to the sentence before.
// - Plain ASCII only (the player has to be able to type it), and every sentence ends with . ! or ?
// - {slots} come from slots.ts. A slot keeps the same value for the whole assignment. Add a digit
//   ({name2}) to get a second, different value from the same list.

export type DocumentKind = "email" | "memo" | "report";

export type Scenario = {
  kind: DocumentKind;
  /** Shown as the document heading. Not typed by the player. */
  title: string;
  opening: readonly string[];
  body: readonly string[];
  closing: readonly string[];
};

// Tier 1: short plain words, almost no punctuation, no digits.
const intern: readonly Scenario[] = [
  {
    kind: "email",
    title: "Re: the printer",
    opening: ["Hi {name}, I need to tell you about the printer.", "Hello {name}, the printer is broken again."],
    body: [
      "It has been jammed since {day}.",
      "Someone left a pile of paper inside it.",
      "Turning it off and on again did not work.",
      "The little light is blinking red.",
      "{name2} said to hit it gently.",
      "Hitting it gently did not help.",
      "It makes a very sad noise now.",
      "We have put a sign on the lid.",
      "The sign says please do not touch.",
      "The man from {dept} says he will come soon.",
      "I have printed nothing all week.",
      "I think the printer just wants some rest.",
    ],
    closing: ["Please send help when you can.", "Thank you for reading this far."],
  },
  {
    kind: "memo",
    title: "Notice about the fridge",
    opening: ["Hello all, this is a note about the fridge.", "Dear team, we need to talk about the fridge."],
    body: [
      "Somebody ate my lunch on {day}.",
      "The note on my sandwich said please do not eat.",
      "There is a very old yogurt on the top shelf.",
      "Nobody knows who owns the yogurt.",
      "The fridge door does not close all the way.",
      "Please put your name on your food.",
      "{name} has lost a whole birthday cake.",
      "We will clean the fridge on {day}.",
      "Anything left behind will be thrown away.",
      "The milk has been here longer than I have.",
      "Please be kind to the fridge.",
      "The fridge is working very hard for all of us.",
    ],
    closing: ["Thank you for your help.", "That is all for now."],
  },
  {
    kind: "email",
    title: "Welcome to the team",
    opening: ["Hi {name}, welcome to the team.", "Hello {name}, we are happy you are here."],
    body: [
      "Your desk is by the window.",
      "The chair is very comfy so please do not fall asleep.",
      "The coffee machine is in the kitchen.",
      "The coffee machine needs more water most of the time.",
      "Your computer is a little slow until it warms up.",
      "Lunch is at noon but most people go at one.",
      "{name2} will show you where everything is.",
      "Please do not sit in the big chair by the door because it belongs to the boss.",
      "The lift is out of order so please use the stairs.",
      "You will get your pass on {day}.",
      "The people from {dept} sit near the plant.",
      "The plant is not very well but it is trying.",
    ],
    closing: ["We hope you like it here.", "Please ask us if you need anything."],
  },
  {
    kind: "memo",
    title: "Fire drill on {day}",
    opening: ["Hello all, there is a fire drill on {day}.", "Dear team, please read this about the fire drill."],
    body: [
      "The bell will ring very loudly.",
      "Please leave your desk and walk to the car park.",
      "Do not run even if you are late for lunch.",
      "Please do not take the lift.",
      "Leave your coffee on your desk.",
      "{name} will count everyone at the door.",
      "{name2} will carry the clipboard.",
      "Last time three people got lost in the kitchen.",
      "Please stand in a straight line.",
      "The drill will take about ten minutes.",
      "If it rains please bring a coat.",
      "We will go back inside when {dept} says so.",
    ],
    closing: ["Thank you for staying calm.", "That is all for now."],
  },
];

// Tier 2: commas, apostrophes, capitals and numbers.
const associate: readonly Scenario[] = [
  {
    kind: "email",
    title: "Re: {thing}",
    opening: [
      "Hi {name}, just circling back on {thing}.",
      "Hello {name}, I hope your week is going well, but we need to discuss {thing}.",
    ],
    body: [
      "We're now {n} days past the deadline, and {dept} keeps asking.",
      "I know you're busy, but this one can't wait.",
      "Per my last email, the deadline was {day}.",
      "{name2} has already sent {n2} reminders.",
      "I've attached the template, in case it helps.",
      "If you're stuck, ask {name2}, who did it last year.",
      "We don't need it perfect, just finished.",
      "The boss, as you know, hates surprises.",
      "I'll keep my inbox open, so send it whenever it's ready.",
    ],
    closing: ["Thanks in advance, and sorry for the nagging.", "Let me know if there's anything I can do."],
  },
  {
    kind: "memo",
    title: "Memo from {dept}",
    opening: [
      "Dear staff, there's an all-hands meeting on {day}.",
      "Hi everyone, please note the all-hands is on {day}, and attendance is mandatory.",
    ],
    body: [
      "We'll start in the big room, and we'll finish in the big room.",
      "{name} from {dept} will give a short talk.",
      "The meeting won't be short, whatever the invitation says.",
      "There will be {n} slides, and one of them is a chart.",
      "Coffee and biscuits will be provided, but please don't take more than two.",
      "Please don't bring your laptop, we're watching you.",
      "Questions are welcome, but answers are not guaranteed.",
      "The meeting is {n2} minutes long, plus extra time for the projector to work.",
      "{name2} has promised to bring the good chairs.",
    ],
    closing: ["Thanks, and see you there, whether you like it or not.", "That's all for now, folks."],
  },
  {
    kind: "email",
    title: "Booking the meeting room",
    opening: [
      "Hi {name}, sorry to bother you about the meeting room.",
      "Hello {name}, we've got a small problem with the meeting room.",
    ],
    body: [
      "It's booked until {day}, and I need it today.",
      "The booking says important, but nobody knows what for.",
      "{name2} from {dept} has been sitting in there since lunch.",
      "The projector's broken, so we can't show the slides.",
      "The whiteboard's full of drawings, and nobody will own up.",
      "Someone's left a half-eaten sandwich on the table.",
      "We've got {n} people, but only {n2} chairs.",
      "I've asked {dept} twice, and they've sent a form.",
      "I'll take the small room, if it's free.",
    ],
    closing: ["Thanks, I owe you a coffee.", "Sorry again, and thanks for your patience."],
  },
  {
    kind: "memo",
    title: "Reminder for all staff",
    opening: ["Hi team, a quick reminder about casual Friday.", "Hello everyone, we need to talk about casual Friday."],
    body: [
      "Casual means comfortable, not pyjamas.",
      "Sandals are a no, I'm afraid.",
      "Hats are fine, but not indoors, and not in meetings.",
      "Jeans are allowed, as long as they're clean.",
      "{name} wore a full dinosaur costume last week, and {dept} called it a safety issue.",
      "Ties are optional, but please wear something.",
      "Please don't wear anything that's louder than the printer.",
      "If you're not sure, ask {name2}, who has good taste.",
      "The dress code will be checked after lunch.",
    ],
    closing: ["Thanks, and enjoy your Friday.", "That's all, so let's keep it smart-ish."],
  },
];

// Tier 3: full punctuation, brackets, quotes, symbols and longer words.
const manager: readonly Scenario[] = [
  {
    kind: "report",
    title: "{dept} report: Q{q} results",
    opening: [
      "Executive summary: Q{q} was, by any reasonable measure, a quarter.",
      "Overview: Q{q} results are in (and they're mostly numbers).",
    ],
    body: [
      "Revenue is up {n}% year-over-year; so is the number of meetings.",
      "Costs are down {n2}%, mainly because we stopped buying biscuits.",
      'Morale (see Appendix B) is "stable", which means nobody\'s said anything.',
      "{name} & {name2} have been promoted; their workload hasn't changed.",
      'Our KPI dashboard shows green, yellow, and "emotionally red".',
      "{dept} exceeded its targets; {dept2} exceeded its budget.",
      "Customer feedback was positive (we read {n3}% of it).",
      "Next quarter: more of the same, but louder.",
    ],
    closing: [
      "Recommendation: proceed, cautiously; or not; see attached.",
      "Conclusion: everything is fine (pending review).",
    ],
  },
  {
    kind: "email",
    title: "Fwd: Fwd: {thing}",
    opening: [
      "Hi team, quick update on {thing} (please read to the end).",
      "Team: as discussed (in a meeting I wasn't in), we're pivoting on {thing}.",
    ],
    body: [
      'The original plan (v{n}.0) is now "aspirational".',
      "Plan B, which {name} wrote on a napkin, is our new strategy.",
      "We're doubling down on {thing}; unfortunately, we're also halving the staff.",
      "Action item: {name2} to circulate the revised timeline by {day} (EOD).",
      "Stakeholders (all {n2} of them) want a quick sync & a long deck.",
      "Deliverables: slides, a spreadsheet, and a very brave summary.",
      "Risk: low (we haven't looked), medium (we looked), high (we saw).",
      "Please don't reply-all; it's a feature, not a discussion.",
    ],
    closing: [
      "Thanks for your flexibility (it's now mandatory).",
      "Let's circle back (eventually) with a holistic, scalable answer.",
    ],
  },
  {
    kind: "memo",
    title: "Notice from {dept}: audit",
    opening: [
      "Attention all staff: the audit is coming on {day}, and it's coming for you.",
      "Heads-up: {dept} will audit this floor on {day}; please remain calm (and seated).",
    ],
    body: [
      "Please hide the snacks & the evidence.",
      "Desks must be clear, except for one plant (approved).",
      "Passwords must contain a capital, a number, & regret.",
      '{name} "borrowed" the good scissors again; they\'ll be returned today.',
      "All expense reports (including that taxi) must be filed by {day}.",
      "The auditor, {name2}, is allergic to small talk; please keep it brief.",
      "Fire exits must be clear; this is not a joke (see policy {n}-B).",
      "Remember: it's not an interrogation; it's a \"friendly conversation\".",
    ],
    closing: [
      "Thank you for your cooperation; we'll remember it.",
      "Questions should be sent to {dept}; answers are optional.",
    ],
  },
  {
    kind: "email",
    title: "Handover notes (please read)",
    opening: [
      "Hi {name}, I'm out of the office until {day}; here's everything you need to know.",
      "Hello {name}, while I'm away (back {day}), please keep the following in mind.",
    ],
    body: [
      "Step 1: open the spreadsheet. Step 2: stare at it. Step 3: submit.",
      "The tracker (tab 3, column D) must be updated before the stand-up.",
      '{name2} "owns" {thing}; however, nobody has told {name2}.',
      "The coffee machine takes {n} minutes to warm up; be patient.",
      "If {dept} calls, you're in a meeting (it's always true).",
      "Please don't touch the thermostat; it's a delicate truce.",
      "For emergencies, please panic quietly (the walls are thin).",
      "The quiet room is no longer quiet or a room.",
    ],
    closing: ["Thanks, I owe you one (or {n2}).", "I'll be checking my email (secretly), so please don't mention it."],
  },
];

export const scenarioPools = [intern, associate, manager] as const satisfies readonly (readonly Scenario[])[];
