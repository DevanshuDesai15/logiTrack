import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Divider,
    Button,
    Chip,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    Breadcrumbs,
    Link,
    Card,
    CardContent
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    LocalShipping as ShippingIcon,
    Payment as PaymentIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import orderService from '../services/orderApi';

// Helper to format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
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

// Helper to get status icon
const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
        case 'processing':
            return <PaymentIcon />;
        case 'shipped':
            return <ShippingIcon />;
        case 'delivered':
            return <CheckCircleIcon />;
        default:
            return null;
    }
};

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch order details on component mount
    useEffect(() => {
        fetchOrder();
    }, [id]);

    // Fetch order by ID
    const fetchOrder = async () => {
        setLoading(true);
        try {
            const data = await orderService.getOrderById(id);
            setOrder(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch order details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle go back
    const handleGoBack = () => {
        navigate('/my-orders');
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !order) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || 'Order not found'}
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleGoBack}
                >
                    Back to My Orders
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link
                    component={RouterLink}
                    to="/dashboard"
                    color="inherit"
                    sx={{ textDecoration: 'none' }}
                >
                    Dashboard
                </Link>
                <Link
                    component={RouterLink}
                    to="/my-orders"
                    color="inherit"
                    sx={{ textDecoration: 'none' }}
                >
                    My Orders
                </Link>
                <Typography color="text.primary">Order #{order._id.substring(0, 8)}</Typography>
            </Breadcrumbs>

            {/* Order Header */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                        <Typography variant="h5" component="h1" gutterBottom>
                            Order #{order._id.substring(0, 8)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Placed on {formatDate(order.createdAt)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                        <Chip
                            icon={getStatusIcon(order.status)}
                            label={order.status}
                            color={getStatusColor(order.status)}
                            sx={{ fontSize: '1rem', py: 0.5, px: 1 }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={4}>
                {/* Order Items */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
                        <Typography variant="h6" gutterBottom>
                            Order Items
                        </Typography>
                        <List disablePadding>
                            {order.items.map((item, index) => (
                                <Box key={index}>
                                    <ListItem sx={{ py: 2, px: 0 }}>
                                        <ListItemText
                                            primary={item.productName || `Product ID: ${item.productId}`}
                                            secondary={`Qty: ${item.quantity}`}
                                        />
                                        <Typography variant="body1">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </ListItem>
                                    {index < order.items.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </List>

                        <Divider sx={{ my: 2 }} />

                        <Grid container sx={{ mt: 2 }}>
                            <Grid item xs={6}>
                                <Typography variant="body1">Subtotal</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="body1">${order.totalPrice.toFixed(2)}</Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body1">Shipping</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="body1">$0.00</Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="body1">Tax</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="body1">$0.00</Typography>
                            </Grid>

                            <Grid item xs={6}>
                                <Typography variant="h6" sx={{ mt: 1 }}>Total</Typography>
                            </Grid>
                            <Grid item xs={6} sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" sx={{ mt: 1 }}>${order.totalPrice.toFixed(2)}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Shipping Details */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Shipping Address
                            </Typography>
                            {order.shippingAddress ? (
                                <>
                                    <Typography gutterBottom>
                                        {`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`}
                                    </Typography>
                                    <Typography gutterBottom>{order.shippingAddress.address1}</Typography>
                                    {order.shippingAddress.address2 && <Typography gutterBottom>{order.shippingAddress.address2}</Typography>}
                                    <Typography gutterBottom>{`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`}</Typography>
                                    <Typography gutterBottom>{order.shippingAddress.country}</Typography>
                                    <Typography gutterBottom>{order.shippingAddress.phone}</Typography>
                                </>
                            ) : (
                                <Typography color="text.secondary">No shipping address provided</Typography>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Order Updates
                            </Typography>
                            <List>
                                {order.statusUpdates ? (
                                    order.statusUpdates.map((update, index) => (
                                        <ListItem key={index} sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={update.status}
                                                secondary={formatDate(update.date)}
                                            />
                                        </ListItem>
                                    ))
                                ) : (
                                    <>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemText
                                                primary="Order Placed"
                                                secondary={formatDate(order.createdAt)}
                                            />
                                        </ListItem>
                                        <ListItem sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={order.status}
                                                secondary={formatDate(order.updatedAt || order.createdAt)}
                                            />
                                        </ListItem>
                                    </>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleGoBack}
                    variant="outlined"
                >
                    Back to My Orders
                </Button>
            </Box>
        </Container>
    );
};

export default OrderDetail; 