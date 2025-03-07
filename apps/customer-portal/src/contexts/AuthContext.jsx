import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authService } from '../services/api';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    // Login function
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const userData = await authService.login(email, password);
            setUser(userData);
            return userData;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Register function
    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.register(userData);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = () => {
        authService.logout();
        setUser(null);
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return !!user;
    };

    // Value provided by the context
    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Add prop validation
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

// Export the context for use in other files
export default AuthContext; 