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
}

export interface ServiceData {
  id: number;
  title: string;
  description: string;
  media: {
    type: "image" | "video";
    url: string;
  };
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
  };
}

export const defaultLandingPageData: LandingPageVersion['content'] = {
  hero: {
    word1: "JULY",
    subtitle1: "we turn aesthetics into experience",
    word2: "6TH",
    subtitle3: "tech that’s light as air",
    word3: "Briefing",
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
    title: "Who We Are",
    bioText: "Designers, engineers and coders. Driven by exceptional design and craftsmanship. We’re digital natives, dedicated heart and soul to strategic branding."
  },
  achievements: {
    title: "Selected Clients",
    description1: "Here are some brands you'll probably recognize that we've had the pleasure to work with. Cool, right? Now that we've got your attention, we often say the bigger the brand, the less room there is for creative excitement as other priorities tend to overshadow design. But fear not—we're a team of enthusiasts who always deliver, no matter the challenge!",
    description2: "No clients were ever harmed in the making of all this… wait. Yep, not even one, we've double-checked this. Design is not tequila. It can't make everyone happy",
    number: 296,
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
    title: "What We Do",
    services: [
      {
        id: 1,
        title: "Branding",
        description: "We craft brand identities that spark recognition and loyalty — from strategy to storytelling.",
        media: { type: "video", url: "https://www.youtube.com/embed/dA0VGEbbw4g" },
        services: [
          ["Brand architecture", "Brand positioning", "Naming", "Brand strategy"],
          ["Brand development", "Brand identity", "Implementation", "Wayfinding"],
          ["Iconography", "Illustration", "3D", "Print"]
        ]
      },
      {
        id: 2,
        title: "Digital Branding",
        description: "We design immersive digital experiences that blend UX, UI, and tech into one seamless journey.",
        media: { type: "video", url: "https://www.youtube.com/embed/lJIrF4YjHfQ" },
        services: [
          ["User Experience", "User Interface", "Prototyping", "Web design"],
          ["App design", "E-commerce", "Front-end", "Back-end"]
        ]
      },
      {
        id: 3,
        title: "Creative Design",
        description: "Bold, memorable visuals that move people — from packaging to 3D storytelling.",
        media: { type: "video", url: "https://www.youtube.com/embed/9No-FiEInLA" },
        services: [
          ["Graphic Design", "Illustration", "3D Design"],
          ["Packaging", "Editorial", "Iconography", "Collateral"]
        ]
      },
      {
        id: 4,
        title: "Motion & Video",
        description: "Stories in motion — from cinematic ads to branded animations that stay unforgettable.",
        media: { type: "video", url: "https://www.youtube.com/embed/aqz-KE-bpKQ" },
        services: [
          ["Motion graphics", "2D/3D Animation", "Explainers"],
          ["Advertising", "storytelling"]
        ]
      }
    ]
  },
  testimonials: {
    title: "Testimonials",
    description: "Paper doesn't crash, and websites don't crease and tear, but receiving such positive testimonials after long processes always tugs at our heartstrings.",
    items: [
      {
        company: "/company/ibm.svg",
        quote: "I needed a creative agency at the top of design thinking and leading-edge in technical capabilities. Bürocratik was a perfect match, they are a very rare kind of agency, one that treats clients with respect while bringing their best thinking and work to meet business needs. Outstanding creative digital work!",
        name: "Sophia Martinez",
        role: "Global Brand Director, IBM"
      },
      {
        company: "/company/delta.svg",
        quote: "We needed a partner who understood both innovation and execution, and that’s exactly what we found. The team translated complex challenges into clear solutions, blending creativity with precision. They didn’t just deliver design — they built experiences that continue to resonate deeply with our customers worldwide.",
        name: "James Carter",
        role: "VP of Customer Experience, Delta"
      },
      {
        company: "/company/unileaver.svg",
        quote: "They’re not just a creative agency — they’re genuine collaborators. Every project felt like a partnership where vision and detail came together seamlessly. Their ability to balance strategic thinking with bold creativity set a new benchmark for us, raising expectations across our global brand teams.",
        name: "Mandlina Covachiu",
        role: "Global Brand Manager, Unilever"
      }
    ]
  }
};
