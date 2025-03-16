import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    TextField,
    Divider,
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemText,
    Chip,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Snackbar,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Add as AddIcon,
    Remove as RemoveIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import inventoryService from '../services/inventoryApi';

const InventoryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: ''
    });

    const [inventoryLogs, setInventoryLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [showLogs, setShowLogs] = useState(false);

    const [stockDialog, setStockDialog] = useState(false);
    const [stockAdjustment, setStockAdjustment] = useState('');
    const [adjustmentReason, setAdjustmentReason] = useState('manual-adjustment');
    const [adjustmentDetails, setAdjustmentDetails] = useState('');

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    // Load product details on component mount
    useEffect(() => {
        fetchProductDetails();
    }, [id]);

    // Fetch product details from API
    const fetchProductDetails = async () => {
        setLoading(true);
        try {
            const data = await inventoryService.getInventoryById(id);
            setProduct(data);
            setFormData({
                name: data.name,
                description: data.description || '',
                price: data.price.toString(),
                category: data.category
            });
            setError(null);
        } catch (err) {
            setError('Failed to fetch product details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Load inventory logs
    const fetchInventoryLogs = async () => {
        setLogsLoading(true);
        try {
            const logs = await inventoryService.getInventoryLogs(id);
            setInventoryLogs(logs);
            setShowLogs(true);
        } catch (err) {
            showSnackbar('Failed to load inventory logs', 'error');
            console.error(err);
        } finally {
            setLogsLoading(false);
        }
    };

    // Toggle edit mode
    const handleToggleEdit = () => {
        if (isEditing) {
            // Cancel editing - reset form data
            setFormData({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                category: product.category
            });
        }
        setIsEditing(!isEditing);
    };

    // Handle form field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Save product changes
    const handleSaveProduct = async () => {
        // Form validation
        if (!formData.name || !formData.price || !formData.category) {
            showSnackbar('Please fill all required fields', 'error');
            return;
        }

        try {
            await inventoryService.updateInventory(id, {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category
            });

            // Update local state
            setProduct({
                ...product,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category
            });

            setIsEditing(false);
            showSnackbar('Product updated successfully', 'success');
        } catch (err) {
            showSnackbar('Failed to update product', 'error');
            console.error(err);
        }
    };

    // Open stock adjustment dialog
    const handleOpenStockDialog = () => {
        setStockAdjustment('');
        setAdjustmentReason('manual-adjustment');
        setAdjustmentDetails('');
        setStockDialog(true);
    };

    // Close stock adjustment dialog
    const handleCloseStockDialog = () => {
        setStockDialog(false);
    };

    // Submit stock adjustment
    const handleSubmitStockAdjustment = async () => {
        // Validate input
        if (!stockAdjustment) {
            showSnackbar('Please enter an adjustment amount', 'error');
            return;
        }

        const adjustment = parseInt(stockAdjustment);

        // Check if adjustment would result in negative stock
        if (product.stock + adjustment < 0) {
            showSnackbar('Adjustment would result in negative stock', 'error');
            return;
        }

        try {
            const result = await inventoryService.updateStock(
                id,
                adjustment,
                adjustmentReason,
                adjustmentDetails
            );

            // Update product in state
            setProduct({
                ...product,
                stock: product.stock + adjustment
            });

            handleCloseStockDialog();
            showSnackbar(`Stock updated successfully (${adjustment > 0 ? '+' : ''}${adjustment})`, 'success');

            // Refresh inventory logs if they're being shown
            if (showLogs) {
                fetchInventoryLogs();
            }
        } catch (err) {
            showSnackbar('Failed to update stock', 'error');
            console.error(err);
        }
    };

    // Show snackbar message
    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    // Handle snackbar close
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // Format date for logs
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    // Handle back button
    const handleGoBack = () => {
        navigate('/inventory');
    };

    // Toggle logs visibility
    const handleToggleLogs = () => {
        if (!showLogs) {
            fetchInventoryLogs();
        } else {
            setShowLogs(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !product) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 3 }}>
                    {error || 'Product not found'}
                </Alert>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleGoBack}
                    sx={{ mt: 2 }}
                >
                    Back to Inventory
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
                    Back to Inventory
                </Button>
                <Box>
                    <Button
                        startIcon={<HistoryIcon />}
                        variant="outlined"
                        onClick={handleToggleLogs}
                        sx={{ mr: 1 }}
                    >
                        {showLogs ? 'Hide Logs' : 'Show Logs'}
                    </Button>
                    <Button
                        startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                        variant="contained"
                        color={isEditing ? 'success' : 'primary'}
                        onClick={isEditing ? handleSaveProduct : handleToggleEdit}
                    >
                        {isEditing ? 'Save' : 'Edit Product'}
                    </Button>
                </Box>
            </Box>

            {/* Product Details Card */}
            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" component="h1" gutterBottom>
                            {isEditing ? 'Edit Product' : 'Product Details'}
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        {isEditing ? (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Product Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Price"
                                        name="price"
                                        type="number"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                    />
                                </Grid>
                            </Grid>
                        ) : (
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Product Name
                                    </Typography>
                                    <Typography variant="h6">
                                        {product.name}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Price
                                    </Typography>
                                    <Typography variant="h6">
                                        ${product.price.toFixed(2)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Category
                                    </Typography>
                                    <Typography variant="h6">
                                        {product.category}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Description
                                    </Typography>
                                    <Typography variant="body1">
                                        {product.description || 'No description available'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Grid>

                {/* Stock Management Card */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardHeader title="Stock Management" />
                        <CardContent>
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h3" gutterBottom>
                                    {product.stock}
                                </Typography>
                                <Chip
                                    label={product.stock > 0 ? (product.stock < 10 ? 'Low Stock' : 'In Stock') : 'Out of Stock'}
                                    color={product.stock > 0 ? (product.stock < 10 ? 'warning' : 'success') : 'error'}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={handleOpenStockDialog}
                                    sx={{ mt: 2 }}
                                >
                                    Adjust Stock
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Inventory Logs */}
            {showLogs && (
                <Paper sx={{ mt: 4, p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Inventory Logs
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {logsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : inventoryLogs.length === 0 ? (
                        <Alert severity="info">No inventory logs found for this product</Alert>
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Change</TableCell>
                                        <TableCell>Reason</TableCell>
                                        <TableCell>Details</TableCell>
                                        <TableCell>Updated By</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {inventoryLogs.map((log) => (
                                        <TableRow key={log._id}>
                                            <TableCell>{formatDate(log.createdAt)}</TableCell>
                                            <TableCell>
                                                <Typography
                                                    color={log.change > 0 ? 'success.main' : log.change < 0 ? 'error.main' : 'text.primary'}
                                                    fontWeight="bold"
                                                >
                                                    {log.change > 0 ? '+' : ''}{log.change}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.reason}
                                                    color={log.reason === 'order' ? 'primary' : 'default'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{log.reasonDetails || '-'}</TableCell>
                                            <TableCell>{log.user ? log.user.name : 'System'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            )}

            {/* Stock Adjustment Dialog */}
            <Dialog open={stockDialog} onClose={handleCloseStockDialog}>
                <DialogTitle>Adjust Stock</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <Typography variant="body2" gutterBottom>
                                Current Stock: {product.stock}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Adjustment"
                                type="number"
                                value={stockAdjustment}
                                onChange={(e) => setStockAdjustment(e.target.value)}
                                helperText="Use positive values to add stock, negative to remove"
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Reason</InputLabel>
                                <Select
                                    value={adjustmentReason}
                                    onChange={(e) => setAdjustmentReason(e.target.value)}
                                    label="Reason"
                                >
                                    <MenuItem value="manual-adjustment">Manual Adjustment</MenuItem>
                                    <MenuItem value="return">Customer Return</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Details (Optional)"
                                value={adjustmentDetails}
                                onChange={(e) => setAdjustmentDetails(e.target.value)}
                                multiline
                                rows={2}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStockDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmitStockAdjustment}
                        variant="contained"
                        color="primary"
                    >
                        Apply Adjustment
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

export default InventoryDetail; 