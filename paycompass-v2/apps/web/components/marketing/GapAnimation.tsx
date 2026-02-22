"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

const gapValues = [12.3, 11.1, 9.8, 8.6, 7.4, 6.1, 4.9, 3.7, 2.6, 1.8, 1.0];
const womenPcts = [87.7, 88.9, 90.2, 91.4, 92.6, 93.9, 95.1, 96.3, 97.4, 98.2, 99.0];
const TICK_MS = 700;
const BAR_DURATION = 4.5;

export default function GapAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true });
  const barControls = useAnimation();

  const [gapPercent, setGapPercent] = useState(12.3);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  // Start sequence when in view (with short delay if already visible on load)
  useEffect(() => {
    if (!inView) return;
    const delay = typeof window !== "undefined" && window.scrollY < 100 ? 1800 : 400;
    const t = setTimeout(() => {
      setHasStarted(true);
      barControls.start({ width: "99%" });
    }, delay);
    return () => clearTimeout(t);
  }, [inView, barControls]);

  // Counter tick
  useEffect(() => {
    if (!hasStarted) return;
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setGapPercent(gapValues[Math.min(index, gapValues.length - 1)]);
      if (index >= gapValues.length) clearInterval(interval);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [hasStarted]);

  const handleBarComplete = () => {
    setIsComplete(true);
    setShowShockwave(true);
    setTimeout(() => setShowBadge(true), 200);
  };

  return (
    <div ref={containerRef} className="mx-auto max-w-[720px] p-12">
      {/* Men bar */}
      <p className="mb-1 text-lg text-muted-foreground">Wynagrodzenia mężczyzn</p>
      <div className="h-5 w-full overflow-hidden rounded-full">
        <div
          className="h-full w-full rounded-full"
          style={{
            background: "linear-gradient(90deg, #6B9FD4 0%, #2dd4bf 100%)",
          }}
        />
      </div>

      {/* Gap counter — between bars, right-aligned */}
      <div className="mt-6 flex items-baseline justify-end gap-1">
        <span className="text-lg text-muted-foreground">Luka:</span>
        <span
          className="font-mono text-3xl font-semibold transition-colors duration-300"
          style={{
            color: isComplete ? "rgb(74 222 128)" : "rgb(251 191 36)", // green-400 : amber-400
          }}
        >
          {gapPercent}%
        </span>
      </div>

      {/* Women bar */}
      <p className="mb-1 mt-8 text-lg text-muted-foreground">Wynagrodzenia kobiet</p>
      <div className="relative h-5 w-full overflow-visible rounded-full">
        {/* Shockwave — centered, triggers when bars meet */}
        {showShockwave && (
          <motion.div
            className="absolute left-1/2 top-1/2 h-5 w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30"
            initial={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() => setShowShockwave(false)}
            aria-hidden
          />
        )}
        <motion.div
          className="h-full overflow-hidden rounded-full"
          initial={{ width: `${womenPcts[0]}%` }}
          animate={barControls}
          transition={{
            duration: BAR_DURATION,
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={handleBarComplete}
          style={{
            background: isComplete
              ? "linear-gradient(90deg, #22c55e 0%, #4ade80 100%)"
              : "linear-gradient(90deg, #6B9FD4 0%, #2dd4bf 100%)",
          }}
        />
      </div>

      {/* Success badge */}
      {showBadge && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 flex justify-center"
        >
          <span className="inline-flex items-center rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-widest badge-correct">
            ✓ ZGODNOŚĆ POTWIERDZONA
          </span>
        </motion.div>
      )}
    </div>
  );
}
