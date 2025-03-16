import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
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
    InputAdornment
} from '@mui/material';
import {
    Search as SearchIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import productService from '../services/productApi';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    // Fetch products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Update filtered products when filters change
    useEffect(() => {
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

    // Add product to cart
    const handleAddToCart = (product) => {
        // Get existing cart from localStorage
        const existingCart = JSON.parse(localStorage.getItem('cart')) || [];

        // Check if product already exists in cart
        const existingItem = existingCart.find(item => item._id === product._id);

        if (existingItem) {
            // Increase quantity if already in cart
            existingItem.quantity += 1;
        } else {
            // Add new item to cart
            existingCart.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        // Save updated cart to localStorage
        localStorage.setItem('cart', JSON.stringify(existingCart));

        // Navigate to cart page
        navigate('/cart');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Products
            </Typography>

            {/* Filters */}
            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
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

                <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel id="category-select-label">Category</InputLabel>
                    <Select
                        labelId="category-select-label"
                        id="category-select"
                        value={selectedCategory}
                        label="Category"
                        onChange={handleCategoryChange}
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

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : filteredProducts.length === 0 ? (
                <Alert severity="info">No products found matching your criteria</Alert>
            ) : (
                <Grid container spacing={3}>
                    {filteredProducts.map((product) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="div"
                                    sx={{
                                        pt: '56.25%', // 16:9 aspect ratio
                                        backgroundColor: 'grey.200',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary" align="center">
                                        Product Image
                                    </Typography>
                                </CardMedia>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography gutterBottom variant="h6" component="h2">
                                        {product.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {product.description ?
                                            (product.description.length > 100 ?
                                                `${product.description.substring(0, 100)}...` :
                                                product.description) :
                                            'No description available'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                        <Typography variant="h6" color="primary">
                                            ${product.price.toFixed(2)}
                                        </Typography>
                                        <Chip
                                            label={`In Stock: ${product.stock}`}
                                            color={product.stock < 5 ? 'warning' : 'success'}
                                            size="small"
                                        />
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        size="small"
                                        onClick={() => handleViewProduct(product._id)}
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        size="small"
                                        color="primary"
                                        startIcon={<ShoppingCartIcon />}
                                        onClick={() => handleAddToCart(product)}
                                    >
                                        Add to Cart
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default Products; 