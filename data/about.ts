import { projectCta } from "@/data/project-cta";

export const aboutMeta = {
  title: "Kasibante Edrisa — Multidisciplinary Designer & Software Developer",
  description:
    "Kasibante Edrisa is a Ugandan multidisciplinary designer and software developer working across graphic design, branding, web development and digital products. Head of Graphics at Edutech Media Group.",
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
  ctaHeading: projectCta.heading,
  ctaBody: "Bring the idea. I'll bring the unreasonable attention to detail.",
  ctaLabel: projectCta.label,
} as const;

export const aboutProfile = {
  name: "Kasibante Edrisa",
  alternateName: "Edrisa",
  title: "Multidisciplinary Designer & Software Developer",
  summary:
    "I work at the intersection of visual communication, branding and technology — building identities, campaigns, websites and digital products.",
  facts: "Kampala, Uganda · Graphic Design · Branding · Web & App Development",
  bioHeading: "About",
  bio: [
    "Kasibante Edrisa is a Ugandan multidisciplinary designer and software developer working across graphic design, brand identity, web development and digital products.",
    "He currently leads the Graphics Department at Edutech Media Group and has worked across brand management, creative direction and technology-led projects.",
  ],
  disciplinesHeading: "What I do",
  disciplines: [
    { title: "Graphic Design", text: "Visual communication with a point of view." },
    { title: "Branding", text: "Identities and campaigns built to be recognized." },
    { title: "Web Development", text: "Websites that carry the work, not just the look." },
    { title: "App Development", text: "Digital products shaped with the same care." },
  ],
  experience: [
    {
      company: "Edutech Media Group",
      steps: ["Started as Graphic Designer", "Then Head of Graphics Department"],
      note: "Joined as a graphic designer and was later promoted to lead the department.",
    },
    {
      company: "Harnivok Solutions",
      steps: ["Brand Manager"],
      note: "Brand management and visual direction for a manufacturing business.",
    },
  ],
  educationHeading: "Education",
  education: {
    credential: "Bachelor of Computer Science",
    school: "Metropolitan International University",
    detail: "Graduated February 2026",
  },
  credentialsHeading: "Certifications",
  credentialsNote: "Completed credentials will be listed here, with the issuer and a public link, once they are earned.",
  presenceHeading: "Elsewhere on the internet",
  selectedHeading: "Selected work",
  selectedNote: "A few published projects across the disciplines above.",
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
