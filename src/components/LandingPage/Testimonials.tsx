import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLandingPage } from "./LandingPageContext";
import EditableText from "./EditableText";
import EditableImage from "./EditableImage";

const Testimonials = () => {
  const { data } = useLandingPage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const itemsCount = data.testimonials.items.length;
    
    // Create a scroll trigger that updates the active index based on scroll progress
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        // self.progress goes from 0 to 1
        const index = Math.min(
          Math.floor(self.progress * itemsCount),
          itemsCount - 1
        );
        setActiveIndex(index);
      },
    });

    return () => {
      st.kill();
    };
  }, [data.testimonials.items.length]);

  return (
    <div className="section_tabs padding-section-large bg-zinc-950 text-white">
      {/* Dynamic height based on number of testimonials */}
      <div 
        ref={containerRef} 
        className="tabs_height" 
        style={{ height: `${data.testimonials.items.length * 100}vh` }}
      >
        <div className="tabs_sticky-wrapper">
          <div className="tabs_container">
            <div className="tabs_component">
              
              <div className="tabs_left">
                {data.testimonials.items.map((review, idx) => (
                  <div 
                    key={idx} 
                    className={`tabs_let-content ${activeIndex === idx ? 'is-active' : ''}`}
                  >
                    <h2 className="text-4xl md:text-5xl font-bold text-purple-400 mb-6">
                      <EditableText section="testimonials" field="title" />
                    </h2>
                    <p className="text-lg md:text-2xl leading-relaxed text-zinc-300 mb-8">
                      “<EditableText section="testimonials" arrayField="items" index={idx} field="quote" />”
                    </p>
                    <div className="text-lg border-t border-zinc-800 pt-6">
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

              <div className="tabs_right bg-black/50 border border-zinc-800 flex items-center justify-center p-10">
                {data.testimonials.items.map((review, idx) => (
                  <div 
                    key={idx} 
                    className={`tabs_video ${activeIndex === idx ? 'is-active' : ''} flex items-center justify-center p-12`}
                  >
                    <EditableImage
                      section="testimonials"
                      arrayField="items"
                      index={idx}
                      field="company"
                    >
                      <img
                        src={review.company}
                        alt="Company Logo"
                        className="w-full max-w-[300px] h-auto object-contain filter brightness-200 opacity-80"
                      />
                    </EditableImage>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
