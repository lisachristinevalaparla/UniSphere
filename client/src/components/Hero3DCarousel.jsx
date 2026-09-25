import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Check, Users, ChevronLeft, ChevronRight } from 'lucide-react';

const carouselSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
    title: 'Open Campus / Computer Science',
    meta: 'Semester 06',
    cursorTag: 'Aryan (Studying ML)',
    caption: 'Department of Computing & Information Networks',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80',
    title: 'Collaborative Lab / Sprint 04',
    meta: 'Lab 302',
    cursorTag: 'Rhea (Reviewing PR)',
    caption: 'Distributed Systems & Cloud Computing Lab',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1200&auto=format&fit=crop&q=80',
    title: 'Central Library / Quiet Study',
    meta: 'Curated Archive',
    cursorTag: 'Prof. Nair (Uploaded Unit 4)',
    caption: 'Verified Course Notes & Research Archives',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80',
    title: 'Auditorium / Placement Summit',
    meta: 'Drive 01',
    cursorTag: 'Placement Cell (Google Drive Open)',
    caption: 'Tier-1 Campus Recruitment & Tech Summit',
  },
];

const Hero3DCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  // Auto cycle every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = carouselSlides.length - 1;
      if (next >= carouselSlides.length) next = 0;
      return next;
    });
  };

  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      paginate(1);
    } else if (info.offset.x > swipeThreshold) {
      paginate(-1);
    }
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 120 : -120,
      rotateY: dir > 0 ? -12 : 12,
      opacity: 0,
      scale: 0.94,
    }),
    center: {
      x: 0,
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        rotateY: { duration: 0.45, ease: 'easeOut' },
        opacity: { duration: 0.35 },
        scale: { duration: 0.4 },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? -120 : 120,
      rotateY: dir > 0 ? 12 : -12,
      opacity: 0,
      scale: 0.94,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        rotateY: { duration: 0.4, ease: 'easeIn' },
        opacity: { duration: 0.25 },
        scale: { duration: 0.35 },
      },
    }),
  };

  const currentSlide = carouselSlides[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative rounded-3xl overflow-hidden border border-[#e2e5f0] dark:border-[#26282e] shadow-2xl bg-[#e6e9f6] dark:bg-[#18191d] select-none"
      style={{ perspective: 1200 }}
    >
      <div className="relative h-[420px] sm:h-[480px] w-full overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Grayscale Campus Photo */}
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover grayscale contrast-125 brightness-95 dark:brightness-80 pointer-events-none"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

            {/* Changing Corner Badge Labels (Matching reference exploration tags) */}
            <div className="absolute top-4 left-4 z-10">
              <motion.span
                key={`badge-left-${currentSlide.id}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white/95 dark:bg-black/85 backdrop-blur-md text-[#111827] dark:text-white shadow-md border border-white/20 dark:border-white/10 inline-block"
              >
                {currentSlide.title}
              </motion.span>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <motion.span
                key={`badge-right-${currentSlide.id}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white/95 dark:bg-black/85 backdrop-blur-md text-[#111827] dark:text-white shadow-md border border-white/20 dark:border-white/10 inline-block"
              >
                {currentSlide.meta}
              </motion.span>
            </div>

            {/* Interactive User Cursor Badge */}
            <div className="absolute top-1/3 right-1/4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/95 dark:bg-emerald-900/90 backdrop-blur-sm border border-emerald-300 dark:border-emerald-700 text-[11px] font-semibold text-emerald-900 dark:text-emerald-100 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentSlide.cursorTag}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Floating Live Activity Comment Card (Permanent overlay, independent of slides) */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.35, ease: 'easeOut' }}
          className="absolute bottom-16 left-6 right-6 sm:left-8 sm:right-auto sm:max-w-xs activity-bubble-card z-20 pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces"
                alt="Priya Sharma"
                className="w-7 h-7 rounded-full object-cover grayscale border border-white/20"
              />
              <div>
                <span className="text-xs font-bold text-[#111827] dark:text-white block">Priya Sharma</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">just now</span>
              </div>
            </div>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>

          <p className="text-xs text-[#374151] dark:text-[#d1d5db] mb-3 leading-relaxed">
            Submitted Assignment 3: Neural Networks with 98% test accuracy. Ready for review!
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-[#e2e5f0] dark:border-[#272a33]">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Coursework submitted</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-200 transition-colors"
            >
              <Check className="w-3 h-3" />
              <span>On track</span>
            </button>
          </div>
        </motion.div>

        {/* Carousel Navigation Arrows */}
        <button
          type="button"
          onClick={() => paginate(-1)}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 hover:opacity-100 sm:group-hover:opacity-100"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => paginate(1)}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 hover:opacity-100 sm:group-hover:opacity-100"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Bottom Slide Indicators & Status Bar */}
        <div className="absolute bottom-4 left-6 z-20 flex items-center gap-1.5">
          {carouselSlides.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 bg-white shadow-sm'
                  : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-medium border border-white/10">
          <Users className="w-3 h-3 text-emerald-400" />
          <span>3,400+ students active</span>
          <span className="text-emerald-400 font-semibold">✓ Live Sync</span>
        </div>
      </div>
    </div>
  );
};

export default Hero3DCarousel;
