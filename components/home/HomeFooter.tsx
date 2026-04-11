'use client';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const CoffeeBean = ({ size = 24, id = "beanMask" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <mask id={id}>
      <ellipse cx="12" cy="12" rx="9" ry="11" fill="white" />
      <path d="M 12 1 C 16 8 8 16 12 23" stroke="black" strokeWidth="2" fill="none" strokeLinecap="round" />
    </mask>
    <ellipse cx="12" cy="12" rx="9" ry="11" fill="currentColor" mask={`url(#${id})`} />
  </svg>
);

const DROP_CONFIG = [
  { left: '15%', delay: 0, size: 20, duration: 6.5 },
  { left: '30%', delay: 1.2, size: 16, duration: 7.2 },
  { left: '45%', delay: 0.5, size: 24, duration: 6.8 },
  { left: '60%', delay: 2.1, size: 18, duration: 7.5 },
  { left: '75%', delay: 0.8, size: 22, duration: 6.6 },
  { left: '90%', delay: 1.7, size: 14, duration: 7.0 },
];
const HomeFooter = () => {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute max-h-[2.5vh] w-full">
        {DROP_CONFIG.map((drop, index) => (
          <motion.div
            key={index}
            initial={{ y: -40, opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{
              y: [0, 150],
              opacity: [0, 0.8, 0],
              scale: [0.8, 1, 0.5],
              rotate: [0, 90, 180],
            }}
            transition={{
               duration: drop.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: drop.delay,
            }}
            className="absolute text-[#694b43]"
            style={{
              left: drop.left,
              top: 0,
            }}
          >
            <CoffeeBean size={drop.size} id={`beanMask-${index}`} />
          </motion.div>
        ))}
      </div>
      <footer className="py-3">
        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="grid grid-cols-1 text-center">
            <h2 className="text-cafio flex flex-col items-center justify-center gap-2 text-lg font-bold">
              <MapPin color="#694b43" />
              LE CAFIO | ADNEC
            </h2>
            <p className="text-cafio font-md text-xs tracking-widest uppercase">
              36 AZ ZUMURRUD ST - AL MA’ARID CAPITAL CENTRE - W59 01 - <br />
              ABU DHABI, U.A.E
            </p>
          </div>
          <div className="grid grid-cols-1 text-center">
            <h2 className="text-cafio flex flex-col items-center justify-center gap-2 text-lg font-bold">
              <MapPin color="#694b43" />
              LE CAFIO | AL REEM ISLAND
            </h2>
            <p className="text-cafio font-md text-xs tracking-widest uppercase">
              Y TOWER REEM 1 - AL REEM ISLAND RT6 - <br />
              ABU DHABI, U.A.E
            </p>
          </div>
        </div>
        <div className="flex justify-center gap-8 pt-5 text-sm font-light tracking-widest text-zinc-500 uppercase">
          <a
            href="https://www.instagram.com/lecafioadnec?igsh=NTV4dWw0ZGlleXV1"
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer transition-colors hover:text-amber-500"
          >
            Instagram
          </a>

          <a href="#" className="cursor-pointer transition-colors hover:text-amber-500">
            Contact
          </a>
        </div>

        <p className="py-2 text-center text-xs font-light tracking-wider text-[#3B1C15]">
          &copy; {new Date().getFullYear()} LECAFIO | All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomeFooter;
