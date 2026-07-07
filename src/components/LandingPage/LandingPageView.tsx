import React, { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { LandingPageProvider } from "./LandingPageContext";
import Nav from "./Nav";
import Loader from "./Loader";
import Hero from "./Hero";
import About from "./About";
import Achievements from "./Achievements";
import Work from "./Work";
import Testimonials from "./Testimonials";
import EditableText from "./EditableText";
import { useLandingPage } from "./LandingPageContext";
import VersionControlPanel from "./VersionControlPanel";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import './sticky.css';

const LandingPageViewContent = () => {
  const { data } = useLandingPage();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    gsap.registerPlugin(ScrollTrigger);

    lenis.on('scroll', ScrollTrigger.update);
    
    gsap.ticker.add((time)=>{
      lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0, 0);

    return () => {
      gsap.ticker.remove((time)=>{
        lenis.raf(time * 1000);
      });
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-black min-h-screen font-sans text-white relative">
      <Nav />
      <Loader />
      
      <div id="home">
        <Hero />
      </div>
      
      <div id="about">
        <About />
      </div>
      
      <div id="projects">
        <Achievements />
        <Work />
      </div>
      
      <div id="contact">
        <Testimonials />
      </div>

      <div className="absolute inset-0 pointer-events-none z-[990]">
        {(data.freeformTexts?.items || []).map((box, index) => (
          <div key={box.id} className="absolute pointer-events-auto" style={{ top: '100px', left: '100px' }}>
            <EditableText 
              section="freeformTexts" 
              arrayField="items" 
              index={index} 
              field="content" 
              className="text-xl inline-block bg-black/50 p-2 border border-zinc-800"
            />
          </div>
        ))}
      </div>
      
      <VersionControlPanel />
    </div>
  );
};

export const LandingPageView = () => {
  return (
    <LandingPageProvider>
      <LandingPageViewContent />
    </LandingPageProvider>
  );
};

export default LandingPageView;
