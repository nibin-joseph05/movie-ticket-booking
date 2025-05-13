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
    enter: { opacity: 0, scale: 1.1, rotate: 0.5, filter: 'blur(4px)' },
    center: { opacity: 1, scale: 1, rotate: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 1.1, rotate: -0.5, filter: 'blur(4px)' }
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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute border-2 border-white/10 rounded-full"
            initial={{
              scale: 0,
              opacity: 0,
              x: Math.random() * 100 - 50 + '%',
              y: Math.random() * 100 - 50 + '%'
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.3, 0],
              rotate: 360
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              width: `${50 + Math.random() * 100}px`,
              height: `${50 + Math.random() * 100}px`
            }}
          />
        ))}
      </div>

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

          {/* Dynamic gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />

          {/* Animated noise texture */}
          <motion.div
            className="absolute inset-0 bg-noise opacity-15 pointer-events-none"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
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
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent relative">
              <motion.span
                className="absolute -inset-4 bg-gradient-to-r from-red-500/30 to-orange-400/30 blur-3xl"
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              Cinematic Excellence
            </span>
            <br />
            <motion.span
              className="inline-block"
              animate={{
                textShadow: [
                  '0 0 10px rgba(255,255,255,0.3)',
                  '0 0 20px rgba(255,255,255,0.5)',
                  '0 0 10px rgba(255,255,255,0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Starts Here
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed relative"
            variants={textVariants}
            transition={{ type: 'spring', stiffness: 60, delay: 0.2 }}
          >
            <motion.span
              className="absolute -inset-4 bg-gradient-to-r from-red-500/10 to-orange-400/10 blur-xl"
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            Discover blockbuster movies, exclusive content, and unforgettable cinematic experiences.
          </motion.p>

          <motion.div
            variants={textVariants}
            transition={{ type: 'spring', stiffness: 60, delay: 0.4 }}
            className="pt-4 relative"
          >
            <div className="absolute -inset-4 bg-red-500/10 blur-3xl animate-pulse" />
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
                <span className="relative z-10 flex items-center gap-2">
                  Explore Collection
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                {/* Enhanced shine effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -inset-12 top-0 left-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />
                </div>
                {/* Particle effect on hover */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                        x: Math.random() * 100 - 50 + 'px',
                        y: Math.random() * 100 - 50 + 'px'
                      }}
                      transition={{ duration: 0.6 }}
                    />
                  ))}
                </div>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Pagination Dots */}
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
              className="w-2.5 h-2.5 rounded-full bg-white relative"
              animate={{
                scale: currentIndex === index ? 1 : 0.7,
                opacity: currentIndex === index ? 1 : 0.5
              }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {currentIndex === index && (
                <motion.div
                  className="absolute inset-0 border-2 border-white/30 rounded-full"
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
          </motion.button>
        ))}
      </div>

      {/* Parallax Scrolling indicator */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.5, repeatType: 'mirror' }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-white/80 relative"
          whileHover={{ scale: 1.2 }}
        >
          <motion.div
            className="w-1 h-2 bg-white/80 rounded-full absolute top-1 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </motion.div>
      </motion.div>

      {/* Ambient light effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ yoyo: Infinity, duration: 3 }}
      >
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-red-500/30 rounded-full blur-3xl mix-blend-screen" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl mix-blend-screen" />
      </motion.div>
    </section>
  );
}