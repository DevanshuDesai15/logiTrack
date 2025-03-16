import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    ShoppingCart as ShoppingCartIcon,
    CreditCard as CreditCardIcon
} from '@mui/icons-material';
import orderService from '../services/orderApi';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States'
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Load cart from localStorage on component mount
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(savedCart);
    }, []);

    // Update cart in localStorage when it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Calculate total price
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // Handle quantity increase
    const handleIncreaseQuantity = (id) => {
        setCartItems(
            cartItems.map(item =>
                item._id === id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        );
    };

    // Handle quantity decrease
    const handleDecreaseQuantity = (id) => {
        setCartItems(
            cartItems.map(item =>
                item._id === id && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };

    // Handle item removal
    const handleRemoveItem = (id) => {
        setCartItems(cartItems.filter(item => item._id !== id));
    };

    // Handle checkout click
    const handleCheckoutClick = () => {
        if (!isAuthenticated()) {
            // Redirect to login if not authenticated
            showSnackbar('Please login to checkout', 'info');
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }

        // Navigate to checkout page
        navigate('/checkout');
    };

    // Handle shipping address change
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress({
            ...shippingAddress,
            [name]: value
        });
    };

    // Handle closing the dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // Handle order submission
    const handleSubmitOrder = async () => {
        // Validate shipping address
        if (!shippingAddress.street || !shippingAddress.city ||
            !shippingAddress.state || !shippingAddress.postalCode) {
            showSnackbar('Please fill all address fields', 'error');
            return;
        }

        setLoading(true);
        try {
            // Prepare order data
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item._id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                shippingAddress,
                paymentMethod: 'Credit Card', // Hardcoded for now
                totalPrice,
            };

            await orderService.createOrder(orderData);

            // Clear cart
            setCartItems([]);
            localStorage.removeItem('cart');

            showSnackbar('Order placed successfully!', 'success');
            handleCloseDialog();

            // Redirect to orders page
            navigate('/orders');
        } catch (err) {
            showSnackbar('Failed to place order', 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Show snackbar message
    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    };

    // Handle snackbar close
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    // Continue shopping
    const handleContinueShopping = () => {
        navigate('/products');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Shopping Cart
            </Typography>

            {cartItems.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <ShoppingCartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                        Your cart is empty
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Looks like you haven&apos;t added any products to your cart yet.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={handleContinueShopping}
                    >
                        Continue Shopping
                    </Button>
                </Paper>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="center">Quantity</TableCell>
                                    <TableCell align="right">Subtotal</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cartItems.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDecreaseQuantity(item._id)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                                <Typography sx={{ mx: 1 }}>
                                                    {item.quantity}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleIncreaseQuantity(item._id)}
                                                >
                                                    <AddIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemoveItem(item._id)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                                <Typography variant="h6">
                                    Total: ${totalPrice.toFixed(2)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                <Button
                                    variant="outlined"
                                    sx={{ mr: 1 }}
                                    onClick={handleContinueShopping}
                                >
                                    Continue Shopping
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<CreditCardIcon />}
                                    onClick={handleCheckoutClick}
                                    disabled={cartItems.length === 0}
                                >
                                    Checkout
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </>
            )}

            {/* Checkout Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md">
                <DialogTitle>Complete Your Order</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 3 }}>
                        Please provide your shipping information to complete your order.
                    </DialogContentText>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                name="street"
                                label="Street Address"
                                fullWidth
                                value={shippingAddress.street}
                                onChange={handleAddressChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="city"
                                label="City"
                                fullWidth
                                value={shippingAddress.city}
                                onChange={handleAddressChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="state"
                                label="State/Province"
                                fullWidth
                                value={shippingAddress.state}
                                onChange={handleAddressChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="postalCode"
                                label="Postal Code"
                                fullWidth
                                value={shippingAddress.postalCode}
                                onChange={handleAddressChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="country"
                                label="Country"
                                fullWidth
                                value={shippingAddress.country}
                                onChange={handleAddressChange}
                                required
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Order Summary
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Total Items:</Typography>
                            <Typography>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography>Total Price:</Typography>
                            <Typography color="primary" fontWeight="bold">${totalPrice.toFixed(2)}</Typography>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmitOrder}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message={snackbarMessage}
            />
        </Box>
    );
};

export default Cart; 