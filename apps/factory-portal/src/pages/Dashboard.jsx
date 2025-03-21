import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Typography,
    Box,
    Paper,
    Grid
} from '@mui/material';
import CustomerStatistics from '../components/CustomerStatistics';
import InventoryStatistics from '../components/InventoryStatistics';

const Dashboard = () => {
    const { admin, isAdmin, isSubAdmin } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // If somehow admin gets here without authentication, redirect to login
        if (!admin) {
            navigate('/login');
        }
    }, [admin, navigate]);

    if (!admin) {
        return null; // Don't render anything if not authenticated
    }

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom color="primary">
                    Welcome, {admin.name}!
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Role: {admin.role.toUpperCase()}
                </Typography>
                <Typography paragraph sx={{ mt: 2 }}>
                    This dashboard provides an overview of your factory operations, inventory status, and customer orders.
                </Typography>
                {isAdmin() && (
                    <Typography paragraph sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                        You have full administrative privileges.
                    </Typography>
                )}
                {isSubAdmin() && (
                    <Typography paragraph sx={{ fontWeight: 'bold' }}>
                        You have limited administrative privileges.
                    </Typography>
                )}
            </Paper>

            <Grid container spacing={4}>
                {/* Inventory Statistics */}
                <Grid item xs={12}>
                    <InventoryStatistics />
                </Grid>

                {/* Customer Statistics */}
                <Grid item xs={12}>
                    <CustomerStatistics />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard; 