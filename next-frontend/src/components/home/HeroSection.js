'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  const images = [
    '/hero-section.webp',
    '/hero-section-2.jpg',
    '/hero-section-3.jpg'
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  const imgVariants = {
    enter: { opacity: 0, scale: 1.1, rotate: 0.5 },
    center: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 1.1, rotate: -0.5 }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 8000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="relative min-h-[80vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
      <AnimatePresence mode='popLayout'>
        <motion.div
          key={currentIndex}
          variants={imgVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: 'spring',
            mass: 0.4,
            damping: 25,
            stiffness: 100,
            duration: 1.2
          }}
          className="absolute inset-0"
        >
          <Image
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            fill
            quality={100}
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />

          {/* Subtle noise texture */}
          <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Hero content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
          className="space-y-6"
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight"
            variants={textVariants}
            transition={{ type: 'spring', stiffness: 60 }}
          >
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              Cinematic Excellence
            </span>
            <br />
            Starts Here
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed"
            variants={textVariants}
            transition={{ type: 'spring', stiffness: 60, delay: 0.2 }}
          >
            Immerse yourself in world-class movies, exclusive content, and unforgettable storytelling experiences.
          </motion.p>

          <motion.div
            variants={textVariants}
            transition={{ type: 'spring', stiffness: 60, delay: 0.4 }}
            className="pt-4"
          >
            <Link href="/movies" className="inline-block">
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 8px 25px rgba(229, 9, 20, 0.6)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl text-lg md:text-xl relative overflow-hidden group"
              >
                <span className="relative z-10">Explore Collection</span>
                {/* Shine effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -inset-12 top-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />
                </div>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
        {images.map((_, index) => (
          <motion.button
            key={index}
            className={`p-1.5 rounded-full cursor-pointer focus:outline-none ${
              currentIndex === index ? 'bg-red-500' : 'bg-white/30'
            }`}
            onClick={() => setCurrentIndex(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400 }}
            aria-label={`Go to slide ${index + 1}`}
          >
            <motion.div
              className="w-2.5 h-2.5 rounded-full bg-white"
              animate={{
                scale: currentIndex === index ? 1 : 0.7,
                opacity: currentIndex === index ? 1 : 0.5
              }}
              transition={{ type: 'spring', stiffness: 400 }}
            />
          </motion.button>
        ))}
      </div>

      {/* Scrolling indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.5, repeatType: 'mirror' }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/80 relative">
          <motion.div
            className="w-1 h-2 bg-white/80 rounded-full absolute top-1 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </div>
      </motion.div>
    </section>
  );
}