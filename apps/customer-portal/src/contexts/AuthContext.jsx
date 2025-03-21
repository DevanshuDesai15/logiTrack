import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authService } from '../services/api';

// Create the authentication context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = async () => {
            console.log('Initializing auth context...');
            setLoading(true);

            try {
                const storedUser = localStorage.getItem('userInfo');
                const token = localStorage.getItem('userToken');

                console.log('Auth initialization:', {
                    hasToken: !!token,
                    hasStoredUser: !!storedUser
                });

                // Only set user if both token and stored user exist
                if (storedUser && token) {
                    try {
                        setUser(JSON.parse(storedUser));
                        console.log('User loaded from localStorage');
                    } catch (err) {
                        console.error('Failed to parse user info', err);
                        // Clear invalid data
                        localStorage.removeItem('userInfo');
                        localStorage.removeItem('userToken');
                        setUser(null);
                    }
                } else {
                    // Clear any inconsistent state (e.g. token without user or vice versa)
                    if (token && !storedUser) {
                        console.warn('Token exists but no user data found, clearing token');
                        localStorage.removeItem('userToken');
                    }
                    if (!token && storedUser) {
                        console.warn('User data exists but no token found, clearing user data');
                        localStorage.removeItem('userInfo');
                    }
                }
            } finally {
                setLoading(false);
                console.log('Auth initialization complete');
            }
        };

        initializeAuth();
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
        const token = localStorage.getItem('userToken');
        // Return true only if both token exists and user data is loaded
        return !!token && !!user;
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