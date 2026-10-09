export const aboutMeta = {
  title: "About Edrisa | Creative Director & Designer",
  description:
    "Edrisa is a multidisciplinary creative working across identity, advertising, product design, and creative direction.",
} as const;

export const aboutCopy = {
  title: "The Edrisa Situation",
  introHeading: "I make things look good. Then I make sure they make sense.",
  intro:
    "I'm Edrisa — a multidisciplinary creative who spends an unreasonable amount of time making brands, visuals and digital experiences feel exactly right. I work across identity, advertising, product design and creative direction. Basically, if it needs to communicate, look sharp, or stop someone mid-scroll, I'm interested.",
  storyHeading: 'It was supposed to be "just design." That escalated quickly.',
  story:
    "What started with pixels and curiosity turned into branding, campaigns, products, teams, late-night revisions, suspicious amounts of coffee, and eventually building ideas from the ground up. Somewhere along the way, I stopped thinking of design as decoration and started treating it as a way of making things easier to notice, understand and remember.",
  journeyTitle: "Previously, on Edrisa...",
  ctaHeading: "Got something worth obsessing over?",
  ctaBody: "Bring the idea. I'll bring the unreasonable attention to detail.",
  ctaLabel: "Let's Make Something",
  footerNote: "Built with pixels, patience, and unnecessary attention to spacing.",
} as const;

/**
 * Add public/images/about-feature.jpg, then set src to "/images/about-feature.jpg".
 * Leave src null until that file exists. Do not point this at a remote image.
 */
export const aboutFeature: {
  src: string | null;
  alt: string;
} = {
  src: null,
  alt: "Featured still from Edrisa's creative work",
};

export const aboutStats = [
  {
    // TODO: replace with verified portfolio statistic
    value: "00+",
    label: "Things That Survived My Perfectionism",
    icon: "layers",
    tone: "cyan",
  },
  {
    // TODO: replace with verified portfolio statistic
    value: "00+",
    label: "Brands Made Harder to Ignore",
    icon: "sparkles",
    tone: "violet",
  },
  {
    // TODO: replace with verified portfolio statistic
    value: "00+",
    label: "Years Arguing With Pixels",
    icon: "clock",
    tone: "magenta",
  },
] as const;

/**
 * Mark images are optional.
 * Add these files, then set markSrc to the matching public path:
 * - public/images/journey/edutech.jpg
 * - public/images/journey/giniyas.jpg
 * - public/images/journey/washo.jpg
 * Dates are omitted until they are confirmed.
 */
export const aboutJourney = [
  {
    company: "Edutech Media Group",
    role: "Head of Graphics Department",
    note: "Professionally moving things 2px to the left.",
    initials: "EM",
    markSrc: null as string | null,
  },
  {
    company: "Giniyas Media Services",
    role: "Creative Director",
    note: "Turning “make it pop” into actual creative direction.",
    initials: "GM",
    markSrc: null as string | null,
  },
  {
    company: "Washo",
    role: "Founder / Brand & Product Direction",
    note: "Because apparently designing companies wasn't enough.",
    initials: "W",
    markSrc: null as string | null,
  },
] as const;
