'use client';

import React from 'react';
import { motion } from 'framer-motion';

const DROP_CONFIG = [
  { left: '15%', delay: 0, size: 12, duration: 2.5 },
  { left: '30%', delay: 1.2, size: 9, duration: 3.2 },
  { left: '45%', delay: 0.5, size: 14, duration: 2.8 },
  { left: '60%', delay: 2.1, size: 10, duration: 3.5 },
  { left: '75%', delay: 0.8, size: 13, duration: 2.6 },
  { left: '90%', delay: 1.7, size: 8, duration: 3.0 },
];

export const CoffeeDrops = () => {
  return (
    <div className="pointer-events-none relative -mt-8 h-32 w-full overflow-hidden opacity-60">
      {DROP_CONFIG.map((drop, index) => (
        <motion.div
          key={index}
          initial={{ y: -40, opacity: 0, scale: 0.8, rotate: 45 }}
          animate={{
            y: [0, 150],
            opacity: [0, 0.8, 0],
            scale: [0.8, 1, 0.5],
            rotate: 45,
          }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: drop.delay,
          }}
          className="absolute bg-[#693824]"
          style={{
            left: drop.left,
            width: drop.size,
            height: drop.size,
            top: 0,
            borderRadius: '0 50% 50% 50%',
            boxShadow: '0px 10px 15px rgba(228, 181, 76, 0.3)',
          }}
        />
      ))}
    </div>
  );
};
