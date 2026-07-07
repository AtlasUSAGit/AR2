import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLandingPage } from "./LandingPageContext";
import EditableText from "./EditableText";

const Testimonials = () => {
  const { data } = useLandingPage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: `+=${window.innerHeight * data.testimonials.items.length}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    cardsRef.current.forEach((card, index) => {
      if (!card) return;
      const total = data.testimonials.items.length;
      const step = 90 / total;
      const finalLeft = `${5 + index * step}%`;
      
      tl.to(card, {
        left: finalLeft,
        ease: "none",
      });
    });

    return () => {
      tl.kill();
    };
  }, [data.testimonials.items.length]);

  return (
    <div className="bg-zinc-950 text-white relative overflow-hidden" ref={containerRef}>
      <div className="h-screen w-full flex flex-col justify-center">
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
                className="absolute top-1/2 -translate-y-1/2 w-[320px] md:w-[380px] bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl flex flex-col justify-between"
                style={{ left: "100vw", height: "350px" }}
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
  );
};

export default Testimonials;
