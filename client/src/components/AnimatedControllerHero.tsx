export default function AnimatedControllerHero() {
    return (
        <div className="relative w-full flex justify-center items-center mb-8">
            {/* Professional Controller Logo - Matching Actual Design */}
            <svg
                className="w-full max-w-2xl h-auto opacity-60"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    {/* Glow filter for orb */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Radial gradient for subtle depth */}
                    <radialGradient id="controllerGradient" cx="50%" cy="50%">
                        <stop offset="0%" stopColor="#C48A66" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#A67556" stopOpacity="0.6" />
                    </radialGradient>
                </defs>

                {/* Main Controller Body - Rounded Square */}
                <rect
                    x="50"
                    y="100"
                    width="300"
                    height="200"
                    rx="50"
                    ry="50"
                    stroke="url(#controllerGradient)"
                    strokeWidth="16"
                    fill="none"
                />

                {/* Infinity Loop Symbol - Center Top */}
                <path
                    id="infinityPath"
                    d="M 150 160 Q 165 135, 185 145 Q 205 155, 200 175 Q 195 195, 175 195 Q 155 195, 150 175 Q 145 155, 150 145 M 200 175 Q 205 155, 225 145 Q 245 135, 260 160 Q 275 185, 260 195 Q 245 205, 225 195 Q 205 185, 200 175 Z"
                    stroke="#C48A66"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    opacity="0.9"
                />

                {/* D-Pad - Bottom Left */}
                <g stroke="#C48A66" strokeWidth="12" strokeLinecap="round">
                    {/* Vertical line */}
                    <line x1="120" y1="230" x2="120" y2="270" />
                    {/* Horizontal line */}
                    <line x1="100" y1="250" x2="140" y2="250" />
                </g>

                {/* Action Buttons - Bottom Right (4 circles) */}
                <g stroke="#C48A66" strokeWidth="10" fill="none">
                    <circle cx="280" cy="230" r="14" />
                    <circle cx="310" cy="245" r="14" />
                    <circle cx="280" cy="270" r="14" />
                    <circle cx="250" cy="245" r="14" />
                </g>

                {/* Animated Glowing Orb on Infinity Path */}
                <circle r="8" fill="#FF8C42" filter="url(#glow)" opacity="0.95">
                    <animateMotion
                        dur="3.5s"
                        repeatCount="indefinite"
                        path="M 150 160 Q 165 135, 185 145 Q 205 155, 200 175 Q 195 195, 175 195 Q 155 195, 150 175 Q 145 155, 150 145 M 200 175 Q 205 155, 225 145 Q 245 135, 260 160 Q 275 185, 260 195 Q 245 205, 225 195 Q 205 185, 200 175 Z"
                    />
                </circle>
            </svg>
        </div>
    );
}
