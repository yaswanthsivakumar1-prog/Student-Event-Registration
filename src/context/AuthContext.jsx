import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ localStorage — persists across tabs and browser restarts
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch (e) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        setToken(token);
        setUser(userData);
        localStorage.setItem('token', token);               // ✅
        localStorage.setItem('user', JSON.stringify(userData)); // ✅
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');  // ✅
        localStorage.removeItem('user');   // ✅
    };

    const isAuthenticated = !!token;
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user, token, loading,
            isAuthenticated, isAdmin,
            login, logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};