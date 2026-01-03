import { useState, useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

// User info for account binding
interface UserInfo {
    id: string;
    username: string;
    email: string;
    totalPoints: number;
    isFounder?: boolean;
    tier?: string;
}

declare global {
    interface Window {
        ggloop: {
            detectGame: () => Promise<any>;
            verifyMatch: (matchId: string) => Promise<any>;
            getAuthToken: () => Promise<string | null>;
            setAuthToken: (token: string) => Promise<void>;
            clearAuth: () => Promise<void>;
            getSystemInfo: () => Promise<any>;
            getMe: () => Promise<{ success: boolean; user?: UserInfo; error?: string }>;
            onGameDetected: (callback: (game: any) => void) => void;
            onGameClosed: (callback: (game: any) => void) => void;
            onMatchEnd: (callback: (matchData: any) => void) => void;
            onVerificationStateChange: (callback: (state: any) => void) => void;
        };
    }
}

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState<string | null>(null);

    // Check auth and fetch user info on mount
    useEffect(() => {
        checkAuthAndBindAccount();
    }, []);

    const checkAuthAndBindAccount = async () => {
        setLoading(true);
        setAuthError(null);

        try {
            const token = await window.ggloop.getAuthToken();
            
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                setLoading(false);
                return;
            }

            // CRITICAL: Verify token and bind account
            const result = await window.ggloop.getMe();
            
            if (result.success && result.user) {
                setIsAuthenticated(true);
                setUser(result.user);
                console.log(`[App] Account bound: ${result.user.username} (${result.user.id})`);
            } else {
                // Token invalid or expired - clear and force re-login
                console.error('[App] Account binding failed:', result.error);
                await window.ggloop.clearAuth();
                setIsAuthenticated(false);
                setUser(null);
                setAuthError(result.error || 'Session expired. Please log in again.');
            }
        } catch (error: any) {
            console.error('[App] Auth check error:', error);
            setIsAuthenticated(false);
            setUser(null);
            setAuthError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (token: string) => {
        setLoading(true);
        await window.ggloop.setAuthToken(token);
        
        // Immediately verify and bind account
        await checkAuthAndBindAccount();
    };

    const handleLogout = async () => {
        await window.ggloop.clearAuth();
        setIsAuthenticated(false);
        setUser(null);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0d0907'
            }}>
                <div style={{ color: '#C19A6B', fontSize: '1.5rem', marginBottom: '1rem' }}>
                    Verifying account...
                </div>
                <div style={{ color: '#666', fontSize: '0.875rem' }}>
                    Connecting to ggloop.io
                </div>
            </div>
        );
    }

    if (authError && !isAuthenticated) {
        return (
            <AuthPage 
                onLogin={handleLogin} 
                error={authError}
            />
        );
    }

    return isAuthenticated && user
        ? <DashboardPage user={user} onLogout={handleLogout} />
        : <AuthPage onLogin={handleLogin} error={authError || undefined} />;
}
