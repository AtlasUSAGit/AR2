import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const Loader = () => {
  const words = [
    "Welcome",
    "Bienvenido",
    "Bienvenue",
    "Willkommen",
    "Benvenuto",
    "ようこそ",
    "欢迎",
    "Добро пожаловать",
    "स्वागत है",
  ];

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [done, setDone] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip loader on mobile for instant login experience
    if (window.innerWidth < 768) {
      setDone(true);
      return;
    }

    if (index < words.length - 1) {
      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setIndex((prev) => prev + 1);
          setFade(true);
        }, 150);
      }, 300);

      return () => clearInterval(interval);
    } else {
      const timeout = setTimeout(() => {
        if (loaderRef.current) {
          gsap.to(loaderRef.current, {
            scale: 0.5,
            y: -200,
            opacity: 0,
            duration: 1,
            ease: "power3.inOut",
            onComplete: () => setDone(true),
          });
        }
      }, 1200);

      return () => clearTimeout(timeout);
    }
  }, [index]);

  if (done) return null;

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-[99999] h-screen w-screen flex items-center justify-center bg-black text-white text-4xl font-bold"
    >
      <span
        className={`transition-opacity duration-500 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {words[index]}
      </span>
    </div>
  );
};

export default Loader;
