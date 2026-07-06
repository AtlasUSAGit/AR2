import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const Footer = () => {
  const footerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 75%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });

      tl.from(".footer-top > div, .footer-top a", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.15,
      });

      tl.from(
        ".footer-title span",
        {
          yPercent: 120,
          opacity: 0,
          duration: 0.6,
          ease: "power4.out",
          stagger: 0.05,
        },
        "-=0.3"
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={footerRef}
      className="relative z-[999] h-[90vh] sm:h-[70vh] md:h-[100vh] flex flex-col justify-between p-6 pt-10 pb-2 mt-16 bg-white text-black"
    >
      <div className="md:w-7/10 mx-auto footer-top flex flex-col md:flex-row md:justify-between md:mt-10 gap-10 text-sm text-gray-600 w-full max-w-7xl">
        <div>
          <p className="font-medium text-black">General Questions</p>
          <p>hello@ukbfc.gov</p>
          <p className="mt-4 font-medium text-black">Business Enquiries</p>
          <p>contracts@ukbfc.gov</p>
        </div>

        <div>
          <p className="font-medium text-black">Resources</p>
          <ul className="space-y-1">
            <li><a href="#">SBA Guidelines</a></li>
            <li><a href="#">Contracting Officer Hub</a></li>
            <li><a href="#">Bylaws & Governance</a></li>
            <li><a href="#">Security Bulletins</a></li>
            <li><a href="#">Vendor Portal</a></li>
          </ul>
        </div>

        <div>
          <p>Secure Enterprise Gateway.</p>
          <a href="#" className="underline text-black font-semibold">
            Request Clearance
          </a>
        </div>
      </div>

      <h2 className="footer-title text-[3.7rem] sm:text-[4.5rem] md:text-[14rem] lg:text-[18rem] font-semibold text-center text-black leading-none overflow-hidden pb-4">
        {"UKBFC".split("").map((ch, idx) => (
          <span key={idx} className="inline-block overflow-hidden font-aboreto tracking-tighter">
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </h2>
    </div>
  );
};

export default Footer;
