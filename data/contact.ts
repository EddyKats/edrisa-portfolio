export const contactMeta = {
  title: "Contact Edrisa",
  description: "Start a project with Edrisa. Based in Kampala, Uganda.",
} as const;

export const contactCopy = {
  title: "Okay, Your Turn.",
  subheading: "If you made it this far, we should probably talk.",
  detailsHeading: "The practical part",
  formHeading: "Write it down",
  socialHeading: "Elsewhere on the Internet",
  locationNote: "No map embed. The city is the point.",
  sendLabel: "Send It My Way",
  pendingNote: "Sending isn't connected yet. Filling this in will not deliver a message.",
  pendingStatus: "The form checks out, but nothing was sent. Inbox wiring comes next.",
} as const;

/**
 * TODO: replace email with the real inbox.
 * TODO: set phone to the real number. Do not invent one.
 */
export const contactDetails = {
  email: "hello@edrisa.studio",
  phone: null as string | null,
  location: "Kampala, Uganda",
} as const;

export const projectTypes = ["Brand", "Campaign", "Digital", "Not sure yet"] as const;
