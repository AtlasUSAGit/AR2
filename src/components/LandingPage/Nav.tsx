import React, { useState } from "react";
import { motion } from "motion/react";

const Nav = () => {
  const navItems = [
    {
      id: 1,
      title: "Hero",
      img: "/imgs/img-1.png",
      link: "#home",
    },
    {
      id: 2,
      title: "Studios",
      img: "/imgs/img-2.png",
      link: "#about",
    },
    {
      id: 3,
      title: "Recognition",
      img: "/imgs/img-3.png",
      link: "#projects",
    },
    {
      id: 4,
      title: "Work",
      img: "/imgs/img-4.jpeg",
      link: "#contact",
    },
  ];
  const [open, setOpen] = useState<boolean>(false);
  const [mouseHover, setMouseHover] = useState<boolean>(false);
  const activeUser = true; // Assume always logged in for AR_APP

  return (
    <div className="z-[995]">
      <div
        onMouseEnter={() => setMouseHover(true)}
        onMouseLeave={() => setMouseHover(false)}
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[995] h-12 w-full max-w-xs md:max-w-xl rounded-2xl bg-zinc-900 border border-zinc-700 text-white px-4 flex items-center shadow-2xl ${
          open ? "justify-end z-[1005]" : "justify-between z-[995]"
        } cursor-pointer hover:border-purple-500 transition-colors`}
      >
        <div className={` ${open ? "hidden" : "flex"} gap-3 items-center `}>
          <div className="relative overflow-hidden flex items-center justify-center">
             <div className="w-5 h-5 bg-purple-500 rounded-full" />
          </div>
          
          <motion.div className="relative md:w-[300px] overflow-hidden h-6 text-sm font-bold tracking-widest uppercase flex items-center">
            <motion.div
              animate={!mouseHover && activeUser ? { y: 0 } : { y: "-100%" }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
              className="absolute"
            >
              UKB FedComm Ops
            </motion.div>

            <motion.div
              animate={mouseHover && activeUser ? { y: 0 } : { y: "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut", delay: 0.1 }}
              className="absolute top-0 left-0 text-purple-400"
            >
              Open Navigation
            </motion.div>
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className={`${
              open ? "hidden" : "block"
            } bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl`}
          >
            {open ? "open" : "menu"}
          </button>
          
          <div className="relative w-6 h-6 cursor-pointer">
            <div
              className={`absolute top-1/2 left-0 h-0.5 w-full bg-white rounded transition-transform duration-300 ${
                open ? "-rotate-90 scale-x-0" : "rotate-0 scale-x-100"
              }`}
            />
            <div
              className={`absolute top-1/2 left-1/2 h-0.5 w-full bg-white rounded transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${
                open ? "rotate-0 " : "rotate-90  "
              }`}
            />
          </div>
        </div>
      </div>

      <motion.div
        animate={
          open
            ? { maxHeight: 480, zIndex: "1000", opacity: 1 }
            : { maxHeight: 50, zIndex: "990", opacity: 0 }
        }
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 h-[480px] w-full max-w-xs md:max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl text-white flex flex-col items-start py-6 px-8 overflow-hidden pointer-events-auto"
      >
        <div className="w-full flex justify-between items-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-purple-400 font-sans tracking-tight">System Navigation</h2>
          <button className={`bg-zinc-800 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-zinc-700 transition`}>
            Command Center
          </button>
        </div>
        <ul className="w-full flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none' }}>
          {navItems.map((item, idx) => (
            <li
              key={idx}
              className="h-20 w-full flex items-center gap-4 p-4 border-b border-zinc-800/50 group cursor-pointer hover:bg-zinc-900/50 transition-colors rounded-lg"
              onClick={() => {
                const el = document.getElementById(item.link.substring(1));
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                  setOpen(false);
                }
              }}
            >
              <div className="h-12 w-12 rounded overflow-hidden border border-zinc-800">
                <img
                  src={item.img}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-500"
                />
              </div>
              <h2 className="text-xl font-medium tracking-wide group-hover:translate-x-4 transition-transform duration-300 group-hover:text-purple-400">
                {item.title}
              </h2>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default Nav;
