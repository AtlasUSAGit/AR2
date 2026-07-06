import React, { useRef, useState, useEffect } from "react";

const images = [
  "/imgs/img-1.png",
  "/imgs/img-2.png",
  "/imgs/img-3.png",
  "/imgs/img-4.jpeg",
  "/imgs/img-5.jpeg",
  "/imgs/img-1.png",
  "/imgs/img-2.png",
];

const Slider = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setIsPressed(true);
    startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
    scrollLeft.current = scrollRef.current?.scrollLeft || 0;
  };

  const onMouseMove = (e: MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const stopDragging = () => {
    isDragging.current = false;
    setIsPressed(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("mouseleave", stopDragging);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("mouseleave", stopDragging);
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => {
          setIsHover(false);
          setIsPressed(false);
        }}
        onMouseDown={onMouseDown}
        className="flex gap-2 pl-32 pr-10 mt-16 overflow-x-auto cursor-none select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}} />
        {images.map((path, idx) => (
          <img
            src={path}
            key={idx}
            alt=""
            className="h-[350px] md:h-[450px] object-cover hide-scrollbar pointer-events-none"
            draggable={false}
          />
        ))}
      </div>

      {isHover && (
        <div
          className="fixed pointer-events-none z-[9999] bg-white rounded-full flex items-center justify-center text-black font-bold text-xs shadow-lg"
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            width: 60,
            height: 60,
            transform: "translate(-50%, -50%)",
            opacity: 0.8
          }}
        >
          {isPressed ? "GRAB" : "DRAG"}
        </div>
      )}
    </div>
  );
};

export default Slider;
