"use client";

const NOISE_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2Ij48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSI0IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjEiLz48L3N2Zz4=";

export default function NoiseOverlay() {
  return (
    <>
      <style>{`
        @keyframes noiseShift {
          0% { transform: translate(0, 0); }
          10% { transform: translate(-2px, 1px); }
          20% { transform: translate(1px, -2px); }
          30% { transform: translate(-1px, 2px); }
          40% { transform: translate(2px, -1px); }
          50% { transform: translate(-2px, -2px); }
          60% { transform: translate(1px, 2px); }
          70% { transform: translate(-1px, -1px); }
          80% { transform: translate(2px, 1px); }
          90% { transform: translate(1px, -1px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{
          pointerEvents: "none",
          position: "fixed",
          inset: 0,
          zIndex: 1,
          opacity: 0.035,
          backgroundImage: `url(${NOISE_SVG})`,
          backgroundSize: "256px 256px",
          animation: "noiseShift 0.5s steps(1) infinite",
        }}
      />
    </>
  );
}
