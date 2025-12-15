import { useState } from 'react';

interface AuthPageProps {
    onLogin: (token: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = () => {
        setLoading(true);
        // TODO: Implement OAuth flow
        // For now, simulate login
        setTimeout(() => {
            onLogin('demo-token-' + Date.now());
            setLoading(false);
        }, 1000);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #0d0907 0%, #1a120b 100%)',
            padding: '2rem'
        }}>
            <div style={{
                textAlign: 'center',
                maxWidth: '400px'
            }}>
                <h1 style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #C19A6B 0%, #D4A373 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                }}>
                    GG LOOP
                </h1>

                <h2 style={{
                    fontSize: '1.5rem',
                    marginBottom: '0.5rem',
                    color: '#ffffff'
                }}>
                    Desktop Verification
                </h2>

                <p style={{
                    fontSize: '1rem',
                    color: '#a0a0a0',
                    marginBottom: '3rem'
                }}>
                    PLAY → EARN → LOOP
                </p>

                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '1rem 2rem',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: '#000000',
                        background: loading ? '#888888' : 'linear-gradient(135deg, #C19A6B 0%, #D4A373 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'transform 0.2s',
                        boxShadow: '0 4px 12px rgba(193, 154, 107, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {loading ? 'Signing In...' : 'Sign In with Google'}
                </button>

                <p style={{
                    marginTop: '2rem',
                    fontSize: '0.875rem',
                    color: '#666666'
                }}>
                    Verify your gameplay and earn rewards
                </p>
            </div>
        </div>
    );
}
