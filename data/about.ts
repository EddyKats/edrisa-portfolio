import { projectCta } from "@/data/project-cta";

export const aboutMeta = {
  title: "Kasibante Edrisa · Multidisciplinary Designer & Software Developer",
  description:
    "Kasibante Edrisa is a multidisciplinary designer and software developer working across graphic design, branding, web development and digital products. Head of Graphics at Edutech Media Group.",
} as const;

export const aboutCopy = {
  title: "About",
  introHeading: "Multidisciplinary Designer & Software Developer",
  intro:
    "Kasibante Edrisa is a multidisciplinary designer and software developer working across graphic design, brand identity, web development and digital products.\n\nHe works at the intersection of visual communication, branding and technology, building identities, campaigns, websites and digital products.",
  storyHeading: "Experience",
  story:
    "Edutech Media Group — Then Head of Graphics Department. Joined as a graphic designer and was later promoted to lead the department.\n\nGiniyas Media Services — Founder and Proprietor. A branding and advertising agency, founded and run with his brother Ssengooba Akram.\n\nGline — Cofounder. An online news bulletin, founded and run with his brother Ssengooba Akram.\n\nHarnivok Solutions — Brand Manager. Brand management and visual direction for a manufacturing business.",
  journeyTitle: "Experience",
  ctaHeading: projectCta.heading,
  ctaBody: "Bring the idea. I'll bring the unreasonable attention to detail.",
  ctaLabel: projectCta.label,
} as const;

export const aboutProfile = {
  name: "Kasibante Edrisa",
  alternateName: "Edrisa",
  title: "Multidisciplinary Designer & Software Developer",
  summary:
    "I work at the intersection of visual communication, branding and technology, building identities, campaigns, websites and digital products.",
  facts: "Graphic Design · Branding · Web & App Development",
  introLabel: "About",
  bioHeading: "About",
  bio: [
    "Kasibante Edrisa is a multidisciplinary designer and software developer working across graphic design, brand identity, web development and digital products.",
    "He works at the intersection of visual communication, branding and technology, building identities, campaigns, websites and digital products.",
  ],
  contactHeading: "Elsewhere on the internet",
  softwareHeading: "Software",
  softwareDesignHeading: "Design",
  softwareDevHeading: "Development",
  developmentTools: ["Next.js", "React", "TypeScript", "Node.js"],
  coreSkillsHeading: "Core skills",
  coreSkills: [
    "Graphic Design",
    "Branding",
    "Creative Direction",
    "UI · UX",
    "Web Development",
    "App Development",
    "Visual Communication",
    "Campaign Design",
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
      company: "Giniyas Media Services",
      steps: ["Founder and Proprietor"],
      note: "A branding and advertising agency, founded and run with his brother Ssengooba Akram.",
    },
    {
      company: "Gline",
      steps: ["Cofounder"],
      note: "An online news bulletin, founded and run with his brother Ssengooba Akram.",
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
    detail: "2021 to February 2026",
  },
  credentialsHeading: "Certifications",
  credentialsNote: "Issued credentials across design, product, development and marketing.",
  credentials: [
    {
      priority: 1,
      track: "Design",
      mark: "adobe",
      name: "Adobe Certified Professional: Illustrator and Photoshop",
      issuer: "Adobe",
      note: "Official Adobe certification for graphic design: logos, vector graphics and brand identity in Illustrator, and image manipulation and visual design in Photoshop.",
      programUrl: "https://certifiedprofessional.adobe.com/en/home",
      programLabel: "Official Adobe certification",
      issueDate: null,
      credentialUrl: null,
      credentialId: null,
      completed: true,
      published: true,
    },
    {
      priority: 2,
      track: "Product design",
      mark: "google",
      name: "Google UX Design Professional Certificate",
      issuer: "Google · Coursera",
      note: "User research, wireframes, prototypes and usability testing, with portfolio projects for website, app and UI · UX work.",
      programUrl: "https://www.coursera.org/professional-certificates/google-ux-design",
      programLabel: "View the certificate",
      issueDate: null,
      credentialUrl: null,
      credentialId: null,
      completed: true,
      published: true,
    },
    {
      priority: 3,
      track: "Development",
      mark: "meta",
      name: "Meta Front End Developer Professional Certificate",
      issuer: "Meta · Coursera",
      note: "Front end development with HTML, CSS, JavaScript and React.",
      programUrl: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
      programLabel: "View the certificate",
      issueDate: null,
      credentialUrl: null,
      credentialId: null,
      completed: true,
      published: true,
    },
    {
      priority: 4,
      track: "Measurement",
      mark: "analytics",
      name: "Google Analytics certification",
      issuer: "Google Skillshop",
      note: "Website traffic, user behaviour and performance for web and digital product work.",
      programUrl: "https://skillshop.withgoogle.com/",
      programLabel: "Open Google Skillshop",
      issueDate: null,
      credentialUrl: null,
      credentialId: null,
      completed: true,
      published: true,
    },
    {
      priority: 5,
      track: "Marketing",
      mark: "hubspot",
      name: "HubSpot Social Media Marketing or Digital Marketing Certification",
      issuer: "HubSpot Academy",
      note: "Brand management, advertising and media: campaigns and brand presence, with a broader digital marketing foundation.",
      programUrl: "https://academy.hubspot.com/",
      programLabel: "Browse HubSpot certifications",
      issueDate: null,
      credentialUrl: null,
      credentialId: null,
      completed: true,
      published: true,
    },
  ],
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
    note: "Joined as a graphic designer and was later promoted to lead the department.",
    initials: "EM",
    markSrc: null as string | null,
  },
  {
    company: "Giniyas Media Services",
    role: "Founder and Proprietor",
    note: "A branding and advertising agency, founded and run with his brother Ssengooba Akram.",
    initials: "GM",
    markSrc: null as string | null,
  },
  {
    company: "Gline",
    role: "Cofounder",
    note: "An online news bulletin, founded and run with his brother Ssengooba Akram.",
    initials: "GL",
    markSrc: null as string | null,
  },
  {
    company: "Harnivok Solutions",
    role: "Brand Manager",
    note: "Brand management and visual direction for a manufacturing business.",
    initials: "HS",
    markSrc: null as string | null,
  },
] as const;
