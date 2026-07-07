import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLandingPage } from "./LandingPageContext";
import EditableText from "./EditableText";

const Testimonials = () => {
  const { data } = useLandingPage();
  const outerRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!outerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: outerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    cardsRef.current.forEach((card, index) => {
      if (!card) return;
      const step = 30; // Space out the cards
      const targetLeft = 5 + index * step;
      
      tl.to(card, {
        x: `-${100 - targetLeft}vw`,
        ease: "none",
      });
    });

    return () => {
      tl.kill();
    };
  }, [data.testimonials.items.length]);

  return (
    <div 
      className="bg-zinc-950 text-white relative z-[50]" 
      ref={outerRef}
      style={{ height: `${data.testimonials.items.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden" ref={containerRef}>
        <div className="absolute top-20 w-full text-center">
           <h2 className="text-4xl md:text-5xl font-bold text-purple-400 tracking-wider uppercase">
             <EditableText section="testimonials" field="title" />
           </h2>
        </div>
          
          <div className="relative w-full h-[500px]">
            {data.testimonials.items.map((review, idx) => (
              <div 
                key={idx}
                ref={el => { cardsRef.current[idx] = el; }}
                className="absolute top-1/2 -translate-y-1/2 w-[320px] md:w-[380px] bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl flex flex-col justify-between will-change-transform"
                style={{ left: "100%", height: "350px" }}
              >
                <p className="text-lg leading-relaxed text-zinc-300 italic flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none' }}>
                  “<EditableText section="testimonials" arrayField="items" index={idx} field="quote" />”
                </p>
                <div className="border-t border-zinc-800 pt-6 mt-4 shrink-0">
                  <h2 className="font-bold text-white uppercase tracking-wider">
                    <EditableText section="testimonials" arrayField="items" index={idx} field="name" />
                  </h2>
                  <h4 className="text-purple-400 font-mono text-sm mt-1">
                    <EditableText section="testimonials" arrayField="items" index={idx} field="role" />
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
