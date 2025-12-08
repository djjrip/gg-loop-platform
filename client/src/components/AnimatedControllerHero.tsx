import { useEffect, useRef } from 'react';

export default function AnimatedControllerHero() {
    return (
        <div className="relative w-full flex justify-center items-center mb-8">
            {/* Large Controller Outline with Infinity Loop */}
            <svg
                className="w-full max-w-4xl h-auto opacity-50"
                viewBox="0 0 800 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Gradient for controller */}
                    <linearGradient id="controllerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#C48A66" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#B8845F" stopOpacity="0.4" />
                    </linearGradient>

                    {/* Glow filter for orb */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Controller Outline */}
                <g stroke="url(#controllerGradient)" strokeWidth="2.5" fill="none">
                    {/* Left Grip */}
                    <path d="M 150 180 Q 120 200, 100 230 L 80 250 Q 70 260, 80 270 L 100 280 Q 120 285, 140 275 L 160 255 Q 170 240, 165 220 L 150 180 Z" />

                    {/* Right Grip */}
                    <path d="M 650 180 Q 680 200, 700 230 L 720 250 Q 730 260, 720 270 L 700 280 Q 680 285, 660 275 L 640 255 Q 630 240, 635 220 L 650 180 Z" />

                    {/* Main Body */}
                    <rect x="200" y="100" width="400" height="120" rx="20" />

                    {/* D-Pad (Left) */}
                    <circle cx="280" cy="160" r="25" strokeWidth="2" />
                    <line x1="280" y1="145" x2="280" y2="175" stroke="url(#controllerGradient)" strokeWidth="2" />
                    <line x1="265" y1="160" x2="295" y2="160" stroke="url(#controllerGradient)" strokeWidth="2" />

                    {/* Buttons (Right) */}
                    <circle cx="520" cy="145" r="12" />
                    <circle cx="545" cy="160" r="12" />
                    <circle cx="520" cy="175" r="12" />
                    <circle cx="495" cy="160" r="12" />

                    {/* Center Infinity Loop Path */}
                    <path
                        id="infinityPath"
                        d="M 340 150 Q 360 120, 385 130 Q 410 140, 415 160 Q 410 180, 385 190 Q 360 200, 340 170 Q 320 140, 340 130 M 415 160 Q 420 140, 445 130 Q 470 120, 490 150 Q 510 180, 490 190 Q 470 200, 445 190 Q 420 180, 415 160 Z"
                        stroke="#C48A66"
                        strokeWidth="3"
                        fill="none"
                        opacity="0.8"
                    />
                </g>

                {/* Animated Glowing Orb */}
                <circle r="6" fill="#C48A66" filter="url(#glow)">
                    <animateMotion
                        dur="4s"
                        repeatCount="indefinite"
                        path="M 340 150 Q 360 120, 385 130 Q 410 140, 415 160 Q 410 180, 385 190 Q 360 200, 340 170 Q 320 140, 340 130 M 415 160 Q 420 140, 445 130 Q 470 120, 490 150 Q 510 180, 490 190 Q 470 200, 445 190 Q 420 180, 415 160 Z"
                    />
                </circle>
            </svg>
        </div>
    );
}
