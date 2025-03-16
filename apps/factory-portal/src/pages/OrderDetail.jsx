import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    Card,
    CardContent,
    TextField,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Snackbar,
    IconButton,
    Stepper,
    Step,
    StepLabel
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    LocalShipping as ShippingIcon,
    Print as PrintIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Add as AddIcon,
    Remove as RemoveIcon
} from '@mui/icons-material';
import orderService from '../services/orderApi';
import inventoryService from '../services/inventoryApi';

// Format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

// Status to color map
const statusColors = {
    pending: 'error',
    packing: 'warning',
    packed: 'info',
    shipped: 'success',
    completed: 'default'
};

// Order process steps
const orderSteps = ['Pending', 'Packing', 'Packed', 'Shipped', 'Completed'];

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [inventoryAdjustments, setInventoryAdjustments] = useState({});

    // Fetch order details when component mounts
    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    // Fetch order details from API
    const fetchOrderDetails = async () => {
        setLoading(true);
        try {
            const orderData = await orderService.getOrderById(id);
            setOrder(orderData);
            setNewStatus(orderData.status);

            // Initialize inventory adjustments for each item
            const adjustments = {};
            orderData.orderItems.forEach(item => {
                adjustments[item.product] = 0;
            });
            setInventoryAdjustments(adjustments);

            setError(null);
        } catch (err) {
            setError('Failed to fetch order details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Update order status
    const handleUpdateStatus = async () => {
        try {
            await orderService.updateOrderStatus(id, newStatus);
            setOrder({ ...order, status: newStatus });
            setStatusDialogOpen(false);
            showSnackbar('Order status updated successfully', 'success');
        } catch (err) {
            showSnackbar('Failed to update order status', 'error');
            console.error(err);
        }
    };

    // Handle status change
    const handleStatusChange = (event) => {
        setNewStatus(event.target.value);
    };

    // Open status dialog
    const handleOpenStatusDialog = () => {
        setStatusDialogOpen(true);
    };

    // Close status dialog
    const handleCloseStatusDialog = () => {
        setStatusDialogOpen(false);
    };

    // Show snackbar
    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // Handle back button
    const handleGoBack = () => {
        navigate('/orders');
    };

    // Get status step index for stepper
    const getStatusStepIndex = (status) => {
        return orderSteps.findIndex(step => step.toLowerCase() === status.toLowerCase());
    };

    // Update inventory adjustment
    const handleInventoryAdjustment = (productId, change) => {
        setInventoryAdjustments(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + change
        }));
    };

    // Apply inventory adjustment
    const handleApplyAdjustment = async (productId) => {
        const adjustment = inventoryAdjustments[productId];
        if (adjustment === 0) return;

        try {
            await inventoryService.updateStock(
                productId,
                adjustment,
                'manual-adjustment',
                `Adjustment made from order #${id.substring(0, 8)}`
            );

            showSnackbar(`Inventory adjusted by ${adjustment}`, 'success');
            setInventoryAdjustments(prev => ({
                ...prev,
                [productId]: 0
            }));
        } catch (err) {
            showSnackbar('Failed to adjust inventory', 'error');
            console.error(err);
        }
    };

    // Print order
    const handlePrintOrder = () => {
        window.print();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !order) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 3 }}>
                    {error || 'Order not found'}
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleGoBack}
                    sx={{ mt: 2 }}
                >
                    Back to Orders
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleGoBack}
                >
                    Back to Orders
                </Button>
                <Box>
                    <Button
                        startIcon={<PrintIcon />}
                        variant="outlined"
                        onClick={handlePrintOrder}
                        sx={{ mr: 1 }}
                    >
                        Print
                    </Button>
                    <Button
                        startIcon={<EditIcon />}
                        variant="contained"
                        color="primary"
                        onClick={handleOpenStatusDialog}
                    >
                        Update Status
                    </Button>
                </Box>
            </Box>

            {/* Order Header */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" component="h1" gutterBottom>
                            Order #{order._id.substring(0, 8)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Created: {formatDate(order.createdAt)}
                        </Typography>
                        {order.updatedAt !== order.createdAt && (
                            <Typography variant="body2" color="text.secondary">
                                Last Updated: {formatDate(order.updatedAt)}
                            </Typography>
                        )}
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                        <Chip
                            label={order.status.toUpperCase()}
                            color={statusColors[order.status] || 'default'}
                            sx={{ fontSize: '1rem', p: 2 }}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Stepper activeStep={getStatusStepIndex(order.status)} alternativeLabel>
                    {orderSteps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
            </Paper>

            <Grid container spacing={4}>
                {/* Order Items */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: { xs: 3, md: 0 } }}>
                        <Typography variant="h6" gutterBottom>
                            Order Items
                        </Typography>

                        <List disablePadding>
                            {order.orderItems.map((item, index) => (
                                <Box key={index}>
                                    <ListItem sx={{ py: 2, px: 0 }}>
                                        <Grid container alignItems="center" spacing={2}>
                                            <Grid item xs={12} sm={5}>
                                                <ListItemText
                                                    primary={item.name}
                                                    secondary={`Product ID: ${item.product}`}
                                                />
                                            </Grid>
                                            <Grid item xs={6} sm={2}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Quantity: {item.quantity}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6} sm={2}>
                                                <Typography variant="body2">
                                                    ${item.price.toFixed(2)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleInventoryAdjustment(item.product, -1)}
                                                    >
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>
                                                    <TextField
                                                        size="small"
                                                        value={inventoryAdjustments[item.product] || 0}
                                                        InputProps={{
                                                            readOnly: true,
                                                            sx: { width: 60, mx: 1, textAlign: 'center' }
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleInventoryAdjustment(item.product, 1)}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        disabled={inventoryAdjustments[item.product] === 0}
                                                        onClick={() => handleApplyAdjustment(item.product)}
                                                        sx={{ ml: 1 }}
                                                    >
                                                        Apply
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </ListItem>
                                    {index < order.orderItems.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </List>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle1">
                                Subtotal: ${order.totalPrice.toFixed(2)}
                            </Typography>
                            <Typography variant="subtitle1">
                                Shipping: $0.00
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 1 }}>
                                Total: ${order.totalPrice.toFixed(2)}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Customer & Shipping Info */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Customer Information
                            </Typography>
                            {order.customer ? (
                                <>
                                    <Typography variant="body1">{order.customer.name}</Typography>
                                    <Typography variant="body2">{order.customer.email}</Typography>
                                    {order.customer.phone && (
                                        <Typography variant="body2">{order.customer.phone}</Typography>
                                    )}
                                </>
                            ) : (
                                <Typography color="text.secondary">Customer information not available</Typography>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Shipping Address
                            </Typography>
                            {order.shippingAddress ? (
                                <>
                                    <Typography variant="body2">{order.shippingAddress.street}</Typography>
                                    {order.shippingAddress.street2 && (
                                        <Typography variant="body2">{order.shippingAddress.street2}</Typography>
                                    )}
                                    <Typography variant="body2">
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                    </Typography>
                                    <Typography variant="body2">{order.shippingAddress.country}</Typography>
                                </>
                            ) : (
                                <Typography color="text.secondary">Shipping address not available</Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Status Update Dialog */}
            <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        fullWidth
                        label="Status"
                        value={newStatus}
                        onChange={handleStatusChange}
                        margin="normal"
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="packing">Packing</MenuItem>
                        <MenuItem value="packed">Packed</MenuItem>
                        <MenuItem value="shipped">Shipped</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStatusDialog}>Cancel</Button>
                    <Button onClick={handleUpdateStatus} variant="contained" color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default OrderDetail; 