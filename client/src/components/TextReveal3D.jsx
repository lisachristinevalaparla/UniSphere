import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ShapeGrid from './ShapeGrid';

/**
 * TextReveal3D
 * True 3D curved perspective cylinder text reveal animation:
 * "THE / ENTIRE / CAMPUS / FINALLY / TOGETHER"
 *
 * Implements:
 * - Interactive ShapeGrid animated canvas background with hover trail
 * - 3D cylindrical concave/convex perspective curvature (rotateX, translateZ, perspective: 800px)
 * - 3D flap entrance animation with cubic-bezier(0.16, 1, 0.3, 1) and top-to-bottom stagger
 * - Interactive mouse 3D tilt tracking for live tactile depth
 * - Heavy uppercase bold sans-serif styling (Impact / Arial Black)
 */
const TextReveal3D = ({
  words = ['THE', 'ENTIRE', 'CAMPUS', 'FINALLY', 'TOGETHER'],
  subtext = 'One unified workspace connecting students, faculty, coursework, and placements.',
}) => {
  const containerRef = useRef(null);

  // Interactive 3D tilt with smooth springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 24, stiffness: 120, mass: 0.2 };
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), springConfig);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Cylinder curvature angles for 5 lines (index 0..4, center is 2)
  const cylinderCurvatures = [
    { rotateX: 20, translateZ: -32, scale: 0.90, opacity: 0.88 },
    { rotateX: 10, translateZ: -10, scale: 0.96, opacity: 0.96 },
    { rotateX: 0, translateZ: 18, scale: 1.02, opacity: 1.0 },
    { rotateX: -10, translateZ: -10, scale: 0.96, opacity: 0.96 },
    { rotateX: -20, translateZ: -32, scale: 0.90, opacity: 0.88 },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.16, // 160ms stagger
      },
    },
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative z-10 w-full py-28 sm:py-36 bg-[#0a0a0c] text-white overflow-hidden select-none border-y border-[#26282e]"
    >
      {/* 1. Dynamic Animated ShapeGrid Background from React Bits (Bigger & Brighter) */}
      <div className="absolute inset-0 z-0 opacity-90 hover:opacity-100 transition-opacity">
        <ShapeGrid
          direction="diagonal"
          speed={0.45}
          squareSize={62}
          borderColor="rgba(255, 255, 255, 0.18)"
          hoverFillColor="rgba(255, 255, 255, 0.15)"
          shape="square"
          hoverTrailAmount={6}
        />
      </div>

      {/* 2. Soft Radial Vignette Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,10,12,0.05)_0%,rgba(10,10,12,0.65)_85%)] pointer-events-none z-[1]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge Chip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/15 mb-12 backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>The Unified Academic Vision</span>
        </motion.div>

        {/* 3D Perspective Container with perspective: 800px and dynamic tilt */}
        <motion.div
          style={{
            perspective: '800px',
            perspectiveOrigin: '50% 50%',
            rotateX: tiltX,
            rotateY: tiltY,
            transformStyle: 'preserve-3d',
          }}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="flex flex-col items-center justify-center space-y-0.5 sm:space-y-1 mb-12"
        >
          {words.map((word, idx) => {
            const curve = cylinderCurvatures[idx] || {
              rotateX: (idx - 2) * -8,
              translateZ: 0,
              scale: 1,
              opacity: 1,
            };

            const lineVariants = {
              hidden: {
                opacity: 0,
                rotateX: -90, // Rotated backwards like a flap
                translateZ: -80,
                y: 20,
              },
              visible: {
                opacity: 1,
                rotateX: curve.rotateX,
                translateZ: curve.translateZ,
                scale: curve.scale,
                y: 0,
                transition: {
                  duration: 0.9,
                  ease: [0.16, 1, 0.3, 1], // cubic-bezier smooth landing with slight overshoot
                },
              },
            };

            return (
              <div
                key={idx}
                style={{
                  perspective: '800px',
                  transformStyle: 'preserve-3d',
                }}
                className="w-full flex justify-center overflow-visible py-0.5"
              >
                <motion.div
                  variants={lineVariants}
                  style={{
                    transformOrigin: '50% 100%',
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    WebkitFontSmoothing: 'antialiased',
                  }}
                  className="text-5xl sm:text-7xl md:text-8xl lg:text-[102px] xl:text-[116px] font-black tracking-tight leading-[0.88] text-white uppercase text-center font-['Impact',_'Arial_Black',_'Inter',_sans-serif] drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
                >
                  {word}
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="text-sm sm:text-base md:text-lg text-slate-400 max-w-xl mx-auto font-medium leading-relaxed"
        >
          {subtext}
        </motion.p>
      </div>
    </section>
  );
};

export default TextReveal3D;
