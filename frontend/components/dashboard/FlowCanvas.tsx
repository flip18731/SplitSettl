"use client";

export default function FlowCanvas() {
  return (
    <div className="w-full overflow-hidden rounded-lg">
      <svg
        viewBox="0 0 1100 64"
        className="w-full h-16"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main flow line */}
        <path
          d="M 0 32 Q 150 8, 300 32 T 600 28 T 900 34 T 1100 30"
          fill="none"
          stroke="#2DD4A8"
          strokeWidth="2"
          opacity="0.4"
          className="flow-line"
        />

        {/* Split branch at x=300 — teal upper */}
        <path
          d="M 300 32 Q 380 10, 460 18 T 580 14"
          fill="none"
          stroke="#2DD4A8"
          strokeWidth="1.5"
          opacity="0.25"
          className="flow-line"
        />

        {/* Split branch at x=300 — orange lower */}
        <path
          d="M 300 32 Q 380 50, 460 46 T 580 50"
          fill="none"
          stroke="#F59E42"
          strokeWidth="1.5"
          opacity="0.25"
          className="flow-line"
        />

        {/* Split branch at x=700 — teal upper */}
        <path
          d="M 700 30 Q 760 12, 820 16 T 920 14"
          fill="none"
          stroke="#2DD4A8"
          strokeWidth="1.5"
          opacity="0.2"
          className="flow-line"
        />

        {/* Split branch at x=700 — orange lower */}
        <path
          d="M 700 30 Q 760 48, 820 44 T 920 48"
          fill="none"
          stroke="#F59E42"
          strokeWidth="1.5"
          opacity="0.2"
          className="flow-line"
        />

        {/* Split node circles */}
        <circle cx="300" cy="32" r="4" fill="#2DD4A8" opacity="0.6" />
        <circle cx="300" cy="32" r="2" fill="#2DD4A8" />

        <circle cx="700" cy="30" r="4" fill="#2DD4A8" opacity="0.6" />
        <circle cx="700" cy="30" r="2" fill="#2DD4A8" />

        {/* Small terminal dots on branches */}
        <circle cx="580" cy="14" r="2.5" fill="#2DD4A8" opacity="0.4" />
        <circle cx="580" cy="50" r="2.5" fill="#F59E42" opacity="0.4" />
        <circle cx="920" cy="14" r="2.5" fill="#2DD4A8" opacity="0.4" />
        <circle cx="920" cy="48" r="2.5" fill="#F59E42" opacity="0.4" />
      </svg>
    </div>
  );
}
