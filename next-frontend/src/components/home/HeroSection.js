'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const localImages = [
  '/hero-section.webp',
  '/hero-section-2.jpg',
  '/hero-section-3.jpg'
];

const imageVariants = {
  enter: (direction) => ({
    opacity: 0,
    scale: 1.1,
    x: direction > 0 ? 100 : -100,
  }),
  center: {
    zIndex: 1,
    opacity: 1,
    scale: 1,
    x: 0,
  },
  exit: (direction) => ({
    zIndex: 0,
    opacity: 0,
    scale: 0.95,
    x: direction > 0 ? -100 : 100,
  }),
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  const [[current, direction], setCurrent] = useState([0, 0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(([prev]) => [prev + 1, 1]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentIndex = current % localImages.length;

  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 1.2,
              ease: [0.33, 1, 0.68, 1],
            }}
            className="absolute inset-0"
          >
            <Image
              src={localImages[currentIndex]}
              alt="Movie Backdrop"
              fill
              priority
              quality={80}
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="text-center px-6 z-10 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={textVariants}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl"
              variants={textVariants}
            >
              Your <span className="text-red-500">Cinematic Journey</span> Begins Here
            </motion.h1>
            <motion.p
              className="text-lg md:text-2xl text-white mb-6 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-lg"
              variants={textVariants}
              transition={{ delay: 0.4 }}
            >
              Discover blockbuster movies, exclusive content, and unforgettable cinematic experiences.
            </motion.p>
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: '0 8px 25px rgba(229, 9, 20, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-lg text-lg md:text-xl relative overflow-hidden"
            >
              <Link href="/movies" className="relative z-10">
                Explore Movies
              </Link>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-700/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {localImages.map((_, index) => (
          <motion.div
            key={index}
            className={`w-3 h-3 rounded-full cursor-pointer ${currentIndex === index ? 'bg-red-500' : 'bg-white/50'}`}
            onClick={() => setCurrent([index, index > currentIndex ? 1 : -1])}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>
    </section>
  );
}