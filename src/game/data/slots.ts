// Fill-in values for {placeholders} in sentences and titles. Plain ASCII only, so every
// character can be typed on a normal keyboard.
export const slots: Readonly<Record<string, readonly string[]>> = {
  name: ["Brenda", "Gary", "Priya", "Marcus", "Dolores", "Kevin", "Linda", "Raj", "Tamsin", "Walter"],
  dept: ["Accounts", "Facilities", "Compliance", "Procurement", "HR", "Legal", "Marketing", "Logistics"],
  thing: [
    "the stapler audit",
    "the synergy deck",
    "the quarterly report",
    "the printer rota",
    "the fire drill",
    "the new lanyards",
    "the budget sheet",
    "the all-hands",
    "the desk plant survey",
    "the parking policy",
  ],
  day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  n: ["3", "7", "12", "25", "40", "65", "90"],
  q: ["1", "2", "3", "4"],
};
