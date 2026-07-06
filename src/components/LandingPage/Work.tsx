import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLandingPage } from "./LandingPageContext";
import EditableText from "./EditableText";
import EditableImage from "./EditableImage";
import { ServiceData } from "./landingPageSchema";

const Work = () => {
  const { data } = useLandingPage();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.from(".work-title span", {
      y: "100%",
      duration: 0.6,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play reverse play reverse",
      },
    });
  }, []);

  return (
    <div ref={containerRef} className="relative z-[400] h-fit p-4 bg-black text-white">
      <h2 className="text-3xl max-w-[950px] overflow-hidden work-title mb-10 pl-4 md:pl-10 pt-10">
        <span className="block text-purple-400 font-bold">
          <EditableText section="work" field="title" />
        </span>
      </h2>

      <div className="min-h-screen">
        {data.work.services.map((service, index) => (
          <Card key={service.id} service={service} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Work;

const Card: React.FC<{ service: ServiceData; index: number }> = ({ service, index }) => {
  const { updateArrayData } = useLandingPage();

  return (
    <div className="sticky top-0 left-0 bg-black border-t border-zinc-800 h-screen flex flex-col lg:flex-row justify-between my-5 p-4 md:p-10 overflow-hidden shadow-2xl">
      <div className="flex-[0.3] md:flex-[0.4] flex flex-row justify-between items-start p-2">
        <h2 className="text-7xl md:text-9xl font-medium text-purple-600/50 font-mono">0{service.id}</h2>
        <h4 className="text-xl font-bold uppercase tracking-widest mt-4">
          <EditableText section="work" arrayField="services" index={index} field="title" />
        </h4>
      </div>

      <div className="flex-[0.7] md:flex-[0.4] flex flex-col justify-between items-start gap-7 md:gap-3 mt-6 md:mt-0">
        <p className="text-2xl sm:text-3xl font-light leading-snug">
          <EditableText section="work" arrayField="services" index={index} field="description" />
        </p>

        <EditableImage
          section="work"
          onUpdateUrlOverride={(newUrl) => {
            updateArrayData('work', 'services', index, 'media', { ...service.media, url: newUrl });
          }}
        >
          {service.media.type === "image" ? (
            <img
              src={service.media.url}
              alt={service.title}
              className="h-[200px] w-full md:w-[400px] object-cover rounded-lg shadow-xl"
            />
          ) : (
            <iframe
              src={`${service.media.url}?autoplay=1&mute=1&controls=0&loop=1&playlist=${service.media.url.split("/").pop()}`}
              title={service.title}
              className="h-[200px] w-full md:w-[400px] object-cover mt-5 rounded-lg border border-zinc-800"
              frameBorder="0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </EditableImage>

        <div className="flex justify-start flex-wrap gap-8 mt-8 md:mt-5 text-zinc-400 font-mono text-sm">
          {service.services.map((group, i) => (
            <ul key={i} className="space-y-2">
              {group.map((item, j) => (
                <li key={j} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full inline-block"></span>
                  {item}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </div>
  );
};
