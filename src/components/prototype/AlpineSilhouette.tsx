"use client";

export function AlpineSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="none"
    >
      {/* Mountain range silhouette */}
      <path
        d="M0 200 L0 140 L60 120 L120 90 L180 110 L240 70 L300 100 L360 50 L420 80 L480 40 L520 60 L560 30 L600 55 L640 20 L680 45 L720 35 L760 60 L800 25 L840 50 L880 70 L920 45 L960 80 L1000 60 L1040 90 L1080 75 L1120 100 L1160 85 L1200 110 L1200 200 Z"
        fill="rgba(10, 37, 64, 0.06)"
      />
      <path
        d="M0 200 L0 160 L80 145 L160 130 L240 140 L320 115 L400 125 L480 100 L560 110 L640 90 L720 105 L800 85 L880 95 L960 110 L1040 100 L1120 120 L1200 130 L1200 200 Z"
        fill="rgba(10, 37, 64, 0.03)"
      />
    </svg>
  );
}