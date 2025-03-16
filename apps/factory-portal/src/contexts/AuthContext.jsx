import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedAdmin = localStorage.getItem('adminInfo');
        if (storedAdmin) {
            setAdmin(JSON.parse(storedAdmin));
        }
        setLoading(false);
    }, []);

    // Login function - specific for admin/subadmin
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const adminData = await authService.login(email, password);
            setAdmin(adminData);
            return adminData;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        authService.logout();
        setAdmin(null);
    };

    // Check if admin is authenticated
    const isAuthenticated = () => {
        return !!admin;
    };

    // Check admin role
    const isAdmin = () => {
        return admin?.role === 'admin';
    };

    // Check subadmin role
    const isSubAdmin = () => {
        return admin?.role === 'subadmin';
    };

    // Value provided by the context
    const value = {
        admin,
        loading,
        error,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isSubAdmin
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 