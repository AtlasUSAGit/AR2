import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLandingPage } from "./LandingPageContext";
import EditableText from "./EditableText";

import EditableImage from "./EditableImage";

const Achievements: React.FC = () => {
  const { data, isEditMode } = useLandingPage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const numberRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current || !numberRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".achievements-text", {
        y: "100%",
        opacity: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 50%",
          toggleActions: "play reverse play reverse",
        },
      });

      gsap.from(".logo", {
        opacity: 0,
        scale: 0.6,
        stagger: 0.15,
        duration: 0.8,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          toggleActions: "play reverse play reverse",
        },
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: numberRef.current,
          start: "top 80%",
          toggleActions: "play reverse play reverse",
        },
      });

      const obj = { val: 0 };

      tl.from(numberRef.current, {
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      }).to(obj, {
        val: data.achievements.number,
        duration: 2,
        ease: "power1.out",
        onUpdate: () => {
          if (numberRef.current) {
            numberRef.current.innerText = Math.floor(obj.val).toString();
          }
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [data.achievements.number, data.achievements.description1, data.achievements.description2]);

  return (
    <div ref={containerRef} className="min-h-fit lg:min-h-screen p-4 lg:p-10 overflow-hidden text-white bg-black">
      <div className="flex flex-col md:flex-row md:justify-between">
        <div className="flex-1">
          <h2 className="text-3xl overflow-hidden">
            <span className="block achievements-text">
              <EditableText section="achievements" field="title" />
            </span>
          </h2>
        </div>
        <div className="flex-1 flex flex-col mt-5">
          <div className="text-sm overflow-hidden text-zinc-300">
            <EditableText section="achievements" field="description1" as="span">
              {data.achievements.description1.split(" ").map((ch, idx) => (
                <p key={idx} className="inline-block mr-2 overflow-hidden leading-[0.9]">
                  <span className="block achievements-text">{ch}</span>
                </p>
              ))}
            </EditableText>
          </div>

          <div className="grid grid-cols-4 mt-10 gap-3 md:gap-6 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            {data.achievements.companies.map((company, idx) => (
              <EditableImage 
                key={idx}
                section="achievements"
                arrayField="companies"
                index={idx}
                isStringArray={true}
              >
                <img
                  src={company}
                  alt=""
                  className="w-16 h-16 md:w-20 md:h-20 object-contain logo opacity-80 hover:opacity-100 transition-opacity"
                />
              </EditableImage>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row mt-12 md:mt-20 overflow-hidden">
        <div className="flex flex-col overflow-hidden">
          <h5 className="text-lg -mb-3 ml-2 overflow-hidden text-zinc-400">
            <span className="achievements-text">
              <EditableText section="achievements" field="labelAwards" />
            </span>
          </h5>
          <h2
            className="text-8xl md:text-[9rem] font-bold tracking-tight overflow-hidden text-purple-500"
            style={{ minWidth: "6ch" }}
          >
            {isEditMode ? (
              <EditableText section="achievements" field="number" />
            ) : (
              <span ref={numberRef}>0</span>
            )}
          </h2>
        </div>
        <h4 className="text-sm mt-5 max-w-xs md:max-w-md ml-auto overflow-hidden text-zinc-400">
          <EditableText section="achievements" field="description2" as="span" className="achievements-text block">
            {data.achievements.description2.split(" ").map((ch, idx) => (
              <p key={idx} className="inline-block mr-2 overflow-hidden leading-[0.9]">
                <span className="block achievements-text">{ch}</span>
              </p>
            ))}
          </EditableText>
        </h4>
      </div>
    </div>
  );
};

export default Achievements;
