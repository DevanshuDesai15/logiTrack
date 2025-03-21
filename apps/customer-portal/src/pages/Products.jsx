import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
    Alert,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    InputAdornment,
    Container,
    Paper,
    IconButton,
    Fade,
    Divider,
    Snackbar,
    Badge
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    Search as SearchIcon,
    ShoppingCart as ShoppingCartIcon,
    Visibility as VisibilityIcon,
    FilterList as FilterListIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import productService from '../services/productApi';
import { cartService } from '../services/api';
import useAuth from '../hooks/useAuth';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [cartItemCount, setCartItemCount] = useState(0);

    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    // Fetch products on component mount
    useEffect(() => {
        fetchProducts();
        updateCartItemCount();
    }, []);

    // Update cart item count
    const updateCartItemCount = async () => {
        if (isAuthenticated()) {
            try {
                // Get cart from API if user is logged in
                const cart = await cartService.getCart();
                setCartItemCount(cart.totalItems);
            } catch (err) {
                console.error('Error fetching cart:', err);
                // Fallback to localStorage if API fails
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                const count = cart.reduce((total, item) => total + item.quantity, 0);
                setCartItemCount(count);
            }
        } else {
            // Use localStorage if user is not logged in
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            setCartItemCount(count);
        }
    };

    // Update filtered products when filters change
    useEffect(() => {
        // Filter products based on search and category
        const filterProducts = () => {
            let filtered = [...products];

            // Apply category filter
            if (selectedCategory) {
                filtered = filtered.filter(product => product.category === selectedCategory);
            }

            // Apply search filter
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                filtered = filtered.filter(product =>
                    product.name.toLowerCase().includes(term) ||
                    (product.description && product.description.toLowerCase().includes(term))
                );
            }

            setFilteredProducts(filtered);
        };

        filterProducts();
    }, [products, selectedCategory, searchTerm]);

    // Fetch all products
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getProducts();

            // Filter out items with zero stock
            const availableProducts = data.filter(product => product.stock > 0);

            setProducts(availableProducts);
            setFilteredProducts(availableProducts);

            // Extract unique categories
            const uniqueCategories = [...new Set(availableProducts.map(product => product.category))];
            setCategories(uniqueCategories);

            setError(null);
        } catch (err) {
            setError('Failed to fetch products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle category change
    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    // Handle search term change
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // View product details
    const handleViewProduct = (id) => {
        navigate(`/products/${id}`);
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // Navigate to cart
    const handleGoToCart = () => {
        navigate('/cart');
    };

    // Add product to cart
    const handleAddToCart = async (product) => {
        try {
            if (isAuthenticated()) {
                // Use the cart API if user is logged in
                await cartService.addToCart(product._id, 1);
                setSnackbarMessage(`${product.name} added to cart`);
            } else {
                // Fallback to localStorage if user is not logged in
                // Get existing cart from localStorage
                const existingCart = JSON.parse(localStorage.getItem('cart')) || [];

                // Check if product already exists in cart
                const existingItem = existingCart.find(item => item._id === product._id);

                if (existingItem) {
                    // Increase quantity if already in cart
                    existingItem.quantity += 1;
                    setSnackbarMessage(`Increased ${product.name} quantity in cart`);
                } else {
                    // Add new item to cart
                    existingCart.push({
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        quantity: 1
                    });
                    setSnackbarMessage(`${product.name} added to cart`);
                }

                // Save updated cart to localStorage - ensure we're using a consistent format
                localStorage.setItem('cart', JSON.stringify(existingCart));

                // Log for debugging
                console.log('Cart saved to localStorage:', existingCart);
            }

            // Update cart count and show notification
            await updateCartItemCount();
            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setSnackbarMessage('Failed to add item to cart');
            setSnackbarOpen(true);
        }
    };

    const formatCurrency = (price) => {
        return `$${price.toFixed(2)}`;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, backgroundColor: 'background.paper' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <div>
                        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary.main">
                            Products
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            Browse our catalog and find the perfect product for your needs
                        </Typography>
                    </div>

                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={
                            <Badge badgeContent={cartItemCount} color="error" overlap="circular">
                                <ShoppingCartIcon />
                            </Badge>
                        }
                        onClick={handleGoToCart}
                    >
                        VIEW CART
                    </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Filters */}
                <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'flex-start' }}>
                    <TextField
                        label="Search Products"
                        variant="outlined"
                        size="small"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl sx={{ minWidth: { xs: '100%', sm: 240 } }} size="small">
                        <InputLabel id="category-select-label">Category</InputLabel>
                        <Select
                            labelId="category-select-label"
                            id="category-select"
                            value={selectedCategory}
                            label="Category"
                            onChange={handleCategoryChange}
                            startAdornment={
                                <InputAdornment position="start">
                                    <FilterListIcon fontSize="small" />
                                </InputAdornment>
                            }
                        >
                            <MenuItem value="">
                                <em>All Categories</em>
                            </MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
                                    {category}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Loading indicator */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, mb: 8 }}>
                    <CircularProgress size={60} thickness={4} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
            ) : filteredProducts.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2, mb: 2 }}>No products found matching your criteria</Alert>
            ) : (
                <Fade in={!loading}>
                    <Grid container spacing={4} disableEqualOverflow>
                        {filteredProducts.map((product) => (
                            <Grid xs={12} sm={6} md={4} key={product._id}>
                                <Card
                                    sx={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 6
                                        },
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '1px solid #eee',
                                        height: '100%'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            overflow: 'hidden',
                                            backgroundColor: '#f5f5f5',
                                            minHeight: '200px',
                                            flexShrink: 0
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 10,
                                                left: 10,
                                                zIndex: 10
                                            }}
                                        >
                                            <Chip
                                                label={`In Stock: ${product.stock}`}
                                                color="success"
                                                size="small"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    px: 1,
                                                    '& .MuiChip-label': {
                                                        px: 1
                                                    }
                                                }}
                                            />
                                        </Box>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '100%',
                                                width: '100%',
                                                minHeight: '200px'
                                            }}
                                        >
                                            <Typography variant="body1" color="text.secondary" align="center">
                                                Product Image
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                                        <Typography
                                            gutterBottom
                                            variant="h5"
                                            component="h2"
                                            sx={{
                                                fontWeight: '500',
                                                mb: 1,
                                                minHeight: '60px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}
                                        >
                                            {product.name}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                minHeight: '60px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical'
                                            }}
                                        >
                                            {product.description || 'No description available'}
                                        </Typography>

                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 1,
                                            mt: 'auto'
                                        }}>
                                            <Typography
                                                variant="h5"
                                                color="primary.main"
                                                sx={{ fontWeight: 'bold' }}
                                            >
                                                {formatCurrency(product.price)}
                                            </Typography>

                                            <Chip
                                                label={product.category}
                                                size="small"
                                                sx={{ backgroundColor: 'grey.100' }}
                                            />
                                        </Box>
                                    </CardContent>

                                    <Divider />

                                    <CardActions sx={{ p: 2, px: 3, justifyContent: 'space-between', backgroundColor: '#fafafa', flexShrink: 0 }}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleViewProduct(product._id)}
                                            startIcon={<VisibilityIcon />}
                                        >
                                            DETAILS
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<ShoppingCartIcon />}
                                            onClick={() => handleAddToCart(product)}
                                        >
                                            ADD TO CART
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Fade>
            )}

            {/* Snackbar notification */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                message={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color="success" />
                        {snackbarMessage}
                    </Box>
                }
                action={
                    <Button
                        color="primary"
                        size="small"
                        onClick={handleGoToCart}
                    >
                        VIEW CART
                    </Button>
                }
            />
        </Container>
    );
};

export default Products; 