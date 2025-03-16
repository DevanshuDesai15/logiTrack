import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    Delete as DeleteIcon,
    ShoppingCart as ShoppingCartIcon,
    CreditCard as CreditCardIcon,
    ArrowBack as ArrowBackIcon,
    Sync as SyncIcon
} from '@mui/icons-material';
import orderService from '../services/orderApi';
import { cartService } from '../services/api';
import api from '../services/api';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [syncingCart, setSyncingCart] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
    const [orderError, setOrderError] = useState('');
    const [shippingAddress, setShippingAddress] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States',
        phone: ''
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Load cart when component mounts or location changes
    useEffect(() => {
        loadCart();
    }, [location, isAuthenticated]);

    // Load cart data from API or localStorage
    const loadCart = async () => {
        setLoading(true);
        try {
            if (isAuthenticated()) {
                // Load cart from API if authenticated
                const cart = await cartService.getCart();
                setCartItems(cart.items || []);
                console.log('Loaded cart from API:', cart);
            } else {
                // Load cart from localStorage if not authenticated
                const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
                setCartItems(savedCart);
                console.log('Loaded cart from localStorage:', savedCart);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            showSnackbar('Failed to load your cart', 'error');
            // Fallback to localStorage if API fails
            const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
            setCartItems(savedCart);
        } finally {
            setLoading(false);
        }
    };

    // Sync localStorage cart with database when user logs in
    const syncCartWithDatabase = async () => {
        if (!isAuthenticated()) {
            showSnackbar('You must be logged in to sync your cart', 'warning');
            return;
        }

        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length === 0) {
            showSnackbar('Your local cart is empty', 'info');
            return;
        }

        setSyncingCart(true);
        try {
            const result = await cartService.syncCart(localCart);
            setCartItems(result.items || []);
            localStorage.removeItem('cart'); // Clear localStorage cart after sync
            showSnackbar('Cart synchronized successfully', 'success');
        } catch (error) {
            console.error('Error syncing cart:', error);
            showSnackbar('Failed to sync your cart', 'error');
        } finally {
            setSyncingCart(false);
        }
    };

    // Save cart to localStorage (only needed for non-authenticated users)
    const saveCartToLocalStorage = (items) => {
        if (!isAuthenticated()) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    };

    // Calculate total price
    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // Handle quantity increase
    const handleIncreaseQuantity = async (id) => {
        try {
            if (isAuthenticated()) {
                // Update via API if authenticated
                const item = cartItems.find(item => item.product?._id === id || item._id === id);
                const quantity = item.quantity + 1;
                const productId = item.product?._id || id;
                await cartService.updateCartItem(productId, quantity);
                await loadCart(); // Reload cart from API
            } else {
                // Update locally if not authenticated
                const updatedCart = cartItems.map(item =>
                    (item._id === id || item.product?._id === id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
                setCartItems(updatedCart);
                saveCartToLocalStorage(updatedCart);
            }
        } catch (error) {
            console.error('Error increasing quantity:', error);
            showSnackbar('Failed to update quantity', 'error');
        }
    };

    // Handle quantity decrease
    const handleDecreaseQuantity = async (id) => {
        try {
            const item = cartItems.find(item => item.product?._id === id || item._id === id);
            if (!item || item.quantity <= 1) return;

            if (isAuthenticated()) {
                // Update via API if authenticated
                const quantity = item.quantity - 1;
                const productId = item.product?._id || id;
                await cartService.updateCartItem(productId, quantity);
                await loadCart(); // Reload cart from API
            } else {
                // Update locally if not authenticated
                const updatedCart = cartItems.map(item =>
                    (item._id === id || item.product?._id === id) && item.quantity > 1
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
                setCartItems(updatedCart);
                saveCartToLocalStorage(updatedCart);
            }
        } catch (error) {
            console.error('Error decreasing quantity:', error);
            showSnackbar('Failed to update quantity', 'error');
        }
    };

    // Handle item removal
    const handleRemoveItem = async (id) => {
        try {
            if (isAuthenticated()) {
                // Remove via API if authenticated
                const productId = cartItems.find(item => item.product?._id === id || item._id === id)?.product?._id || id;
                await cartService.removeCartItem(productId);
                await loadCart(); // Reload cart from API
            } else {
                // Remove locally if not authenticated
                const updatedCart = cartItems.filter(item => item._id !== id && item.product?._id !== id);
                setCartItems(updatedCart);
                saveCartToLocalStorage(updatedCart);
            }
            showSnackbar('Item removed from cart', 'success');
        } catch (error) {
            console.error('Error removing item:', error);
            showSnackbar('Failed to remove item', 'error');
        }
    };

    // Handle checkout click
    const handleCheckoutClick = () => {
        if (!isAuthenticated()) {
            // Redirect to login if not authenticated
            showSnackbar('Please login to checkout', 'info');
            navigate('/login', { state: { from: '/cart' } });
            return;
        }

        // Open the checkout dialog instead of navigating
        setOpenDialog(true);
    };

    // Handle shipping address change
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress({
            ...shippingAddress,
            [name]: value
        });
    };

    // Initialize shipping address with user data if available
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (isAuthenticated() && user) {
                try {
                    // Try to get customer profile data
                    const response = await api.get('/auth/profile');

                    if (response.data) {
                        const userData = response.data;
                        if (userData.address) {
                            setShippingAddress({
                                street: userData.address.street || '',
                                city: userData.address.city || '',
                                state: userData.address.state || '',
                                postalCode: userData.address.postalCode || '',
                                country: userData.address.country || 'United States',
                                phone: userData.phone || ''
                            });
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                }
            }
        };

        fetchUserProfile();
    }, [user, isAuthenticated]);

    // Handle closing the dialog
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // Handle order submission
    const handleSubmitOrder = async () => {
        try {
            if (!isAuthenticated()) {
                navigate('/login');
                return;
            }

            // Validate shipping address
            if (!shippingAddress.street || !shippingAddress.city ||
                !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.phone) {
                setSnackbarMessage('Please fill all required address fields');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
                return;
            }

            setIsSubmittingOrder(true);
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item.product?._id || item._id,
                    name: item.name || '',
                    quantity: item.quantity,
                    price: item.price
                })),
                shippingAddress: {
                    ...shippingAddress,
                    phone: shippingAddress.phone || ''
                },
                paymentMethod: 'Credit Card',
                userId: user?._id,
                customerName: user?.name || '',
                customerEmail: user?.email || '',
                totalPrice: totalPrice
            };

            console.log('Submitting order data:', orderData);

            const order = await orderService.createOrder(orderData);

            if (order) {
                localStorage.removeItem('cart');
                setCartItems([]);
                setOpenDialog(false);
                setOpenSnackbar(true);
                setSnackbarMessage('Order placed successfully');
                setSnackbarSeverity('success');
                navigate('/my-orders');
            }
        } catch (error) {
            console.error('Failed to place order:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
            setOrderError(error.response?.data?.message || 'Failed to place order. Please try again.');
            setSnackbarMessage('Failed to place order: ' + (error.response?.data?.message || 'Please try again.'));
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setIsSubmittingOrder(false);
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

    // Get product ID helper function
    const getProductId = (item) => {
        return item.product?._id || item._id;
    };

    // Get product name helper function
    const getProductName = (item) => {
        return item.name;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Shopping Cart
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {!isAuthenticated() && JSON.parse(localStorage.getItem('cart') || '[]').length > 0 && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<SyncIcon />}
                            onClick={() => navigate('/login', { state: { from: '/cart' } })}
                        >
                            Login to Save Cart
                        </Button>
                    )}
                    {isAuthenticated() && JSON.parse(localStorage.getItem('cart') || '[]').length > 0 && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={<SyncIcon />}
                            onClick={syncCartWithDatabase}
                            disabled={syncingCart}
                        >
                            {syncingCart ? 'Syncing...' : 'Sync Local Cart'}
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={handleContinueShopping}
                    >
                        Continue Shopping
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : cartItems.length === 0 ? (
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
                                    <TableRow key={getProductId(item)}>
                                        <TableCell>{getProductName(item)}</TableCell>
                                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDecreaseQuantity(getProductId(item))}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <RemoveIcon fontSize="small" />
                                                </IconButton>
                                                <Typography sx={{ mx: 1 }}>
                                                    {item.quantity}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleIncreaseQuantity(getProductId(item))}
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
                                                onClick={() => handleRemoveItem(getProductId(item))}
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
                                name="phone"
                                label="Phone Number"
                                fullWidth
                                value={shippingAddress.phone || ''}
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
                        disabled={isSubmittingOrder}
                    >
                        {isSubmittingOrder ? 'Processing...' : 'Place Order'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Cart;