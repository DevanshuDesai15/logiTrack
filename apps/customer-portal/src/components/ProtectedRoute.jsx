import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    // Show loading indicator if auth state is still being determined
    if (loading) {
        return <div>Loading...</div>;
    }

    // Redirect to login if not authenticated
    return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 