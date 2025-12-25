import { useState, useEffect } from 'react';

interface DashboardPageProps {
    onLogout: () => void;
}

// GG LOOP Brand Colors
const BRAND = {
    primary: '#C19A6B',      // Rose gold
    primaryGlow: 'rgba(193, 154, 107, 0.5)',
    dark: '#0d0907',
    darkAlt: '#1a120b',
    border: '#3E2723',
    text: '#ffffff',
    textMuted: '#a0a0a0',
    success: '#4ade80',
    warning: '#fbbf24',
};

// Infinity Symbol SVG Component
function InfinityLogo({ size = 48, glowing = false }: { size?: number; glowing?: boolean }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 50"
            fill="none"
            style={{
                filter: glowing ? 'drop-shadow(0 0 10px rgba(193, 154, 107, 0.8))' : undefined
            }}
        >
            <path
                d="M25 25C25 18.3726 19.6274 13 13 13C6.37258 13 1 18.3726 1 25C1 31.6274 6.37258 37 13 37C19.6274 37 25 31.6274 25 25ZM25 25C25 31.6274 30.3726 37 37 37L63 37C69.6274 37 75 31.6274 75 25C75 18.3726 69.6274 13 63 13L37 13C30.3726 13 25 18.3726 25 25Z"
                stroke="url(#infinityGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                transform="translate(12, 0)"
            />
            <defs>
                <linearGradient id="infinityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C19A6B" />
                    <stop offset="50%" stopColor="#D4A373" />
                    <stop offset="100%" stopColor="#C19A6B" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export default function DashboardPage({ onLogout }: DashboardPageProps) {
    const [gameDetected, setGameDetected] = useState<any>(null);
    const [sessionTime, setSessionTime] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [supportedGames, setSupportedGames] = useState<string[]>([]);

    useEffect(() => {
        // Listen for game detection events
        window.ggloop.onGameDetected((game) => {
            console.log('Game detected:', game);
            setGameDetected(game);
        });

        // Listen for game close events
        window.ggloop.onGameClosed((game) => {
            console.log('Game closed:', game);
            setGameDetected(null);
            setSessionTime(0);
        });

        // Initial detection check
        window.ggloop.detectGame()
            .then(game => {
                if (game) {
                    setGameDetected(game);
                }
            })
            .catch(error => {
                console.error('Initial game detection error:', error);
            });
    }, []);

    // Session timer
    useEffect(() => {
        if (!gameDetected) return;

        const timer = setInterval(() => {
            setSessionTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [gameDetected]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getEstimatedPoints = () => {
        if (sessionTime >= 3600) return 50;
        if (sessionTime >= 1800) return 25;
        if (sessionTime >= 900) return 10;
        return 5;
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.darkAlt} 100%)`,
            padding: '2rem',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: `1px solid ${BRAND.border}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <InfinityLogo size={40} glowing={!!gameDetected} />
                    <div>
                        <h1 style={{
                            fontSize: '1.5rem',
                            background: `linear-gradient(135deg, ${BRAND.primary} 0%, #D4A373 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold',
                            margin: 0
                        }}>
                            GG LOOP
                        </h1>
                        <span style={{ fontSize: '0.75rem', color: BRAND.textMuted }}>
                            Desktop Verification
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: `rgba(193, 154, 107, 0.1)`,
                        border: `1px solid ${BRAND.primary}`,
                        borderRadius: '8px',
                        boxShadow: `0 0 10px ${BRAND.primaryGlow}`
                    }}>
                        <span style={{ color: BRAND.primary, fontWeight: 'bold' }}>
                            {totalPoints.toLocaleString()} pts
                        </span>
                    </div>

                    <button
                        onClick={onLogout}
                        style={{
                            padding: '0.5rem 1rem',
                            background: 'transparent',
                            border: `1px solid ${BRAND.border}`,
                            color: BRAND.textMuted,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Status Card */}
            <div style={{
                background: `rgba(193, 154, 107, 0.03)`,
                border: `1px solid ${BRAND.border}`,
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Glowing background when game detected */}
                {gameDetected && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at center, ${BRAND.primaryGlow} 0%, transparent 70%)`,
                        opacity: 0.3,
                        pointerEvents: 'none'
                    }} />
                )}

                <div style={{ position: 'relative', textAlign: 'center' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <InfinityLogo size={80} glowing={!!gameDetected} />
                    </div>

                    {gameDetected ? (
                        <>
                            <div style={{
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem',
                                background: `linear-gradient(135deg, ${BRAND.primary}22 0%, #D4A37322 100%)`,
                                border: `2px solid ${BRAND.primary}`,
                                borderRadius: '12px',
                                marginBottom: '1rem',
                                boxShadow: `0 0 20px ${BRAND.primaryGlow}`
                            }}>
                                <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>{gameDetected.icon}</span>
                                <span style={{
                                    color: BRAND.primary,
                                    fontWeight: 'bold',
                                    fontSize: '1.25rem'
                                }}>
                                    {gameDetected.name}
                                </span>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace',
                                    color: BRAND.text
                                }}>
                                    {formatTime(sessionTime)}
                                </div>
                                <div style={{ color: BRAND.textMuted, fontSize: '0.875rem' }}>
                                    Session Time
                                </div>
                            </div>

                            <div style={{
                                padding: '1rem',
                                background: `rgba(74, 222, 128, 0.1)`,
                                border: `1px solid ${BRAND.success}`,
                                borderRadius: '8px',
                                display: 'inline-block'
                            }}>
                                <span style={{ color: BRAND.success, fontSize: '1.25rem', fontWeight: 'bold' }}>
                                    +{getEstimatedPoints()} pts
                                </span>
                                <span style={{ color: BRAND.textMuted, fontSize: '0.875rem', marginLeft: '8px' }}>
                                    estimated reward
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(100, 100, 100, 0.1)',
                                border: `1px solid ${BRAND.border}`,
                                borderRadius: '12px',
                                marginBottom: '1rem',
                                display: 'inline-block'
                            }}>
                                <span style={{ color: BRAND.textMuted, fontSize: '1.1rem' }}>
                                    Waiting for Game...
                                </span>
                            </div>

                            <p style={{
                                color: BRAND.textMuted,
                                fontSize: '0.875rem',
                                maxWidth: '300px',
                                margin: '0 auto',
                                lineHeight: 1.6
                            }}>
                                Launch a supported game to start earning points.
                                Your gameplay is automatically verified.
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* How It Works + Supported Games */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Points System */}
                <div style={{
                    background: `rgba(193, 154, 107, 0.03)`,
                    border: `1px solid ${BRAND.border}`,
                    borderRadius: '12px',
                    padding: '1.5rem'
                }}>
                    <h2 style={{
                        fontSize: '1rem',
                        color: BRAND.primary,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>⭐</span> Points System
                    </h2>

                    <div style={{ fontSize: '0.85rem', color: BRAND.textMuted }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${BRAND.border}` }}>
                            <span>15+ min session</span>
                            <span style={{ color: BRAND.primary }}>+5 pts</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${BRAND.border}` }}>
                            <span>30+ min session</span>
                            <span style={{ color: BRAND.primary }}>+10 pts</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${BRAND.border}` }}>
                            <span>60+ min session</span>
                            <span style={{ color: BRAND.primary }}>+25 pts</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                            <span>120+ min session</span>
                            <span style={{ color: BRAND.primary, fontWeight: 'bold' }}>+50 pts</span>
                        </div>
                    </div>
                </div>

                {/* Supported Games */}
                <div style={{
                    background: `rgba(193, 154, 107, 0.03)`,
                    border: `1px solid ${BRAND.border}`,
                    borderRadius: '12px',
                    padding: '1.5rem'
                }}>
                    <h2 style={{
                        fontSize: '1rem',
                        color: BRAND.primary,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>🎮</span> Supported Games
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        fontSize: '0.8rem'
                    }}>
                        {[
                            '🎯 Valorant',
                            '⚔️ League',
                            '🔫 CS2',
                            '🧙 Dota 2',
                            '🔥 Apex',
                            '🏆 Fortnite',
                            '🦸 Overwatch',
                            '🎖️ PUBG',
                            '🌌 Destiny 2',
                        ].map(game => (
                            <div key={game} style={{
                                padding: '4px 8px',
                                background: `rgba(193, 154, 107, 0.1)`,
                                borderRadius: '4px',
                                color: BRAND.textMuted,
                                textAlign: 'center'
                            }}>
                                {game}
                            </div>
                        ))}
                    </div>

                    <p style={{
                        fontSize: '0.75rem',
                        color: BRAND.textMuted,
                        marginTop: '12px',
                        textAlign: 'center'
                    }}>
                        + many more Steam games!
                    </p>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '2rem',
                paddingTop: '1rem',
                borderTop: `1px solid ${BRAND.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem',
                color: BRAND.textMuted
            }}>
                <span>PLAY → EARN → LOOP</span>
                <a
                    href="https://ggloop.io"
                    style={{ color: BRAND.primary, textDecoration: 'none' }}
                    target="_blank"
                >
                    ggloop.io
                </a>
            </div>
        </div>
    );
}
