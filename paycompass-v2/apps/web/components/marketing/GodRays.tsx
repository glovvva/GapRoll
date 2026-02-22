"use client";

export default function GodRays() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[2]"
    >
      {/* Layer 1 — Conic gradient (god rays) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "conic-gradient(from 270deg at 50% 0%, transparent 0deg, rgba(107,159,212,0.04) 20deg, rgba(212,168,83,0.03) 35deg, transparent 50deg, rgba(107,159,212,0.06) 70deg, transparent 90deg, rgba(107,159,212,0.03) 110deg, rgba(212,168,83,0.04) 125deg, transparent 140deg, rgba(107,159,212,0.05) 160deg, transparent 180deg)",
          filter: "blur(40px)",
        }}
      />
      {/* Layer 2 — Radial gradients (ambient light) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 800px 600px at 35% 0%, rgba(107,159,212,0.10) 0%, transparent 70%), radial-gradient(ellipse 600px 400px at 65% 0%, rgba(212,168,83,0.07) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />
    </div>
  );
}
