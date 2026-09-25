import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 450, mass: 0.15 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only show custom cursor on fine pointer devices (desktops)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const moveMouse = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const checkHoverTarget = (e) => {
      const target = e.target;
      const isInteractive =
        target.closest('a') ||
        target.closest('button') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('[role="button"]') ||
        target.closest('.interactive-hover') ||
        target.closest('.group');
      setIsHovered(!!isInteractive);
    };

    window.addEventListener('mousemove', moveMouse, { passive: true });
    window.addEventListener('mousemove', checkHoverTarget, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('mousemove', checkHoverTarget);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      {/* Outer Precision Ring */}
      <motion.div
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.75 : isHovered ? 1.7 : 1,
          opacity: 0.85,
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="w-8 h-8 rounded-full border border-black/40 dark:border-white/50 backdrop-blur-[0.5px]"
      />
      {/* Center Precision Dot */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 1.4 : isHovered ? 0.5 : 1,
          opacity: isHovered ? 0.4 : 0.9,
        }}
        className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white fixed"
      />
    </div>
  );
};

export default CustomCursor;
