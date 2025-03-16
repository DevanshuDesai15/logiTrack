import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    ShoppingCart as ShoppingCartIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import orderService from '../services/orderApi';

const CustomerStatistics = () => {
    const [stats, setStats] = useState({
        recentOrders: [],
        totalOrders: 0,
        pendingOrders: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Fetch data on component mount
    useEffect(() => {
        fetchCustomerStats();
    }, []);

    // Fetch customer statistics
    const fetchCustomerStats = async () => {
        setLoading(true);
        try {
            // Get all orders
            const orders = await orderService.getOrders();

            // Get recent orders (last 5)
            const recentOrders = orders.slice(0, 5);

            // Count pending orders
            const pendingOrders = orders.filter(order =>
                order.status === 'pending' || order.status === 'packing'
            ).length;

            setStats({
                recentOrders,
                totalOrders: orders.length,
                pendingOrders
            });

            setError(null);
        } catch (err) {
            setError('Failed to fetch customer statistics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Navigate to order details
    const handleViewOrder = (id) => {
        navigate(`/orders/${id}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Customer Order Statistics
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <ShoppingCartIcon sx={{ color: 'primary.main', mr: 1 }} />
                                <Typography variant="h6">
                                    Total Orders
                                </Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 2 }}>
                                {stats.totalOrders}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate('/orders')}
                            >
                                View All Orders
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <TrendingUpIcon sx={{ color: 'warning.main', mr: 1 }} />
                                <Typography variant="h6">
                                    Pending Orders
                                </Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 2 }}>
                                {stats.pendingOrders}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                onClick={() => navigate('/orders')}
                            >
                                Process Orders
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PersonIcon sx={{ color: 'success.main', mr: 1 }} />
                                <Typography variant="h6">
                                    Monthly Revenue
                                </Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 2 }}>
                                ${calculateMonthlyRevenue(stats.recentOrders)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Based on last 30 days
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Recent Customer Orders
            </Typography>

            {stats.recentOrders.length === 0 ? (
                <Alert severity="info">No recent orders found</Alert>
            ) : (
                <List sx={{ width: '100%' }}>
                    {stats.recentOrders.map((order, index) => (
                        <Box key={order._id}>
                            <ListItem
                                button
                                onClick={() => handleViewOrder(order._id)}
                                alignItems="flex-start"
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <ListItemText
                                            primary={`Order #${order._id.substring(0, 8)}`}
                                            secondary={`Customer: ${order.customer?.name || 'N/A'}`}
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <ListItemText
                                            primary={`$${order.totalPrice.toFixed(2)}`}
                                            secondary="Total"
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <ListItemText
                                            primary={formatDate(order.createdAt)}
                                            secondary={`Status: ${order.status}`}
                                        />
                                    </Grid>
                                </Grid>
                            </ListItem>
                            {index < stats.recentOrders.length - 1 && <Divider component="li" />}
                        </Box>
                    ))}
                </List>
            )}
        </Paper>
    );
};

// Helper to calculate monthly revenue (from recent orders)
const calculateMonthlyRevenue = (orders) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

    // Filter orders from last 30 days
    const recentOrders = orders.filter(order =>
        new Date(order.createdAt) >= thirtyDaysAgo
    );

    // Sum total prices
    const revenue = recentOrders.reduce(
        (sum, order) => sum + order.totalPrice, 0
    );

    return revenue.toFixed(2);
};

export default CustomerStatistics; 