import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import inventoryService from '../services/inventoryApi';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const navigate = useNavigate();

    // Fetch inventory on component mount
    useEffect(() => {
        fetchInventory();
    }, []);

    // Fetch inventory items
    const fetchInventory = async () => {
        setLoading(true);
        try {
            const data = await inventoryService.getInventory();
            setInventory(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch inventory');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle dialog open for adding new item
    const handleAddNew = () => {
        setCurrentItem({
            name: '',
            description: '',
            price: '',
            stock: '',
            category: ''
        });
        setIsEditing(false);
        setOpenDialog(true);
    };

    // Handle dialog open for editing item
    const handleEdit = (item) => {
        setCurrentItem({
            ...item,
            price: item.price.toString(),
            stock: item.stock.toString()
        });
        setIsEditing(true);
        setOpenDialog(true);
    };

    // Handle dialog close
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // Handle input change in dialog form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentItem({
            ...currentItem,
            [name]: value
        });
    };

    // Handle form submission for creating or updating item
    const handleSubmit = async () => {
        // Validate form fields
        if (!currentItem.name || !currentItem.price || !currentItem.category) {
            showSnackbar('Please fill all required fields', 'error');
            return;
        }

        try {
            if (isEditing) {
                // Update existing item
                await inventoryService.updateInventory(currentItem._id, {
                    name: currentItem.name,
                    description: currentItem.description,
                    price: parseFloat(currentItem.price),
                    category: currentItem.category
                });
                showSnackbar('Item updated successfully', 'success');
            } else {
                // Create new item
                await inventoryService.createInventory({
                    name: currentItem.name,
                    description: currentItem.description,
                    price: parseFloat(currentItem.price),
                    stock: parseInt(currentItem.stock) || 0,
                    category: currentItem.category
                });
                showSnackbar('Item created successfully', 'success');
            }

            // Refresh inventory list and close dialog
            fetchInventory();
            handleCloseDialog();
        } catch (err) {
            showSnackbar('Operation failed', 'error');
            console.error(err);
        }
    };

    // Handle item deletion
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await inventoryService.deleteInventory(id);
                showSnackbar('Item deleted successfully', 'success');
                fetchInventory();
            } catch (err) {
                showSnackbar('Failed to delete item', 'error');
                console.error(err);
            }
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

    // Handle view details/stock management
    const handleViewDetails = (id) => {
        navigate(`/inventory/${id}`);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Inventory Management
                </Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchInventory}
                        sx={{ mr: 1 }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddNew}
                    >
                        Add New Item
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Stock</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {inventory.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No inventory items found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                inventory.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell>
                                            <Typography
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => handleViewDetails(item._id)}
                                            >
                                                {item.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                        <TableCell align="right">
                                            <Typography
                                                color={item.stock <= 0 ? 'error' : item.stock < 10 ? 'warning.main' : 'inherit'}
                                                fontWeight={item.stock < 10 ? 'bold' : 'normal'}
                                            >
                                                {item.stock}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleEdit(item)}
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDelete(item._id)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog for adding/editing items */}
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {isEditing ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        {isEditing
                            ? 'Update the inventory item details below.'
                            : 'Fill in the details for the new inventory item.'}
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Item Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentItem.name}
                        onChange={handleInputChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        value={currentItem.description || ''}
                        onChange={handleInputChange}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TextField
                            margin="dense"
                            name="price"
                            label="Price"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={currentItem.price}
                            onChange={handleInputChange}
                            required
                            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                        />
                        {!isEditing && (
                            <TextField
                                margin="dense"
                                name="stock"
                                label="Initial Stock"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={currentItem.stock}
                                onChange={handleInputChange}
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                        )}
                    </Box>
                    <TextField
                        margin="dense"
                        name="category"
                        label="Category"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={currentItem.category}
                        onChange={handleInputChange}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {isEditing ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Inventory; 