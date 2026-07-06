import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { useLandingPage } from "./LandingPageContext";
import EditableText from "./EditableText";
import { Pencil } from "lucide-react";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

const Hero = () => {
  const { data, isEditMode, updateStringArrayData } = useLandingPage();
  const containerRef = useRef<HTMLDivElement>(null);
  const imageIndex = useRef(0);
  const pRefs = useRef<HTMLParagraphElement[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const letters = containerRef.current.querySelectorAll<HTMLSpanElement>(".letter");
    const tl = gsap.timeline();

    letters.forEach((letterEl, index) => {
      const finalChar = letterEl.getAttribute("data-char") || "";
      if (finalChar === " ") return; // skip space

      tl.to(
        letterEl,
        {
          delay: 1.5,
          duration: 0.4,
          onStart: () => {
            let scrambleCount = 0;
            const interval = setInterval(() => {
              letterEl.textContent = chars.charAt(
                Math.floor(Math.random() * chars.length)
              );
              scrambleCount++;
              if (scrambleCount > 6) {
                clearInterval(interval);
                letterEl.textContent = finalChar;
              }
            }, 40);
          },
        },
        index * 0.08 + 0.5
      );
    });

    // after last letter animates → reveal paragraphs
    tl.to(
      pRefs.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.3,
        ease: "power3.out",
      },
      "+=0.5" // wait a bit after last letter
    );
  }, [data.hero.word1, data.hero.word3]); // Re-run when text changes

  // mouse trail effect
  useEffect(() => {
    if (!containerRef.current) return;

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
        { scale: 0.6, opacity: 0, borderRadius: "50%", x: `-=${dirX * 80}`, y: `-=${dirY * 80}` },
        { scale: 1, opacity: 1, borderRadius: 0, duration: 1.4, rotate: rotation, ease: "power3.out", x: `+=${dirX * 180}`, y: `+=${dirY * 180}` }
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
      className="relative z-[999] bg-black h-screen text-white flex flex-col items-center justify-center gap-4 md:gap-8 overflow-hidden"
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
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-fahkwang font-bold overflow-hidden tracking-widest uppercase flex flex-col md:flex-row items-center whitespace-nowrap">
          <EditableText section="hero" field="word1" as="span" className="flex">
            {data.hero.word1.split("").map((char, ci) => (
              <span key={`w1-${ci}`} data-char={char} className="letter inline-block will-change-transform">
                &nbsp;
              </span>
            ))}
          </EditableText>
          <span className="flex items-center mx-4 md:mx-8">
            <span ref={(el) => { if (el && !pRefs.current.includes(el)) pRefs.current.push(el); }} className="hero-text opacity-0 translate-y-6 text-lg md:text-2xl text-[#A493F7] tracking-normal font-mono font-medium">
              <EditableText section="hero" field="subtitle1">
                {data.hero.subtitle1}
              </EditableText>
            </span>
          </span>
          <EditableText section="hero" field="word3" as="span" className="flex">
            {data.hero.word3.split("").map((char, ci) => (
              <span key={`w3-${ci}`} data-char={char} className="letter inline-block will-change-transform">
                &nbsp;
              </span>
            ))}
          </EditableText>
        </h1>
      </div>
    </div>
  );
};

export default Hero;
