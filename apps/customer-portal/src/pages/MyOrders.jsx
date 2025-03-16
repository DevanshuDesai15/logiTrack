import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
    ArrowBack as ArrowBackIcon
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
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user orders on component mount
    useEffect(() => {
        if (currentUser) {
            fetchOrders();
        }
    }, [currentUser]);

    // Fetch orders from API
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getUserOrders();
            setOrders(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch your orders. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                My Orders
            </Typography>

            <Button
                component={RouterLink}
                to="/dashboard"
                startIcon={<ArrowBackIcon />}
                sx={{ mb: 3 }}
            >
                Back to Dashboard
            </Button>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {orders.length === 0 ? (
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
                                    <TableCell>{order.items.length} items</TableCell>
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