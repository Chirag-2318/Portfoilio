import * as React from "react";

export const LoupeRing = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  function LoupeRing(props, ref) {
    return (
      <svg
        ref={ref}
        aria-hidden="true"
        className="absolute top-0 left-0 pointer-events-none z-20 overflow-visible transition-opacity duration-160 select-none"
        style={{ opacity: 0, willChange: "transform" }}
        {...props}
      >
        <g>
          {/* Main 1px accent circle */}
          <circle
            cx="0"
            cy="0"
            r="0"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="loupe-circle"
          />
          {/* Four 6px outward ticks at N, E, S, W */}
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-6"
            stroke="var(--accent)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="tick-n"
          />
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="6"
            stroke="var(--accent)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="tick-s"
          />
          <line
            x1="0"
            y1="0"
            x2="-6"
            y2="0"
            stroke="var(--accent)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="tick-w"
          />
          <line
            x1="0"
            y1="0"
            x2="6"
            y2="0"
            stroke="var(--accent)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className="tick-e"
          />
          {/* Mono 10px label "1st pass" centered 14px below the circle */}
          <text
            x="0"
            y="24"
            textAnchor="middle"
            fill="var(--accent)"
            className="loupe-label font-mono font-medium tracking-wider uppercase select-none"
            fontSize="10"
            letterSpacing="0.08em"
          >
            1st pass
          </text>
        </g>
      </svg>
    );
  }
);
