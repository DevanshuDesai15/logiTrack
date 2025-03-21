import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    ArrowBack as ArrowBackIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import orderService from '../services/orderApi';
import useAuth from '../hooks/useAuth';

// Helper to format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Helper to get status color
const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
        case 'processing':
            return 'primary';
        case 'shipped':
            return 'info';
        case 'delivered':
            return 'success';
        case 'cancelled':
            return 'error';
        default:
            return 'default';
    }
};

const MyOrders = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch orders function using useCallback to avoid recreation on each render
    const fetchOrders = useCallback(async () => {
        // Don't attempt to fetch if no token exists
        const token = localStorage.getItem('userToken');
        if (!token) {
            setError('You must be logged in to view orders.');
            return;
        }

        console.log('Starting to fetch orders...');
        setLoading(true);
        setError(null);

        try {
            console.log('Making API call to get user orders');
            const data = await orderService.getUserOrders();
            console.log('Orders received:', data ? data.length : 0);
            setOrders(data || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Check authentication and fetch orders on component mount
    useEffect(() => {
        console.log('Auth state:', {
            user: !!user,
            authLoading,
            token: !!localStorage.getItem('userToken')
        });

        // If authentication is still loading, wait
        if (authLoading) {
            console.log('Authentication still loading, waiting...');
            return;
        }

        // If not logged in, redirect to login
        const token = localStorage.getItem('userToken');
        if (!token) {
            console.log('No token found, redirecting to login');
            navigate('/login', { state: { from: '/my-orders', message: 'Please log in to view your orders' } });
            return;
        }

        // Only fetch orders when auth is complete and we have a token
        if (!authLoading && token) {
            console.log('Auth complete and token exists, fetching orders');
            fetchOrders();
        }
    }, [user, authLoading, navigate, fetchOrders]);

    // Function to handle refresh button click
    const handleRefresh = () => {
        fetchOrders();
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                My Orders
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                    component={RouterLink}
                    to="/dashboard"
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Dashboard
                </Button>

                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={loading}
                >
                    {loading ? 'Refreshing...' : 'Refresh Orders'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleRefresh}
                        sx={{ ml: 2 }}
                    >
                        Try Again
                    </Button>
                </Alert>
            )}

            {loading || authLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>
                        {authLoading ? 'Checking authentication...' : 'Loading orders...'}
                    </Typography>
                </Box>
            ) : orders.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        You haven&apos;t placed any orders yet
                    </Typography>
                    <Button
                        component={RouterLink}
                        to="/products"
                        variant="contained"
                        sx={{ mt: 2 }}
                    >
                        Browse Products
                    </Button>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Order ID</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Items</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell component="th" scope="row">
                                        {order._id.substring(0, 8)}...
                                    </TableCell>
                                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                                    <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.status}
                                            color={getStatusColor(order.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{(order.orderItems || []).length} items</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            component={RouterLink}
                                            to={`/orders/${order._id}`}
                                            startIcon={<VisibilityIcon />}
                                            size="small"
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
};

export default MyOrders;