import { useState, useEffect } from 'react';
import logoImage from '../assets/logo.jpg';

interface DashboardPageProps {
    onLogout: () => void;
}

// Activity status from anti-idle system
type ActivityStatus = 'ACTIVE' | 'WARNING' | 'PAUSED' | 'UNKNOWN';

// GG LOOP Brand Colors
const BRAND = {
    primary: '#C19A6B',
    primaryGlow: 'rgba(193, 154, 107, 0.5)',
    dark: '#0d0907',
    darkAlt: '#1a120b',
    border: '#3E2723',
    text: '#ffffff',
    textMuted: '#a0a0a0',
    success: '#4ade80',
    warning: '#fbbf24',
    danger: '#ef4444',
};

export default function DashboardPage({ onLogout }: DashboardPageProps) {
    const [gameDetected, setGameDetected] = useState<any>(null);
    const [sessionTime, setSessionTime] = useState(0);
    const [activeTime, setActiveTime] = useState(0); // Only counts when active
    const [totalPoints, setTotalPoints] = useState(0);
    const [activityStatus, setActivityStatus] = useState<ActivityStatus>('ACTIVE');
    const [idleWarnings, setIdleWarnings] = useState(0);

    useEffect(() => {
        // Listen for game detection events
        if (window.ggloop?.onGameDetected) {
            window.ggloop.onGameDetected((game: any) => {
                console.log('Game detected:', game);
                setGameDetected(game);
                setSessionTime(0);
                setActiveTime(0);
            });
        }

        // Listen for game close events
        if (window.ggloop?.onGameClosed) {
            window.ggloop.onGameClosed((game: any) => {
                console.log('Game closed:', game);
                setGameDetected(null);
                setSessionTime(0);
                setActiveTime(0);
            });
        }

        // Listen for activity status changes
        if (window.ggloop?.onActivityChange) {
            window.ggloop.onActivityChange((status: any) => {
                setActivityStatus(status.status);
                setIdleWarnings(status.idleWarnings || 0);
            });
        }

        // Initial detection check
        if (window.ggloop?.detectGame) {
            window.ggloop.detectGame()
                .then((game: any) => {
                    if (game) setGameDetected(game);
                })
                .catch((error: any) => {
                    console.error('Initial game detection error:', error);
                });
        }
    }, []);

    // Session timer - ONLY counts active time
    useEffect(() => {
        if (!gameDetected) return;

        const timer = setInterval(() => {
            setSessionTime(prev => prev + 1);

            // ONLY increment active time if user is ACTIVE
            if (activityStatus === 'ACTIVE') {
                setActiveTime(prev => prev + 1);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [gameDetected, activityStatus]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Points based on ACTIVE time only
    const getEstimatedPoints = () => {
        if (activityStatus === 'PAUSED') return 0;
        if (activeTime >= 7200) return 50;
        if (activeTime >= 3600) return 25;
        if (activeTime >= 1800) return 15;
        if (activeTime >= 900) return 10;
        return 5;
    };

    const getStatusColor = () => {
        switch (activityStatus) {
            case 'ACTIVE': return BRAND.success;
            case 'WARNING': return BRAND.warning;
            case 'PAUSED': return BRAND.danger;
            default: return BRAND.textMuted;
        }
    };

    const getStatusText = () => {
        switch (activityStatus) {
            case 'ACTIVE': return '✓ Playing';
            case 'WARNING': return `⚠ Move mouse (${3 - idleWarnings} warnings left)`;
            case 'PAUSED': return '⏸ PAUSED - No input detected';
            default: return 'Checking...';
        }
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
                    <img
                        src={logoImage}
                        alt="GG LOOP"
                        style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'contain',
                            filter: gameDetected && activityStatus === 'ACTIVE'
                                ? 'drop-shadow(0 0 10px rgba(193, 154, 107, 0.8))'
                                : 'none'
                        }}
                    />
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
                border: `1px solid ${activityStatus === 'PAUSED' ? BRAND.danger : BRAND.border}`,
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Activity Status Bar */}
                {gameDetected && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        padding: '8px 16px',
                        background: activityStatus === 'PAUSED'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : activityStatus === 'WARNING'
                                ? 'rgba(251, 191, 36, 0.2)'
                                : 'rgba(74, 222, 128, 0.1)',
                        borderBottom: `1px solid ${getStatusColor()}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: getStatusColor(),
                            animation: activityStatus === 'ACTIVE' ? 'pulse 2s infinite' : 'none'
                        }} />
                        <span style={{ color: getStatusColor(), fontSize: '0.875rem', fontWeight: '500' }}>
                            {getStatusText()}
                        </span>
                    </div>
                )}

                {/* Glowing background when active */}
                {gameDetected && activityStatus === 'ACTIVE' && (
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

                <div style={{ position: 'relative', textAlign: 'center', paddingTop: gameDetected ? '2rem' : 0 }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <img
                            src={logoImage}
                            alt="GG LOOP"
                            style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'contain',
                                filter: gameDetected && activityStatus === 'ACTIVE'
                                    ? 'drop-shadow(0 0 30px rgba(193, 154, 107, 0.6))'
                                    : activityStatus === 'PAUSED'
                                        ? 'grayscale(100%) opacity(0.5)'
                                        : 'none'
                            }}
                        />
                    </div>

                    {gameDetected ? (
                        <>
                            <div style={{
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem',
                                background: activityStatus === 'PAUSED'
                                    ? 'rgba(239, 68, 68, 0.1)'
                                    : `linear-gradient(135deg, ${BRAND.primary}22 0%, #D4A37322 100%)`,
                                border: `2px solid ${activityStatus === 'PAUSED' ? BRAND.danger : BRAND.primary}`,
                                borderRadius: '12px',
                                marginBottom: '1rem',
                                boxShadow: activityStatus !== 'PAUSED' ? `0 0 20px ${BRAND.primaryGlow}` : 'none'
                            }}>
                                <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>{gameDetected.icon}</span>
                                <span style={{
                                    color: activityStatus === 'PAUSED' ? BRAND.danger : BRAND.primary,
                                    fontWeight: 'bold',
                                    fontSize: '1.25rem'
                                }}>
                                    {gameDetected.name}
                                </span>
                            </div>

                            {/* Two timers: Total vs Active */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{
                                        fontSize: '2rem',
                                        fontWeight: 'bold',
                                        fontFamily: 'monospace',
                                        color: BRAND.textMuted
                                    }}>
                                        {formatTime(sessionTime)}
                                    </div>
                                    <div style={{ color: BRAND.textMuted, fontSize: '0.75rem' }}>
                                        Total Time
                                    </div>
                                </div>

                                <div>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        fontWeight: 'bold',
                                        fontFamily: 'monospace',
                                        color: activityStatus === 'PAUSED' ? BRAND.danger : BRAND.success
                                    }}>
                                        {formatTime(activeTime)}
                                    </div>
                                    <div style={{ color: activityStatus === 'PAUSED' ? BRAND.danger : BRAND.success, fontSize: '0.875rem', fontWeight: '500' }}>
                                        {activityStatus === 'PAUSED' ? '⏸ PAUSED' : '✓ Active Play Time'}
                                    </div>
                                </div>
                            </div>

                            {/* Points Display */}
                            {activityStatus === 'PAUSED' ? (
                                <div style={{
                                    padding: '1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: `1px solid ${BRAND.danger}`,
                                    borderRadius: '8px',
                                    display: 'inline-block'
                                }}>
                                    <span style={{ color: BRAND.danger, fontSize: '1.1rem', fontWeight: 'bold' }}>
                                        ⏸ POINTS PAUSED
                                    </span>
                                    <br />
                                    <span style={{ color: BRAND.textMuted, fontSize: '0.875rem' }}>
                                        Move mouse or press keys to resume
                                    </span>
                                </div>
                            ) : (
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
                                        for active play
                                    </span>
                                </div>
                            )}
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
                                <strong> You must be actively playing</strong> - idle time doesn't count!
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Anti-Idle Notice */}
                <div style={{
                    background: 'rgba(251, 191, 36, 0.05)',
                    border: `1px solid ${BRAND.warning}`,
                    borderRadius: '12px',
                    padding: '1.5rem'
                }}>
                    <h2 style={{
                        fontSize: '1rem',
                        color: BRAND.warning,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>⚡</span> Active Play Required
                    </h2>

                    <div style={{ fontSize: '0.85rem', color: BRAND.textMuted, lineHeight: 1.6 }}>
                        <p style={{ margin: '0 0 8px 0' }}>We verify you're actually playing:</p>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                            <li>Mouse/keyboard activity tracked</li>
                            <li>1 min idle = warning</li>
                            <li>3 warnings = points paused</li>
                            <li>Resume playing = resume earning</li>
                        </ul>
                    </div>
                </div>

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
                        <span>⭐</span> Points (Active Time Only)
                    </h2>

                    <div style={{ fontSize: '0.85rem', color: BRAND.textMuted }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${BRAND.border}` }}>
                            <span>15+ min active</span>
                            <span style={{ color: BRAND.primary }}>+10 pts</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${BRAND.border}` }}>
                            <span>30+ min active</span>
                            <span style={{ color: BRAND.primary }}>+15 pts</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${BRAND.border}` }}>
                            <span>60+ min active</span>
                            <span style={{ color: BRAND.primary }}>+25 pts</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                            <span>120+ min active</span>
                            <span style={{ color: BRAND.primary, fontWeight: 'bold' }}>+50 pts</span>
                        </div>
                    </div>
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
