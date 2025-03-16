import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Route that requires authentication
export const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    // Show loading indicator if auth state is still being determined
    if (loading) {
        return <div>Loading...</div>;
    }

    // Redirect to login if not authenticated
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

// Route that requires admin role
export const AdminRoute = () => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    // Show loading indicator if auth state is still being determined
    if (loading) {
        return <div>Loading...</div>;
    }

    // Redirect to login if not authenticated or not admin
    return (isAuthenticated() && isAdmin()) ?
        <Outlet /> :
        <Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />;
};

export default ProtectedRoute; 