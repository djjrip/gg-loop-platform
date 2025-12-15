import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

declare global {
    interface Window {
        ggloop: {
            detectGame: () => Promise<any>;
            verifyMatch: (matchId: string) => Promise<any>;
            getAuthToken: () => Promise<string | null>;
            setAuthToken: (token: string) => Promise<void>;
            clearAuth: () => Promise<void>;
            getSystemInfo: () => Promise<any>;
            onGameDetected: (callback: (game: any) => void) => void;
            onGameClosed: (callback: (game: any) => void) => void;
            onMatchEnd: (callback: (matchData: any) => void) => void;
        };
    }
}

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing auth token
        window.ggloop.getAuthToken()
            .then(token => {
                setIsAuthenticated(!!token);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const handleLogin = async (token: string) => {
        await window.ggloop.setAuthToken(token);
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        await window.ggloop.clearAuth();
        setIsAuthenticated(false);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0d0907'
            }}>
                <div style={{ color: '#C19A6B', fontSize: '1.5rem' }}>Loading...</div>
            </div>
        );
    }

    return isAuthenticated
        ? <DashboardPage onLogout={handleLogout} />
        : <AuthPage onLogin={handleLogin} />;
}
