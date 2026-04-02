import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";

function generateSnakePath(
  width: number,
  height: number,
  segments: number = 8
): string {
  const paddingX = width * 0.12;
  const leftX = paddingX;
  const rightX = width - paddingX;
  const segmentHeight = height / segments;

  let d = `M ${leftX} 0`;

  for (let i = 0; i < segments; i++) {
    const startY = i * segmentHeight;
    const endY = (i + 1) * segmentHeight;
    const midY = (startY + endY) / 2;

    if (i % 2 === 0) {
      d += ` C ${leftX} ${midY}, ${rightX} ${midY}, ${rightX} ${endY}`;
    } else {
      d += ` C ${rightX} ${midY}, ${leftX} ${midY}, ${leftX} ${endY}`;
    }
  }

  return d;
}

export function SnakePath() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [pathLength, setPathLength] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll();
  const strokeDashoffset = useTransform(scrollYProgress, [0, 1], [pathLength, 0]);

  // Responsive: hide on mobile
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        setWidth(w);
        setHeight(h);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate path length when dimensions change
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, [width, height]);

  if (isMobile) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0">
      {width > 0 && height > 0 && (
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${width} ${height}`}
          fill="none"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="snake-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="50%" stopColor="#a855f7" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.25} />
            </linearGradient>
          </defs>
          <motion.path
            ref={pathRef}
            d={generateSnakePath(width, height, 8)}
            fill="none"
            stroke="url(#snake-gradient)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray={pathLength}
            style={{ strokeDashoffset }}
          />
        </svg>
      )}
    </div>
  );
}
