import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useLandingPage } from "./LandingPageContext";
import EditableText from "./EditableText";

const Dashboard: React.FC = () => {
  const { data } = useLandingPage();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".dashboard-title", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%",
          toggleActions: "play reverse play reverse",
        },
      });

      gsap.from(".dashboard-card", {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".dashboard-cards-container",
          start: "top 80%",
          toggleActions: "play reverse play reverse",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-fit py-20 px-4 lg:px-10 bg-black text-white relative overflow-hidden border-t border-zinc-900">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="dashboard-title mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
            <EditableText section="dashboard" field="title" />
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl">
            <EditableText section="dashboard" field="subtitle" />
          </p>
        </div>

        <div className="dashboard-cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {data.dashboard.metrics.map((metric, idx) => (
            <div key={idx} className="dashboard-card bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors shadow-2xl relative overflow-hidden group">
              {/* Subtle hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <h4 className="text-sm font-medium text-zinc-500 tracking-wider mb-4 uppercase">
                <EditableText section="dashboard" arrayField="metrics" index={idx} field="label" />
              </h4>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight break-words">
                <EditableText section="dashboard" arrayField="metrics" index={idx} field="value" />
              </div>
              <div className={`text-sm text-green-400 flex items-center gap-1`}>
                <EditableText section="dashboard" arrayField="metrics" index={idx} field="trend" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
