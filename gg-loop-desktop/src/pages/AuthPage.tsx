import { useState } from 'react';

interface AuthPageProps {
    onLogin: (token: string) => void;
}

// Infinity Symbol SVG Component
function InfinityLogo({ size = 120 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size * 0.5}
            viewBox="0 0 100 50"
            fill="none"
            style={{
                filter: 'drop-shadow(0 0 20px rgba(193, 154, 107, 0.6))',
                marginBottom: '1.5rem'
            }}
        >
            <path
                d="M25 25C25 18.3726 19.6274 13 13 13C6.37258 13 1 18.3726 1 25C1 31.6274 6.37258 37 13 37C19.6274 37 25 31.6274 25 25ZM25 25C25 31.6274 30.3726 37 37 37L63 37C69.6274 37 75 31.6274 75 25C75 18.3726 69.6274 13 63 13L37 13C30.3726 13 25 18.3726 25 25Z"
                stroke="url(#infinityGradientAuth)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                transform="translate(12, 0)"
            >
                <animate
                    attributeName="stroke-dasharray"
                    values="0 200;200 0"
                    dur="2s"
                    repeatCount="1"
                    fill="freeze"
                />
            </path>
            <defs>
                <linearGradient id="infinityGradientAuth" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C19A6B" />
                    <stop offset="50%" stopColor="#D4A373" />
                    <stop offset="100%" stopColor="#C19A6B" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export default function AuthPage({ onLogin }: AuthPageProps) {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestCode = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://ggloop.io/api/desktop/request-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                setStep('code');
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to send code');
            }
        } catch (err) {
            // For demo/offline mode
            console.log('Demo mode: simulating code sent');
            setStep('code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!code || code.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://ggloop.io/api/desktop/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                onLogin(data.token);
            } else {
                setError(data.error || 'Invalid code');
            }
        } catch (err) {
            // Demo mode
            console.log('Demo mode: simulating login');
            onLogin('demo-token-' + Date.now());
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #0d0907 0%, #1a120b 100%)',
            padding: '2rem',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '380px',
                width: '100%'
            }}>
                {/* Infinity Logo */}
                <InfinityLogo size={140} />

                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(135deg, #C19A6B 0%, #D4A373 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                }}>
                    GG LOOP
                </h1>

                <h2 style={{
                    fontSize: '1.1rem',
                    marginBottom: '0.5rem',
                    color: '#ffffff',
                    fontWeight: '500'
                }}>
                    Desktop Verification App
                </h2>

                <p style={{
                    fontSize: '0.9rem',
                    color: '#a0a0a0',
                    marginBottom: '2rem'
                }}>
                    PLAY → EARN → LOOP
                </p>

                {/* Auth Form */}
                <div style={{
                    background: 'rgba(193, 154, 107, 0.05)',
                    border: '1px solid #3E2723',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    {step === 'email' ? (
                        <>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    fontSize: '1rem',
                                    background: '#1a1a1a',
                                    border: '1px solid #3E2723',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    marginBottom: '1rem',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleRequestCode()}
                            />

                            <button
                                onClick={handleRequestCode}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    color: '#000000',
                                    background: loading ? '#888888' : 'linear-gradient(135deg, #C19A6B 0%, #D4A373 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 12px rgba(193, 154, 107, 0.3)'
                                }}
                            >
                                {loading ? 'Sending Code...' : 'Continue with Email'}
                            </button>
                        </>
                    ) : (
                        <>
                            <p style={{ color: '#a0a0a0', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                Enter the 6-digit code sent to <strong style={{ color: '#C19A6B' }}>{email}</strong>
                            </p>

                            <input
                                type="text"
                                placeholder="000000"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '1.5rem',
                                    textAlign: 'center',
                                    letterSpacing: '0.5rem',
                                    background: '#1a1a1a',
                                    border: '1px solid #3E2723',
                                    borderRadius: '8px',
                                    color: '#ffffff',
                                    marginBottom: '1rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    fontFamily: 'monospace'
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode()}
                            />

                            <button
                                onClick={handleVerifyCode}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    color: '#000000',
                                    background: loading ? '#888888' : 'linear-gradient(135deg, #C19A6B 0%, #D4A373 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    marginBottom: '0.75rem'
                                }}
                            >
                                {loading ? 'Verifying...' : 'Sign In'}
                            </button>

                            <button
                                onClick={() => { setStep('email'); setCode(''); setError(''); }}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#a0a0a0',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                ← Use different email
                            </button>
                        </>
                    )}

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                            {error}
                        </p>
                    )}
                </div>

                {/* Features */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '1.5rem',
                    marginTop: '1.5rem',
                    fontSize: '0.75rem',
                    color: '#666666'
                }}>
                    <span>🎮 18+ Games</span>
                    <span>⭐ Auto Points</span>
                    <span>🎁 Real Rewards</span>
                </div>
            </div>
        </div>
    );
}
