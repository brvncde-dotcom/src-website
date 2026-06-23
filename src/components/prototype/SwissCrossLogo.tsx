"use client";

export function SwissCrossLogo({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Swiss Cross"
    >
      <rect width="28" height="28" rx="2" fill="#E8272C" />
      <rect x="10" y="4" width="8" height="20" rx="0.5" fill="white" />
      <rect x="4" y="10" width="20" height="8" rx="0.5" fill="white" />
    </svg>
  );
}

export function SwissCrossMark({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SRC Mark"
    >
      {/* Outer navy circle */}
      <circle cx="20" cy="20" r="19" stroke="#0A2540" strokeWidth="2" fill="white" />
      {/* Inner red Swiss cross */}
      <rect x="14" y="7" width="12" height="26" rx="1" fill="#E8272C" />
      <rect x="7" y="14" width="26" height="12" rx="1" fill="#E8272C" />
    </svg>
  );
}