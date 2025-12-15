import { useState, useEffect } from 'react';

interface DashboardPageProps {
    onLogout: () => void;
}

export default function DashboardPage({ onLogout }: DashboardPageProps) {
    const [gameDetected, setGameDetected] = useState<string | null>(null);

    useEffect(() => {
        // Listen for game detection events
        window.ggloop.onGameDetected((game) => {
            console.log('Game detected:', game);
            setGameDetected(game.name);
        });

        // Listen for game close events
        window.ggloop.onGameClosed((game) => {
            console.log('Game closed:', game);
            setGameDetected(null);
        });

        // Initial detection check
        window.ggloop.detectGame()
            .then(game => {
                if (game) {
                    setGameDetected(game.name);
                }
            })
            .catch(error => {
                console.error('Initial game detection error:', error);
            });
    }, []);

    return (
        <div style={{
            height: '100vh',
            background: 'linear-gradient(135deg, #0d0907 0%, #1a120b 100%)',
            padding: '2rem'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid #3E2723'
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    background: 'linear-gradient(135deg, #C19A6B 0%, #D4A373 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold'
                }}>
                    GG LOOP Desktop
                </h1>
                <button
                    onClick={onLogout}
                    style={{
                        padding: '0.5rem 1rem',
                        background: 'transparent',
                        border: '1px solid #C19A6B',
                        color: '#C19A6B',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                    }}
                >
                    Sign Out
                </button>
            </div>

            {/* Game Detection Status */}
            <div style={{
                background: 'rgba(193, 154, 107, 0.05)',
                border: '1px solid #3E2723',
                borderRadius: '12px',
                padding: '2rem',
                marginBottom: '2rem'
            }}>
                <h2 style={{
                    fontSize: '1.25rem',
                    color: '#C19A6B',
                    marginBottom: '1rem'
                }}>
                    Game Detection
                </h2>

                {gameDetected ? (
                    <div>
                        <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            background: 'rgba(193, 154, 107, 0.2)',
                            border: '1px solid #C19A6B',
                            borderRadius: '6px',
                            color: '#C19A6B',
                            fontWeight: 'bold'
                        }}>
                            ✓ {gameDetected} Detected
                        </div>
                        <p style={{
                            marginTop: '1rem',
                            color: '#a0a0a0',
                            fontSize: '0.875rem'
                        }}>
                            Monitoring for match completion...
                        </p>
                    </div>
                ) : (
                    <div>
                        <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            background: 'rgba(160, 160, 160, 0.1)',
                            border: '1px solid #666666',
                            borderRadius: '6px',
                            color: '#a0a0a0'
                        }}>
                            No Game Detected
                        </div>
                        <p style={{
                            marginTop: '1rem',
                            color: '#666666',
                            fontSize: '0.875rem'
                        }}>
                            Launch Valorant or League of Legends to begin verification
                        </p>
                    </div>
                )}
            </div>

            {/* Info Panel */}
            <div style={{
                background: 'rgba(193, 154, 107, 0.05)',
                border: '1px solid #3E2723',
                borderRadius: '12px',
                padding: '2rem'
            }}>
                <h2 style={{
                    fontSize: '1.25rem',
                    color: '#C19A6B',
                    marginBottom: '1rem'
                }}>
                    How It Works
                </h2>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    color: '#a0a0a0',
                    fontSize: '0.875rem',
                    lineHeight: '1.8'
                }}>
                    <li>1. Launch your game (Valorant or League of Legends)</li>
                    <li>2. Play matches as normal</li>
                    <li>3. App automatically verifies your gameplay</li>
                    <li>4. Earn points for verified matches</li>
                    <li>5. Redeem rewards on ggloop.io</li>
                </ul>
            </div>
        </div>
    );
}
