import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Divider,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    Warning as WarningIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import inventoryService from '../services/inventoryApi';

const InventoryStatistics = () => {
    const [stats, setStats] = useState({
        totalItems: 0,
        totalCategories: 0,
        lowStockItems: [],
        categoryCounts: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Fetch data on component mount
    useEffect(() => {
        fetchInventoryStats();
    }, []);

    // Fetch inventory statistics
    const fetchInventoryStats = async () => {
        setLoading(true);
        try {
            // Get all inventory items
            const items = await inventoryService.getInventory();

            // Calculate low stock items (less than 10)
            const lowStockItems = items.filter(item => item.stock < 10)
                .sort((a, b) => a.stock - b.stock);

            // Calculate unique categories and counts
            const categories = [...new Set(items.map(item => item.category))];

            // Create category count object
            const categoryCounts = {};
            categories.forEach(category => {
                categoryCounts[category] = items.filter(item => item.category === category).length;
            });

            setStats({
                totalItems: items.length,
                totalCategories: categories.length,
                lowStockItems: lowStockItems.slice(0, 5), // Show only top 5 low stock items
                categoryCounts
            });

            setError(null);
        } catch (err) {
            setError('Failed to fetch inventory statistics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Navigate to inventory item
    const handleViewItem = (id) => {
        navigate(`/inventory/${id}`);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Inventory Statistics
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <InventoryIcon sx={{ color: 'primary.main', mr: 1 }} />
                                <Typography variant="h6">
                                    Total Products
                                </Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 2 }}>
                                {stats.totalItems}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate('/inventory')}
                            >
                                Manage Inventory
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <WarningIcon sx={{ color: 'warning.main', mr: 1 }} />
                                <Typography variant="h6">
                                    Low Stock Items
                                </Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 2 }}>
                                {stats.lowStockItems.length}
                            </Typography>
                            <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                onClick={() => navigate('/inventory')}
                                disabled={stats.lowStockItems.length === 0}
                            >
                                Restock Items
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CategoryIcon sx={{ color: 'info.main', mr: 1 }} />
                                <Typography variant="h6">
                                    Product Categories
                                </Typography>
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 2 }}>
                                {stats.totalCategories}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 60, overflow: 'hidden' }}>
                                {Object.keys(stats.categoryCounts).map(category => (
                                    <Chip
                                        key={category}
                                        label={category}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Low Stock Items
            </Typography>

            {stats.lowStockItems.length === 0 ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                    All items are well-stocked
                </Alert>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Product</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Stock</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stats.lowStockItems.map((item) => (
                                <TableRow key={item._id}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                                    <TableCell align="right">
                                        <Typography
                                            color={item.stock <= 0 ? 'error' : 'warning.main'}
                                            fontWeight="bold"
                                        >
                                            {item.stock}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleViewItem(item._id)}
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
        </Paper>
    );
};

export default InventoryStatistics; 