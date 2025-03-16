import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Grid,
    TextField,
    Divider,
    CircularProgress,
    Alert,
    Snackbar,
    Breadcrumbs,
    Link,
    Chip
} from '@mui/material';
import {
    ShoppingCart as ShoppingCartIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import productService from '../services/productApi';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Fetch product details on component mount
    useEffect(() => {
        fetchProduct();
    }, [id]);

    // Fetch product by ID
    const fetchProduct = async () => {
        setLoading(true);
        try {
            const data = await productService.getProductById(id);
            setProduct(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch product details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle quantity change
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value);
        if (value > 0 && value <= (product?.stock || 1)) {
            setQuantity(value);
        }
    };

    // Handle quantity increment
    const handleIncrement = () => {
        if (quantity < (product?.stock || 1)) {
            setQuantity(quantity + 1);
        }
    };

    // Handle quantity decrement
    const handleDecrement = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    // Handle add to cart
    const handleAddToCart = () => {
        if (!product) return;

        // Get existing cart from localStorage
        const existingCart = JSON.parse(localStorage.getItem('cart')) || [];

        // Check if product already exists in cart
        const existingItemIndex = existingCart.findIndex(item => item._id === product._id);

        if (existingItemIndex !== -1) {
            // Update quantity if already in cart
            existingCart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item to cart
            existingCart.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                quantity: quantity
            });
        }

        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(existingCart));

        // Show success message
        setSnackbarMessage(`${product.name} added to cart`);
        setOpenSnackbar(true);
    };

    // Handle go to cart
    const handleGoToCart = () => {
        navigate('/cart');
    };

    // Handle go back
    const handleGoBack = () => {
        navigate('/products');
    };

    // Handle snackbar close
    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !product) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || 'Product not found'}
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleGoBack}
                >
                    Back to Products
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link
                    color="inherit"
                    component="button"
                    onClick={handleGoBack}
                    sx={{ textDecoration: 'none' }}
                >
                    Products
                </Link>
                <Typography color="text.primary">{product.name}</Typography>
            </Breadcrumbs>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={4}>
                    {/* Product Image */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                backgroundColor: 'grey.200',
                                height: 400,
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="body1" color="text.secondary">
                                Product Image
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Product Details */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {product.name}
                        </Typography>

                        <Typography variant="h5" color="primary" sx={{ mb: 2 }}>
                            ${product.price.toFixed(2)}
                        </Typography>

                        <Chip
                            label={product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                            color={product.stock > 0 ? (product.stock < 5 ? 'warning' : 'success') : 'error'}
                            sx={{ mb: 3 }}
                        />

                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Category: {product.category}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="body1" paragraph>
                            {product.description || 'No description available for this product.'}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        {/* Quantity Selector */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Typography variant="subtitle1" sx={{ mr: 2 }}>
                                Quantity:
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleDecrement}
                                disabled={quantity <= 1}
                            >
                                -
                            </Button>
                            <TextField
                                value={quantity}
                                onChange={handleQuantityChange}
                                type="number"
                                InputProps={{
                                    inputProps: { min: 1, max: product.stock }
                                }}
                                sx={{ width: 60, mx: 1 }}
                                size="small"
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleIncrement}
                                disabled={quantity >= product.stock}
                            >
                                +
                            </Button>
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<ShoppingCartIcon />}
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0}
                                fullWidth
                            >
                                Add to Cart
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleGoToCart}
                                fullWidth
                            >
                                View Cart
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Snackbar for notifications */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity="success">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default ProductDetail; 