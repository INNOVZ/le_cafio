'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Dot } from 'lucide-react';
import Link from 'next/link';
import Banner from '@/public/bnr.webp';

const HomeBanner = () => {
  return (
    <section className="relative max-h-[70vh] w-full overflow-hidden md:max-h-[85vh]">
      {/* Dark Top Section with SVG Mask */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="bg-cafio relative h-[70vh] w-full text-white md:flex md:h-[80vh] md:items-center md:justify-start md:px-24"
        style={{
          clipPath: 'url(#torn-paper-edge)',
          WebkitClipPath: 'url(#torn-paper-edge)',
        }}
      >
        <div className="flex h-[80vh] w-full flex-col items-center justify-center px-5 text-center md:grid md:grid-cols-2 md:px-0 md:text-left">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="text-cafio-sec flex items-center justify-center gap-1 text-center text-xs leading-relaxed opacity-90 md:justify-start md:text-sm">
              TEA VARIETIES <Dot /> AFFOGATO <Dot /> ICED MENU
            </p>
            <h1 className="mb-3 text-center text-3xl leading-tight font-bold uppercase md:text-left md:text-5xl">
              Taste of Legacy <br />
              <span className="text-cafio-tir">Food</span> Experience
            </h1>
            <p className="mb-10 max-w-md text-center text-lg leading-relaxed opacity-90 md:text-left">
              Breakfast to Brunch, Lunch to Dinner, and everything in between.
            </p>
            <div className="flex items-center justify-center gap-8 md:justify-start">
              <Link
                href="/menu"
                className="text-cafio-tir border-cafio-tir hover:text-cafio hover:bg-cafio-tir inline-flex cursor-pointer items-center rounded-full border px-4 py-2 transition-all duration-300 md:px-8 md:py-3"
              >
                Order Now ↗
              </Link>
              <a
                href="/menu.pdf"
                target="_blank"
                rel="noreferrer"
                className="hover:text-cafio-tir flex cursor-pointer items-center gap-2 transition-colors"
              >
                View Menu ↗
              </a>
            </div>
          </motion.div>
          <motion.div
            initial={{ y: 45, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="relative hidden h-full min-h-100 w-full md:flex md:items-center md:justify-center"
          >
            <Image
              src={Banner}
              alt="Home Banner"
              width={400}
              height={620}
              className="h-full w-full translate-y-8 object-contain drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* SVG Mask Definition (Hidden) */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <clipPath id="torn-paper-edge" clipPathUnits="objectBoundingBox">
            <path d="M0,0 L1,0 L1,0.92 C0.95,0.95 0.9,0.91 0.85,0.93 C0.8,0.95 0.75,0.89 0.7,0.92 C0.65,0.95 0.6,0.9 0.55,0.93 C0.5,0.96 0.45,0.91 0.4,0.94 C0.35,0.97 0.3,0.91 0.25,0.94 C0.2,0.97 0.15,0.91 0.1,0.94 C0.05,0.97 0,0.93 0,0.96 Z" />
          </clipPath>
        </defs>
      </svg>
    </section>
  );
};

export default HomeBanner;
