import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLandingPage } from "./LandingPageContext";
import EditableText from "./EditableText";
import Slider from "./Slider";

const About = () => {
  const { data } = useLandingPage();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".about-title span", {
        y: "100%",
        duration: 0.6,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 50%",
          end: "bottom 20%",
          toggleActions: "play reverse play reverse",
        },
      });

      gsap.from(".bio p span", {
        y: "100%",
        duration: 0.6,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 35%",
          toggleActions: "play reverse play reverse",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [data.about.bioText]);

  return (
    <div ref={containerRef} className="min-h-screen p-4 lg:p-10 text-white">
      <h2 className="text-3xl lg:text-4xl max-w-[950px] mt-10">
        <span className="inline-block text-xl font-medium -translate-y-5 mr-20 lg:mr-[400px] overflow-hidden about-title">
          <EditableText section="about" field="title" as="span" className="block" />
        </span>

        <EditableText section="about" field="bioText" as="span" className="bio block mt-8">
          {data.about.bioText.split(" ").map((word, idx) => (
            <p key={idx} className="inline-block mr-2 overflow-hidden">
              <span className="block">{word}</span>
            </p>
          ))}
        </EditableText>
      </h2>
       
      <Slider />
    </div>
  );
};

export default About;
