// Title templates per kind of document. Slots are filled the same way as in sentences.
export const titleTemplates = {
  email: ["Re: {thing}", "Fwd: {thing} (urgent-ish)", "Quick question about {thing}", "Following up: {thing}"],
  memo: ["Memo from {dept}: {thing}", "Reminder for all staff", "Notice from {dept}"],
  report: ["{dept} report: {thing}", "Status update for {thing}", "Weekly summary from {dept}"],
} as const satisfies Record<string, readonly string[]>;
