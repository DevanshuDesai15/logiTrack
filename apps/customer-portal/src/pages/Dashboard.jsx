import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Button,
    Card,
    CardContent,
    CardActions,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    ShoppingBag as ShoppingBagIcon,
    Person as PersonIcon,
    ShoppingCart as ShoppingCartIcon,
    Inventory as InventoryIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderApi';

const Dashboard = () => {
    const { currentUser, logout } = useAuth();
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch recent orders on component mount
    useEffect(() => {
        fetchRecentOrders();
    }, []);

    // Fetch recent orders from API
    const fetchRecentOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getUserOrders();
            setRecentOrders(data.slice(0, 3)); // Get only 3 most recent orders
            setError(null);
        } catch (err) {
            setError('Failed to fetch recent orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Customer Dashboard
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Welcome Card */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Box>
                        <Typography variant="h5">
                            Welcome back, {currentUser?.name || currentUser?.email?.split('@')[0] || 'Customer'}!
                        </Typography>
                        <Typography variant="body1">
                            Manage your orders, browse products, and update your profile.
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Dashboard Actions */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <ShoppingBagIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6" component="h2">
                                My Orders
                            </Typography>
                            <Typography variant="body2">
                                View and track your order history
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                component={RouterLink}
                                to="/my-orders"
                                size="small"
                                color="primary"
                                fullWidth
                            >
                                View Orders
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <InventoryIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6" component="h2">
                                Browse Products
                            </Typography>
                            <Typography variant="body2">
                                Explore our catalog of products
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                component={RouterLink}
                                to="/products"
                                size="small"
                                color="primary"
                                fullWidth
                            >
                                View Products
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <ShoppingCartIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6" component="h2">
                                My Cart
                            </Typography>
                            <Typography variant="body2">
                                View or modify your shopping cart
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                component={RouterLink}
                                to="/cart"
                                size="small"
                                color="primary"
                                fullWidth
                            >
                                Go to Cart
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6" component="h2">
                                My Profile
                            </Typography>
                            <Typography variant="body2">
                                View and edit your account information
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                component={RouterLink}
                                to="/profile"
                                size="small"
                                color="primary"
                                fullWidth
                                disabled
                            >
                                View Profile
                            </Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            {/* Recent Orders */}
            <Typography variant="h5" sx={{ mb: 2 }}>
                Recent Orders
            </Typography>

            <Paper>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : recentOrders.length > 0 ? (
                    <List>
                        {recentOrders.map((order, index) => (
                            <Box key={order._id}>
                                <ListItem
                                    button
                                    component={RouterLink}
                                    to={`/orders/${order._id}`}
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <ListItemText
                                                primary={`Order #${order._id.substring(0, 8)}`}
                                                secondary={formatDate(order.createdAt)}
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <ListItemText
                                                primary={`${order.items.length} item(s)`}
                                                secondary="Quantity"
                                            />
                                        </Grid>
                                        <Grid item xs={6} sm={3}>
                                            <ListItemText
                                                primary={`$${order.totalPrice.toFixed(2)}`}
                                                secondary="Total"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={2}>
                                            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color:
                                                            order.status === 'Delivered' ? 'success.main' :
                                                                order.status === 'Shipped' ? 'info.main' :
                                                                    order.status === 'Cancelled' ? 'error.main' :
                                                                        'primary.main'
                                                    }}
                                                >
                                                    {order.status || 'Processing'}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </ListItem>
                                {index < recentOrders.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </List>
                ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            You haven&apos;t placed any orders yet.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/products"
                            variant="contained"
                            color="primary"
                            sx={{ mt: 1 }}
                        >
                            Browse Products
                        </Button>
                    </Box>
                )}
            </Paper>

            {/* View All Orders Button */}
            {recentOrders.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        component={RouterLink}
                        to="/my-orders"
                        color="primary"
                    >
                        View All Orders
                    </Button>
                </Box>
            )}

            {/* Logout Button */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutIcon />}
                    onClick={logout}
                >
                    Logout
                </Button>
            </Box>
        </Container>
    );
};

export default Dashboard; 