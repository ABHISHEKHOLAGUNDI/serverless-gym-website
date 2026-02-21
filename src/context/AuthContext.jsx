import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/verify');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user); // { name, role, memberId? }
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error("Auth check failed", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Admin login with PIN
    const login = async (pin) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin })
        });

        if (res.ok) {
            await checkAuth();
            return true;
        } else {
            const data = await res.json();
            throw new Error(data.error || 'Login failed');
        }
    };

    // Member login with phone + password
    const memberLogin = async (phone, password) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password })
        });

        if (res.ok) {
            await checkAuth();
            return true;
        } else {
            const data = await res.json();
            throw new Error(data.error || 'Login failed');
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    const isAdmin = user?.role === 'admin';
    const isMember = user?.role === 'member';

    return (
        <AuthContext.Provider value={{
            user, login, memberLogin, logout, loading,
            isAuthenticated: !!user,
            isAdmin,
            isMember,
            memberId: user?.memberId
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
