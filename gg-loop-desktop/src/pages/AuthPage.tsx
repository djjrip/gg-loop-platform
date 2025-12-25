import { useState } from 'react';
import logoImage from '../assets/logo.jpg';

interface AuthPageProps {
    onLogin: (token: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
    const [loading, setLoading] = useState<string | null>(null);

    // OAuth login - opens browser to ggloop.io
    const handleOAuthLogin = (provider: string) => {
        setLoading(provider);

        // Open browser to OAuth flow
        const authUrl = `https://ggloop.io/api/auth/${provider}?desktop=true`;

        // Open in default browser
        if (window.ggloop?.openExternal) {
            window.ggloop.openExternal(authUrl);
        } else {
            window.open(authUrl, '_blank');
        }

        // For demo purposes - simulate successful login after 3 seconds
        setTimeout(() => {
            onLogin('demo-token-' + Date.now());
            setLoading(null);
        }, 3000);
    };

    // Demo mode - skip login for testing
    const handleDemoMode = () => {
        onLogin('demo-mode-' + Date.now());
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(180deg, #0d0907 0%, #1a120b 50%, #0d0907 100%)',
            padding: '2rem',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%'
            }}>
                {/* Real GG LOOP Logo */}
                <img
                    src={logoImage}
                    alt="GG LOOP"
                    style={{
                        width: '140px',
                        height: '140px',
                        objectFit: 'contain',
                        marginBottom: '1rem',
                        filter: 'drop-shadow(0 0 20px rgba(193, 154, 107, 0.4))'
                    }}
                />

                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.25rem',
                    background: 'linear-gradient(135deg, #C19A6B 0%, #D4A373 50%, #C19A6B 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    letterSpacing: '0.1em'
                }}>
                    GG LOOP
                </h1>

                <h2 style={{
                    fontSize: '1rem',
                    marginBottom: '0.5rem',
                    color: '#C19A6B',
                    fontWeight: '500',
                    letterSpacing: '0.05em'
                }}>
                    Desktop Verification App
                </h2>

                <p style={{
                    fontSize: '0.85rem',
                    color: '#666',
                    marginBottom: '2.5rem',
                    letterSpacing: '0.2em'
                }}>
                    PLAY → EARN → LOOP
                </p>

                {/* OAuth Buttons */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    marginBottom: '1.5rem'
                }}>
                    {/* Twitch */}
                    <button
                        onClick={() => handleOAuthLogin('twitch')}
                        disabled={loading !== null}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '14px 20px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#fff',
                            background: loading === 'twitch' ? '#6441a4' : 'linear-gradient(135deg, #9146FF 0%, #6441a4 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading && loading !== 'twitch' ? 0.5 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                        </svg>
                        {loading === 'twitch' ? 'Connecting...' : 'Continue with Twitch'}
                    </button>

                    {/* Google */}
                    <button
                        onClick={() => handleOAuthLogin('google')}
                        disabled={loading !== null}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '14px 20px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#333',
                            background: loading === 'google' ? '#e0e0e0' : '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading && loading !== 'google' ? 0.5 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {loading === 'google' ? 'Connecting...' : 'Continue with Google'}
                    </button>

                    {/* Discord */}
                    <button
                        onClick={() => handleOAuthLogin('discord')}
                        disabled={loading !== null}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            width: '100%',
                            padding: '14px 20px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: '#fff',
                            background: loading === 'discord' ? '#4752C4' : 'linear-gradient(135deg, #5865F2 0%, #4752C4 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading && loading !== 'discord' ? 0.5 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                        </svg>
                        {loading === 'discord' ? 'Connecting...' : 'Continue with Discord'}
                    </button>
                </div>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '1rem'
                }}>
                    <div style={{ flex: 1, height: '1px', background: '#3E2723' }} />
                    <span style={{ color: '#666', fontSize: '0.75rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: '#3E2723' }} />
                </div>

                {/* Demo Mode */}
                <button
                    onClick={handleDemoMode}
                    style={{
                        width: '100%',
                        padding: '12px 20px',
                        fontSize: '0.9rem',
                        color: '#888',
                        background: 'transparent',
                        border: '1px solid #3E2723',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    Try Demo Mode (No Login)
                </button>

                {/* Features */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px',
                    marginTop: '2rem',
                    fontSize: '0.75rem',
                    color: '#666'
                }}>
                    <span>🎮 18+ Games</span>
                    <span>⭐ Auto Points</span>
                    <span>🎁 Real Rewards</span>
                </div>

                {/* Footer link */}
                <p style={{
                    marginTop: '1.5rem',
                    fontSize: '0.75rem',
                    color: '#555'
                }}>
                    Don't have an account?{' '}
                    <a
                        href="https://ggloop.io"
                        target="_blank"
                        style={{ color: '#C19A6B', textDecoration: 'none' }}
                    >
                        Sign up at ggloop.io
                    </a>
                </p>
            </div>
        </div>
    );
}
