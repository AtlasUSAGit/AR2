import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { useLandingPage } from "./LandingPageContext";
import EditableText from "./EditableText";
import { Pencil } from "lucide-react";

const Hero = () => {
  const { data, isEditMode, updateStringArrayData } = useLandingPage();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageIndex = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Simple fade in for the hero elements
    gsap.to(".hero-fade", {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.3,
      ease: "power3.out",
      delay: 0.5
    });
  }, [data.hero.word1, data.hero.word3]); // Re-run when text changes

  // mouse trail effect
  useEffect(() => {
    if (!containerRef.current) return;
    
    // CPU Optimization: Disable mouse trail DOM injection entirely on mobile devices
    if (window.innerWidth < 768) return;

    let lastX = 0, lastY = 0;
    const threshold = 120;

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const distance = Math.hypot(dx, dy);

      if (distance < threshold) return;

      const dirX = dx / distance || 0;
      const dirY = dy / distance || 0;

      lastX = e.clientX;
      lastY = e.clientY;

      const rotation = dirX > 0 ? 12 : -12;
      const images = data.hero.heroImages;
      const src = images[imageIndex.current % images.length] || images[0];
      imageIndex.current++;

      const img = document.createElement("img");
      img.src = src;

      Object.assign(img.style, {
        position: "absolute",
        left: `${e.clientX}px`,
        top: `${e.clientY}px`,
        width: "280px",
        height: "auto",
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        opacity: "0",
        objectFit: "cover",
        willChange: "transform, opacity",
        filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.25))",
      });

      containerRef.current?.appendChild(img);

      gsap.fromTo(
        img,
        { opacity: 0 },
        { opacity: 1, duration: 1.4, ease: "power3.out" }
      );

      gsap.to(img, {
        opacity: 0,
        scale: 1.05,
        duration: 1.2,
        delay: 0.8,
        ease: "power2.out",
        onComplete: () => img.remove(),
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [data.hero.heroImages]);

  return (
    <div
      ref={containerRef}
      className="relative z-[999] bg-black h-[100dvh] text-white flex flex-col items-center justify-center gap-4 md:gap-8 overflow-hidden"
    >
      {isEditMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            const idxStr = window.prompt("Which image index to replace? (0-6)");
            if (idxStr !== null) {
              const idx = parseInt(idxStr, 10);
              if (!isNaN(idx) && idx >= 0 && idx < data.hero.heroImages.length) {
                const newUrl = window.prompt("Enter new image URL:");
                if (newUrl) {
                  updateStringArrayData('hero', 'heroImages', idx, newUrl);
                }
              }
            }
          }}
          className="absolute top-20 right-4 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg z-50 hover:bg-purple-500 flex items-center gap-2 text-sm font-bold"
        >
          <Pencil size={16} /> Edit Hover Images
        </button>
      )}

      <div className="flex flex-col md:flex-row items-center justify-center w-full gap-4 md:gap-8 px-4">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-fahkwang font-bold overflow-hidden tracking-widest uppercase flex flex-col md:flex-row items-center flex-wrap justify-center md:whitespace-nowrap text-center">
          <EditableText section="hero" field="word1" as="span" className="flex hero-fade opacity-0 translate-y-6" />
          
          <span className="flex items-center mx-4 md:mx-8 hero-fade opacity-0 translate-y-6">
            <span className="hero-text text-lg md:text-2xl text-[#A493F7] tracking-normal font-medium" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
              {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
            </span>
          </span>
          
          <EditableText section="hero" field="word3" as="span" className="flex hero-fade opacity-0 translate-y-6" />
        </h1>
      </div>
    </div>
  );
};

export default Hero;
