import { defaultLandingPageData } from './src/components/LandingPage/landingPageSchema.ts';

function mergeLandingPageData(savedContent: any) {
  if (!savedContent) return defaultLandingPageData;
  return {
    hero: { ...defaultLandingPageData.hero, ...(savedContent.hero || {}) },
    about: { ...defaultLandingPageData.about, ...(savedContent.about || {}) },
    achievements: { 
      ...defaultLandingPageData.achievements, 
      ...(savedContent.achievements || {}),
      companies: savedContent.achievements?.companies || defaultLandingPageData.achievements.companies
    },
    work: { 
      ...defaultLandingPageData.work, 
      ...(savedContent.work || {}),
      services: (savedContent.work?.services || defaultLandingPageData.work.services).map((service: any, sIdx: number) => {
        const defaultService = defaultLandingPageData.work.services[sIdx] || defaultLandingPageData.work.services[0];
        return {
          ...defaultService,
          ...service,
          services: service.services || defaultService.services
        };
      })
    },
    testimonials: { 
      ...defaultLandingPageData.testimonials, 
      ...(savedContent.testimonials || {}),
      items: (savedContent.testimonials?.items || defaultLandingPageData.testimonials.items).map((item: any, iIdx: number) => {
        const defaultItem = defaultLandingPageData.testimonials.items[iIdx] || defaultLandingPageData.testimonials.items[0];
        return {
          ...defaultItem,
          ...item
        };
      })
    },
    nav: { 
      ...defaultLandingPageData.nav, 
      ...(savedContent.nav || {}),
      items: (savedContent.nav?.items || defaultLandingPageData.nav.items).map((item: any, iIdx: number) => {
        const defaultItem = defaultLandingPageData.nav.items[iIdx] || defaultLandingPageData.nav.items[0];
        return {
          ...defaultItem,
          ...item
        };
      })
    },
    footer: { ...defaultLandingPageData.footer, ...(savedContent.footer || {}) },
    freeformTexts: { 
      ...defaultLandingPageData.freeformTexts, 
      ...(savedContent.freeformTexts || {}),
      items: savedContent.freeformTexts?.items || defaultLandingPageData.freeformTexts.items
    },
    styles: { ...defaultLandingPageData.styles, ...(savedContent.styles || {}) }
  };
}

try {
  const merged = mergeLandingPageData({});
  JSON.stringify(merged);
  console.log("No cyclic structure found in merged default object.");
} catch(e) {
  console.error("Cyclic structure found:", e);
}

try {
  const mergedWithContent = mergeLandingPageData(defaultLandingPageData);
  JSON.stringify(mergedWithContent);
  console.log("No cyclic structure found when merging with itself.");
} catch(e) {
  console.error("Cyclic structure found when merging with itself:", e);
}

