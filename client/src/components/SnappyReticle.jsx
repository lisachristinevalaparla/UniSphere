import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * SnappyReticle
 * Adds an animated camera autofocus bracket reticle (┌ ┐ └ ┘)
 * that snaps snugly inward on hover with cubic-bezier(0.34, 1.56, 0.64, 1),
 * plus an optional tactile click "pop-out" spring interaction.
 */
const SnappyReticle = ({
  children,
  className = '',
  bracketColor = 'border-[#111827] dark:border-emerald-400',
  bracketSize = 'w-2.5 h-2.5',
  borderWidth = 'border-[2px]',
  enableClickPop = true,
  onClick,
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e) => {
    if (enableClickPop) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 220);
    }
    if (onClick) onClick(e);
  };

  return (
    <motion.div
      onClick={handleClick}
      animate={isClicked ? { scale: 1.05, y: -2 } : { scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
      className={`relative group inline-block ${className}`}
    >
      {/* Top-Left Bracket ┌ */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-1.5 -left-1.5 ${bracketSize} ${borderWidth} border-r-0 border-b-0 ${bracketColor} rounded-tl-[3px] opacity-0 scale-125 -translate-x-1.5 -translate-y-1.5 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20`}
      />

      {/* Top-Right Bracket ┐ */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -top-1.5 -right-1.5 ${bracketSize} ${borderWidth} border-l-0 border-b-0 ${bracketColor} rounded-tr-[3px] opacity-0 scale-125 translate-x-1.5 -translate-y-1.5 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20`}
      />

      {/* Bottom-Left Bracket └ */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-1.5 -left-1.5 ${bracketSize} ${borderWidth} border-r-0 border-t-0 ${bracketColor} rounded-bl-[3px] opacity-0 scale-125 -translate-x-1.5 translate-y-1.5 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20`}
      />

      {/* Bottom-Right Bracket ┘ */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-1.5 -right-1.5 ${bracketSize} ${borderWidth} border-l-0 border-t-0 ${bracketColor} rounded-br-[3px] opacity-0 scale-125 translate-x-1.5 translate-y-1.5 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20`}
      />

      {children}
    </motion.div>
  );
};

export default SnappyReticle;
