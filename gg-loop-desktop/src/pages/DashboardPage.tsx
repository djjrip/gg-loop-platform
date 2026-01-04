import { useState, useEffect } from 'react';
import logoImage from '../assets/logo.jpg';

// User info from account binding
interface UserInfo {
    id: string;
    username: string;
    email: string;
    totalPoints: number;
    isFounder?: boolean;
    tier?: string;
}

interface DashboardPageProps {
    user: UserInfo;
    onLogout: () => void;
}

// Verification states - matches gameVerification.js
type VerificationState = 
    | 'NOT_PLAYING'           // No supported game detected
    | 'GAME_DETECTED'         // Game running but not in foreground
    | 'ACTIVE_PLAY_CONFIRMED' // Game running + foreground = POINTS ACCRUE
    | 'PAUSED'                // Game minimized or alt-tabbed
    | 'ERROR';                // Verification failed

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

// Minimum active time (5 minutes) before points display
const MIN_ACTIVE_TIME_FOR_POINTS = 300; // 5 minutes in seconds

export default function DashboardPage({ user, onLogout }: DashboardPageProps) {
    const [verificationState, setVerificationState] = useState<VerificationState>('NOT_PLAYING');
    const [gameName, setGameName] = useState<string | null>(null);
    const [gameIcon, setGameIcon] = useState<string>('🎮');
    const [activeTime, setActiveTime] = useState(0);
    const [statusExplanation, setStatusExplanation] = useState('Launch a supported game to start earning.');
    const [lastVerifiedAt, setLastVerifiedAt] = useState<string | null>(null);
    const [confidenceScore, setConfidenceScore] = useState<number>(0);

    useEffect(() => {
        // Listen for verification state changes from main process
        if (window.ggloop?.onVerificationStateChange) {
            window.ggloop.onVerificationStateChange((state: any) => {
                setVerificationState(state.state);
                setGameName(state.gameName);
                setGameIcon(state.gameIcon || '🎮');
                setLastVerifiedAt(state.lastVerifiedAt);
                setConfidenceScore(state.confidenceScore || 0);
                
                // Update explanation based on state
                updateStatusExplanation(state);
            });
        }

        // Also listen for legacy game detection events as fallback
        if (window.ggloop?.onGameDetected) {
            window.ggloop.onGameDetected((game: any) => {
                setGameName(game.name);
                setGameIcon(game.icon || '🎮');
            });
        }

        if (window.ggloop?.onGameClosed) {
            window.ggloop.onGameClosed(() => {
                setGameName(null);
                setActiveTime(0);
                setVerificationState('NOT_PLAYING');
                setConfidenceScore(0);
            });
        }
    }, []);

    // Active time counter - ONLY counts when ACTIVE_PLAY_CONFIRMED
    useEffect(() => {
        if (verificationState !== 'ACTIVE_PLAY_CONFIRMED') return;

        const timer = setInterval(() => {
            setActiveTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [verificationState]);

    const updateStatusExplanation = (state: any) => {
        switch (state.state) {
            case 'NOT_PLAYING':
                setStatusExplanation('Launch a supported game to start earning.');
                break;
            case 'GAME_DETECTED':
                setStatusExplanation(`${state.gameName} detected but not focused. Click on the game window to earn points.`);
                break;
            case 'ACTIVE_PLAY_CONFIRMED':
                setStatusExplanation(`Playing ${state.gameName}. Points are accruing!`);
                break;
            case 'PAUSED':
                setStatusExplanation('Game is paused or minimized. Return to game to continue earning.');
                break;
            case 'ERROR':
                setStatusExplanation(`Error: ${state.errorReason || 'Verification failed'}`);
                break;
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getEstimatedPoints = () => {
        if (verificationState !== 'ACTIVE_PLAY_CONFIRMED') return 0;
        // No points until minimum active time (5 minutes)
        if (activeTime < MIN_ACTIVE_TIME_FOR_POINTS) return 0;
        if (activeTime >= 7200) return 50;
        if (activeTime >= 3600) return 25;
        if (activeTime >= 1800) return 15;
        if (activeTime >= 900) return 10;
        return 5;
    };

    const getTimeUntilEligible = () => {
        if (verificationState !== 'ACTIVE_PLAY_CONFIRMED') return MIN_ACTIVE_TIME_FOR_POINTS;
        const remaining = MIN_ACTIVE_TIME_FOR_POINTS - activeTime;
        return remaining > 0 ? remaining : 0;
    };

    const isEligibleForPoints = verificationState === 'ACTIVE_PLAY_CONFIRMED' && activeTime >= MIN_ACTIVE_TIME_FOR_POINTS;

    const getConfidenceLabel = () => {
        if (confidenceScore >= 90) return { label: 'Verified', color: BRAND.success };
        if (confidenceScore >= 70) return { label: 'High', color: BRAND.success };
        if (confidenceScore >= 50) return { label: 'Medium', color: BRAND.warning };
        if (confidenceScore >= 30) return { label: 'Low', color: '#f97316' };
        return { label: 'Suspicious', color: BRAND.danger };
    };

    const getStatusColor = () => {
        switch (verificationState) {
            case 'ACTIVE_PLAY_CONFIRMED': return BRAND.success;
            case 'GAME_DETECTED': return BRAND.warning;
            case 'NOT_PLAYING': return BRAND.textMuted;
            case 'PAUSED': return BRAND.warning;
            case 'ERROR': return BRAND.danger;
            default: return BRAND.textMuted;
        }
    };

    const getStatusIcon = () => {
        switch (verificationState) {
            case 'ACTIVE_PLAY_CONFIRMED': return '✓';
            case 'GAME_DETECTED': return '⚠';
            case 'NOT_PLAYING': return '○';
            case 'PAUSED': return '⏸';
            case 'ERROR': return '✕';
            default: return '?';
        }
    };

    const canEarnPoints = verificationState === 'ACTIVE_PLAY_CONFIRMED';
    const confidenceInfo = getConfidenceLabel();

    return (
        <div style={{
            minHeight: '100vh',
            background: `linear-gradient(135deg, ${BRAND.dark} 0%, ${BRAND.darkAlt} 100%)`,
            padding: '1.5rem',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            {/* Header with Account Binding Info */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: `1px solid ${BRAND.border}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                        src={logoImage}
                        alt="GG LOOP"
                        style={{
                            width: '36px',
                            height: '36px',
                            objectFit: 'contain',
                            filter: canEarnPoints
                                ? 'drop-shadow(0 0 10px rgba(193, 154, 107, 0.8))'
                                : 'none'
                        }}
                    />
                    <div>
                        <h1 style={{
                            fontSize: '1.25rem',
                            background: `linear-gradient(135deg, ${BRAND.primary} 0%, #D4A373 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold',
                            margin: 0
                        }}>
                            GG LOOP
                        </h1>
                        <span style={{ fontSize: '0.7rem', color: BRAND.textMuted }}>
                            Desktop Verification
                        </span>
                    </div>
                </div>

                {/* CRITICAL: Account Binding Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: `rgba(74, 222, 128, 0.1)`,
                        border: `1px solid ${BRAND.success}`,
                        borderRadius: '8px',
                        textAlign: 'right'
                    }}>
                        <div style={{ fontSize: '0.65rem', color: BRAND.success, marginBottom: '2px' }}>
                            ✓ CONNECTED AS
                        </div>
                        <div style={{ color: BRAND.text, fontWeight: 'bold', fontSize: '0.875rem' }}>
                            {user.username}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: BRAND.textMuted }}>
                            ID: {user.id.substring(0, 8)}...
                        </div>
                    </div>

                    <div style={{
                        padding: '0.5rem 1rem',
                        background: `rgba(193, 154, 107, 0.1)`,
                        border: `1px solid ${BRAND.primary}`,
                        borderRadius: '8px',
                        boxShadow: `0 0 10px ${BRAND.primaryGlow}`
                    }}>
                        <span style={{ color: BRAND.primary, fontWeight: 'bold' }}>
                            {user.totalPoints.toLocaleString()} pts
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
                            fontSize: '0.75rem'
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* ACTIVE PLAY SESSION BANNER - Only when earning */}
            {isEligibleForPoints && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2) 0%, rgba(74, 222, 128, 0.1) 100%)',
                    border: `2px solid ${BRAND.success}`,
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    animation: 'pulse 2s infinite'
                }}>
                    <div style={{ color: BRAND.success, fontWeight: 'bold', fontSize: '1.25rem' }}>
                        ✓ ACTIVE PLAY CONFIRMED — POINTS EARNING
                    </div>
                    <div style={{ color: BRAND.textMuted, fontSize: '0.8rem', marginTop: '4px' }}>
                        Session verified • Confidence: {confidenceScore}% ({confidenceInfo.label})
                    </div>
                </div>
            )}

            {/* Verification Status Banner */}
            <div style={{
                background: canEarnPoints 
                    ? 'rgba(74, 222, 128, 0.1)' 
                    : verificationState === 'GAME_DETECTED'
                        ? 'rgba(251, 191, 36, 0.1)'
                        : 'rgba(100, 100, 100, 0.1)',
                border: `2px solid ${getStatusColor()}`,
                borderRadius: '12px',
                padding: '1rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: getStatusColor(),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        color: '#000'
                    }}>
                        {getStatusIcon()}
                    </span>
                    <div>
                        <div style={{ 
                            color: getStatusColor(), 
                            fontWeight: 'bold',
                            fontSize: '1rem'
                        }}>
                            {verificationState.replace(/_/g, ' ')}
                        </div>
                        <div style={{ color: BRAND.textMuted, fontSize: '0.8rem' }}>
                            {statusExplanation}
                        </div>
                        {/* Countdown to eligibility */}
                        {canEarnPoints && !isEligibleForPoints && (
                            <div style={{ 
                                color: BRAND.warning, 
                                fontSize: '0.75rem',
                                marginTop: '4px'
                            }}>
                                ⏱ Points start in {formatTime(getTimeUntilEligible())} (5 min minimum)
                            </div>
                        )}
                        {/* Not playing hint */}
                        {verificationState === 'NOT_PLAYING' && (
                            <div style={{ 
                                color: BRAND.textMuted, 
                                fontSize: '0.75rem',
                                marginTop: '4px'
                            }}>
                                Supported games: League of Legends, VALORANT, Apex Legends, Fortnite...
                            </div>
                        )}
                        {/* Game detected but not focused */}
                        {verificationState === 'GAME_DETECTED' && (
                            <div style={{ 
                                color: BRAND.warning, 
                                fontSize: '0.75rem',
                                marginTop: '4px'
                            }}>
                                ⚠ Alt-Tab back to {gameName} to start earning
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Points display - only when eligible */}
                {isEligibleForPoints ? (
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(74, 222, 128, 0.2)',
                        borderRadius: '8px'
                    }}>
                        <span style={{ color: BRAND.success, fontWeight: 'bold', fontSize: '1.25rem' }}>
                            +{getEstimatedPoints()} pts
                        </span>
                    </div>
                ) : canEarnPoints ? (
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(251, 191, 36, 0.2)',
                        borderRadius: '8px'
                    }}>
                        <span style={{ color: BRAND.warning, fontWeight: 'bold', fontSize: '0.9rem' }}>
                            Earning in {formatTime(getTimeUntilEligible())}
                        </span>
                    </div>
                ) : null}
            </div>

            {/* Main Game Card */}
            <div style={{
                background: `rgba(193, 154, 107, 0.03)`,
                border: `1px solid ${canEarnPoints ? BRAND.success : BRAND.border}`,
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Glow effect when earning */}
                {canEarnPoints && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: `radial-gradient(circle at center, ${BRAND.primaryGlow} 0%, transparent 70%)`,
                        opacity: 0.3,
                        pointerEvents: 'none'
                    }} />
                )}

                <div style={{ position: 'relative' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                        {gameName ? gameIcon : '🎮'}
                    </div>

                    {gameName ? (
                        <>
                            <div style={{
                                display: 'inline-block',
                                padding: '0.75rem 1.5rem',
                                background: canEarnPoints
                                    ? 'rgba(74, 222, 128, 0.1)'
                                    : `rgba(193, 154, 107, 0.1)`,
                                border: `2px solid ${canEarnPoints ? BRAND.success : BRAND.primary}`,
                                borderRadius: '12px',
                                marginBottom: '1.5rem'
                            }}>
                                <span style={{
                                    color: canEarnPoints ? BRAND.success : BRAND.primary,
                                    fontWeight: 'bold',
                                    fontSize: '1.5rem'
                                }}>
                                    {gameName}
                                </span>
                            </div>

                            <div style={{
                                fontSize: '3rem',
                                fontWeight: 'bold',
                                fontFamily: 'monospace',
                                color: isEligibleForPoints ? BRAND.success : canEarnPoints ? BRAND.warning : BRAND.textMuted,
                                marginBottom: '0.5rem'
                            }}>
                                {formatTime(activeTime)}
                            </div>
                            <div style={{
                                color: isEligibleForPoints ? BRAND.success : canEarnPoints ? BRAND.warning : BRAND.textMuted,
                                fontSize: '0.875rem'
                            }}>
                                {isEligibleForPoints 
                                    ? '✓ Verified Active Play — Points Accruing' 
                                    : canEarnPoints 
                                        ? `⏱ ${formatTime(getTimeUntilEligible())} until points start (5 min min)`
                                        : 'Waiting for game focus...'}
                            </div>

                            {/* Confidence Meter */}
                            {canEarnPoints && confidenceScore > 0 && (
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '8px',
                                    maxWidth: '300px',
                                    margin: '1rem auto 0'
                                }}>
                                    <div style={{ 
                                        fontSize: '0.75rem', 
                                        color: BRAND.textMuted,
                                        marginBottom: '6px',
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span>Verification Confidence</span>
                                        <span style={{ color: confidenceInfo.color, fontWeight: 'bold' }}>
                                            {confidenceScore}% ({confidenceInfo.label})
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '8px',
                                        background: 'rgba(100,100,100,0.3)',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${confidenceScore}%`,
                                            background: confidenceInfo.color,
                                            borderRadius: '4px',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div style={{
                                color: BRAND.textMuted,
                                fontSize: '1.25rem',
                                marginBottom: '1rem'
                            }}>
                                No Game Detected
                            </div>
                            <p style={{
                                color: BRAND.textMuted,
                                fontSize: '0.875rem',
                                maxWidth: '400px',
                                margin: '0 auto'
                            }}>
                                Launch a supported game to start earning points. 
                                Points only accrue when the game is in focus and you're actively playing.
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Verification Info */}
                <div style={{
                    background: 'rgba(74, 222, 128, 0.05)',
                    border: `1px solid ${BRAND.success}`,
                    borderRadius: '12px',
                    padding: '1.25rem'
                }}>
                    <h2 style={{
                        fontSize: '0.9rem',
                        color: BRAND.success,
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>✓</span> How Verification Works
                    </h2>

                    <div style={{ fontSize: '0.8rem', color: BRAND.textMuted, lineHeight: 1.5 }}>
                        <p style={{ margin: '0 0 8px 0' }}>Points ONLY accrue when:</p>
                        <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                            <li>Game process is running</li>
                            <li>Game window is in foreground</li>
                            <li>Your account is verified</li>
                        </ul>
                        <p style={{ margin: '8px 0 0 0', fontStyle: 'italic' }}>
                            Idle time and alt-tabbing do NOT count!
                        </p>
                    </div>
                </div>

                {/* Points Info */}
                <div style={{
                    background: `rgba(193, 154, 107, 0.03)`,
                    border: `1px solid ${BRAND.border}`,
                    borderRadius: '12px',
                    padding: '1.25rem'
                }}>
                    <h2 style={{
                        fontSize: '0.9rem',
                        color: BRAND.primary,
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>⭐</span> Points (Active Time Only)
                    </h2>

                    <div style={{ fontSize: '0.8rem', color: BRAND.textMuted }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${BRAND.border}` }}>
                            <span>15+ min active</span>
                            <span style={{ color: BRAND.primary }}>+10 pts</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${BRAND.border}` }}>
                            <span>30+ min active</span>
                            <span style={{ color: BRAND.primary }}>+15 pts</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${BRAND.border}` }}>
                            <span>60+ min active</span>
                            <span style={{ color: BRAND.primary }}>+25 pts</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                            <span>120+ min active</span>
                            <span style={{ color: BRAND.primary, fontWeight: 'bold' }}>+50 pts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Founder Badge */}
            {user.isFounder && (
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, rgba(193, 154, 107, 0.2) 0%, rgba(212, 163, 115, 0.2) 100%)',
                    border: `2px solid ${BRAND.primary}`,
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <span style={{ color: BRAND.primary, fontWeight: 'bold' }}>
                        👑 FOUNDING MEMBER — 2x Points Forever
                    </span>
                </div>
            )}

            {/* Footer */}
            <div style={{
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: `1px solid ${BRAND.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.7rem',
                color: BRAND.textMuted
            }}>
                <span>PLAY → EARN → LOOP</span>
                <span>Last verified: {lastVerifiedAt ? new Date(lastVerifiedAt).toLocaleTimeString() : 'N/A'}</span>
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
