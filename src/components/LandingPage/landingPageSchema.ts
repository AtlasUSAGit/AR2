import React from 'react';

export interface HeroData {
  word1: string;
  subtitle1: string;
  word2: string;
  word3: string;
  subtitle3: string;
  heroImages: string[];
}

export interface AboutData {
  title: string;
  bioText: string;
}

export interface AchievementsData {
  title: string;
  description1: string;
  description2: string;
  number: number;
  companies: string[];
  labelAwards: string;
}

export interface ServiceData {
  id: number;
  title: string;
  description: string;
  services: string[][];
}

export interface WorkData {
  title: string;
  services: ServiceData[];
}

export interface TestimonialData {
  company: string;
  quote: string;
  name: string;
  role: string;
}

export interface TestimonialsData {
  title: string;
  description: string;
  items: TestimonialData[];
}

export interface NavData {
  appName: string;
  menuTitle: string;
  btnText: string;
  items: { title: string, img: string, link: string }[];
}

export interface FooterData {
  email1: string;
  email2: string;
  copyright: string;
}

export interface FreeformTextsData {
  items: { id: string; content: string }[];
}

export interface MetricData {
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
}

export interface DashboardData {
  title: string;
  subtitle: string;
  metrics: MetricData[];
}

export interface LandingPageVersion {
  id: string;
  name: string;
  timestamp: number;
  isActive: boolean;
  content: {
    hero: HeroData;
    about: AboutData;
    achievements: AchievementsData;
    work: WorkData;
    testimonials: TestimonialsData;
    nav: NavData;
    footer: FooterData;
    freeformTexts: FreeformTextsData;
    dashboard: DashboardData;
    styles: Record<string, React.CSSProperties>;
  };
}

export const defaultLandingPageData: LandingPageVersion['content'] = {
  hero: {
    word1: "DAILY",
    subtitle1: "we turn aesthetics into experience",
    word2: "",
    subtitle3: "tech that’s light as air",
    word3: "BRIEFING",
    heroImages: [
      "/imgs/img-1.png",
      "/imgs/img-2.png",
      "/imgs/img-3.png",
      "/imgs/img-4.png",
      "/imgs/img-5.jpeg",
      "/imgs/img-6.jpeg",
      "/imgs/img-7.png"
    ]
  },
  about: {
    title: "THREE STEPS TO SUCCESS WITH CORPORATION",
    bioText: "1. CoUKB delivers message to Corporation. \n2. Paperwork and presentation of paperwork to Corp. \n3. Ratification of Agreement."
  },
  achievements: {
    title: "Message for CoUKB to Deliver",
    description1: "1. You do not need their money.\n\n2. Hiring you would be unlike hiring any other employee they have ever hired, because every other employee they have ever hired will spend the money they are given on their bills, expenses, family, life, THEMSELVES. Whereas you would spend every dollar you are given directly on UKB and its economic development. \n\n3. Building off of that, essentially giving you a monthly retainer is really giving you a monthly discretionary budget, and you are better at budgets than anyone, which is why you're entrusted with oversight over massive federal budgets. ",
    description2: "Provide CoUKB with talking points during presentation of Corporation application in admin mode to CoUKB. ",
    number: 3,
    labelAwards: "Truths",
    companies: [
      "/company/ibm.svg",
      "/company/delta.svg",
      "/company/mc-donlad.svg",
      "/company/clear-street.svg",
      "/company/calme.svg",
      "/company/double-circle.svg",
      "/company/unileaver.svg",
      "/company/nanigator.svg"
    ]
  },
  work: {
    title: "Paperwork to Present",
    services: [
      {
        id: 1,
        title: "Cover Page",
        description: "PURPOSE: \nHighlight Goals \nof Engagement",
        services: [
          ["GET 8(A) APPLICATIONS THAT \nHAVE ALREADY BEEN SUBMITTED PROCESSED", "PROVIDE ROADMAP FOR MORE 8(A) ENTITIES\nTO GET THEIR APPLICATIONS SUBMITTED AND APPROVED", "CREATE OTHER ROUTES FOR ECONOMIC EXPANSION\n(GRANTS / PRIVATE SECTOR)"]
        ]
      },
      {
        id: 2,
        title: "Deck",
        description: "MAIN UPDATES",
        services: [
          ["\nNEW TIMELINE: SHOWS THAT THEY ALREADY HAVE COMPLETED STEPS\nWE ARE COMING IN TO HELP PUSH THEM OVER THE FINISH LINE", "HOW WE ARE COMPENSATED: MADE AMBIGUOUS IN THE DECK. \nLEAVING MONTHLY RETAINER FOR THE CONTRACT."]
        ]
      },
      {
        id: 3,
        title: "Website",
        description: "UKBCB.ATLASUSA.AI \n\nSEE THE MIND MAP SANDBOX PAGE FOR PRESENTATION OUTLINE FOR WEBSITE",
        services: [
        ]
      },
      {
        id: 4,
        title: "Consulting Agreement",
        description: "MAIN UPDATES:",
        services: [
          ["UPDATED COMPENSATION TO $12.5K DOWN AND $12.5K MONTHLY RETAINER", "UPDATED PENALTY FOR EARLY TERMINATION TO 12 MONTHS PAY"]
        ]
      }
    ]
  },
  testimonials: {
    title: "NEXT STEPS",
    description: "Paper doesn't crash, and websites don't crease and tear, but receiving such positive testimonials after long processes always tugs at our heartstrings.",
    items: [
      {
        company: "/company/ibm.svg",
        quote: " PRESENTATION OF ADMIN VERSION OF APP FOR CORPORATION TO CoUKB",
        name: "1",
        role: ""
      },
      {
        company: "/company/delta.svg",
        quote: "CONTINUOUSLY UPDATE APP TO IMPROVE USER EXPERIENCE",
        name: "2",
        role: ""
      },
      {
        company: "/company/unileaver.svg",
        quote: "PRACTICE PRESENTING BOTH VERSIONS OF APP (ADMIN AND GROUP VERSIONS)",
        name: "3",
        role: ""
      }
    ]
  },
  nav: {
    appName: "DAILY BRIEFING DIRECTORY",
    menuTitle: "System Navigation",
    btnText: "Command Center",
    items: [
      { title: "Hero", img: "/imgs/img-1.png", link: "#home" },
      { title: "Studios", img: "/imgs/img-2.png", link: "#about" },
      { title: "Recognition", img: "/imgs/img-3.png", link: "#projects" },
      { title: "Work", img: "/imgs/img-4.jpeg", link: "#contact" },
    ]
  },
  footer: {
    email1: "hello@ukbfc.gov",
    email2: "contracts@ukbfc.gov",
    copyright: "©UKBFC. 2026. WE TURN AESTHETICS INTO EXPERIENCE. ALL RIGHTS RESERVED."
  },
  freeformTexts: {
    items: []
  },
  dashboard: {
    title: "EXECUTIVE DASHBOARD",
    subtitle: "Real-time key performance indicators and growth metrics.",
    metrics: [
      { label: "REVENUE GROWTH", value: "+124%", trend: "vs last quarter", isPositive: true },
      { label: "ACTIVE USERS", value: "84.2K", trend: "+12% this month", isPositive: true },
      { label: "CONVERSION RATE", value: "4.8%", trend: "+1.2% this week", isPositive: true },
      { label: "CHURN RATE", value: "1.2%", trend: "-0.5% this month", isPositive: true }
    ]
  },
  styles: {
    about_title: {
      fontFamily: "'Times New Roman', Times, serif"
    },
    work_services_2_description: {
      href: "http://UKBCB.ATLASUSA.AI",
      color: "#A493F7",
      textDecoration: "underline"
    }
  }
};
