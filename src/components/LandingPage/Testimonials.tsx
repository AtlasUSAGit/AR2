import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import React, { useEffect, useRef } from "react";
import { useLandingPage } from "./LandingPageContext";
import EditableText from "./EditableText";
import EditableImage from "./EditableImage";

const Testimonials = () => {
  const { data } = useLandingPage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || !sliderRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".testimonials-title span", {
      y: "100%",
      duration: 0.6,
      stagger: 0.05,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 90%",
      },
    });

    const slider = sliderRef.current;
    const sections = slider.querySelectorAll(".testimonial") as NodeListOf<HTMLElement>;

    let totalWidth = 0;
    sections.forEach((section) => {
      totalWidth += section.offsetWidth;
    });
    totalWidth -= containerRef.current.offsetWidth;

    const anim = gsap.to(slider, {
      x: -totalWidth,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        end: () => "+=" + totalWidth,
        invalidateOnRefresh: true,
      },
    });

    ScrollTrigger.refresh();

    return () => {
      anim.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="relative p-6 bg-zinc-950 text-white">
      <div className="flex flex-col md:flex-row gap-5 md:gap-20 mb-10 p-2 pt-10">
        <h2 className="text-3xl max-w-[950px] overflow-hidden testimonials-title font-bold text-purple-400">
          <span className="block">
            <EditableText section="testimonials" field="title" />
          </span>
        </h2>
        <p className="max-w-[280px] md:max-w-sm text-sm leading-relaxed text-zinc-400">
          <EditableText section="testimonials" field="description" as="span">
            {data.testimonials.description.split(" ").map((word, idx) => (
              <span key={idx} className="inline-block overflow-hidden mr-1">
                <span className="block">{word}</span>
              </span>
            ))}
          </EditableText>
        </p>
      </div>

      <div className="overflow-hidden">
        <div ref={sliderRef} className="flex h-[80vh]">
          {data.testimonials.items.map((review, idx) => (
            <div
              key={idx}
              className="testimonial shrink-0 w-screen md:w-[60vw] flex flex-col justify-center p-4 md:p-12 border-l border-zinc-800"
            >
              <EditableImage
                section="testimonials"
                arrayField="items"
                index={idx}
                field="company"
              >
                <img
                  src={review.company}
                  alt=""
                  className="w-16 h-16 mb-8 object-contain filter brightness-200"
                />
              </EditableImage>
              <p className="text-lg sm:text-xl md:text-3xl font-medium leading-relaxed mb-8 pr-4 sm:pr-16 text-zinc-200">
                “<EditableText section="testimonials" arrayField="items" index={idx} field="quote" />”
              </p>
              <div className="text-lg mt-auto border-t border-zinc-800 pt-6">
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
  );
};

export default Testimonials;
