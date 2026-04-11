'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import CartDropdown from '@/components/nav/CartDropdown';
import Image from 'next/image';
import logo from '@/public/logo.svg';

export default function Navbar() {
  const { isMenuOpen, toggleMenu } = useStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 mx-auto w-full max-w-500 p-1 transition-all duration-500"
    >
      <div
        className={`bg-cafio flex items-center justify-between rounded-xl px-6 py-6 backdrop-blur-md transition-colors duration-500 ${scrolled ? 'bg-white/80 shadow-2xl' : 'bg-transparent'}`}
      >
        <div className="flex items-center gap-2">
          <Menu
            className="h-6 w-6 cursor-pointer text-white transition-colors hover:text-amber-500"
            onClick={toggleMenu}
          />
        </div>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 cursor-pointer text-xl font-bold tracking-[0.25em] text-white transition-colors duration-300 hover:text-amber-500"
        >
          <Image src={logo} alt="Le Cafio Logo" width={120} height={40} />
        </Link>

        <div className="flex items-center gap-4">
          <CartDropdown />
        </div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isMenuOpen ? '100vh' : '0vh',
          opacity: isMenuOpen ? 1 : 0,
        }}
        style={{ pointerEvents: isMenuOpen ? 'auto' : 'none' }}
        className="bg-cafio fixed top-0 left-0 -z-10 flex w-full flex-col items-center justify-center overflow-hidden border-b border-zinc-800 backdrop-blur-2xl"
      >
        <div className="flex flex-col items-center gap-10 text-3xl font-thin tracking-[0.3em] text-white uppercase">
          <Link
            href="/"
            onClick={toggleMenu}
            className="transform transition-colors duration-300 hover:scale-105 hover:text-amber-500"
          >
            Home
          </Link>
          <Link
            href="/menu"
            onClick={toggleMenu}
            className="transform transition-colors duration-300 hover:scale-105 hover:text-amber-500"
          >
            Order Now
          </Link>
          <Link
            href="/menu.pdf"
            onClick={toggleMenu}
            className="transform transition-colors duration-300 hover:scale-105 hover:text-amber-500"
          >
            View Menu
          </Link>
        </div>
      </motion.div>
    </motion.nav>
  );
}
