import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    ButtonGroup,
    Chip,
    IconButton,
    Tabs,
    Tab,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import orderService from '../services/orderApi';

// Map status to color
const statusColors = {
    pending: 'error',
    packing: 'warning',
    packed: 'info',
    shipped: 'success',
    completed: 'default'
};

// Tab panel component
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`order-tabpanel-${index}`}
            aria-labelledby={`order-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const navigate = useNavigate();

    // Tab values map to order statuses
    const tabs = [
        { label: 'All Orders', value: null },
        { label: 'Pending', value: 'pending' },
        { label: 'Packing', value: 'packing' },
        { label: 'Packed', value: 'packed' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Completed', value: 'completed' }
    ];

    // Fetch orders on component mount and tab change
    useEffect(() => {
        fetchOrders();
    }, [tabValue]);

    // Fetch orders based on current tab/status
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const status = tabs[tabValue].value;
            const data = await orderService.getOrders(status);
            setOrders(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch orders');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Handle view order details
    const handleViewOrder = (id) => {
        navigate(`/orders/${id}`);
    };

    // Handle order status update
    const handleUpdateStatus = async (orderId, currentStatus) => {
        try {
            let newStatus;

            // Determine next status based on current status
            switch (currentStatus) {
                case 'pending':
                    newStatus = 'packing';
                    break;
                case 'packing':
                    newStatus = 'packed';
                    break;
                case 'packed':
                    newStatus = 'shipped';
                    break;
                case 'shipped':
                    newStatus = 'completed';
                    break;
                default:
                    return;
            }

            await orderService.updateOrderStatus(orderId, newStatus);
            showSnackbar(`Order status updated to ${newStatus}`, 'success');
            fetchOrders(); // Refresh order list
        } catch (err) {
            showSnackbar('Failed to update order status', 'error');
            console.error(err);
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

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    // Get next status button label
    const getNextStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'Start Packing';
            case 'packing':
                return 'Mark as Packed';
            case 'packed':
                return 'Ship Order';
            case 'shipped':
                return 'Complete';
            default:
                return null;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Order Management
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchOrders}
                >
                    Refresh
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((tab, index) => (
                        <Tab key={index} label={tab.label} />
                    ))}
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={tabValue}>
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
                                    <TableCell>Order ID</TableCell>
                                    <TableCell>Customer</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            No orders found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    orders.map((order) => (
                                        <TableRow key={order._id}>
                                            <TableCell>
                                                <Typography
                                                    sx={{ cursor: 'pointer', fontWeight: 'medium' }}
                                                    onClick={() => handleViewOrder(order._id)}
                                                >
                                                    {order._id.substring(0, 8)}...
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{order.customer ? order.customer.name : 'N/A'}</TableCell>
                                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                                            <TableCell align="right">${order.totalPrice.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.status.toUpperCase()}
                                                    color={statusColors[order.status]}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <ButtonGroup size="small">
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleViewOrder(order._id)}
                                                        size="small"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                    {order.status !== 'completed' && (
                                                        <Button
                                                            color="primary"
                                                            onClick={() => handleUpdateStatus(order._id, order.status)}
                                                            size="small"
                                                            variant="outlined"
                                                        >
                                                            {getNextStatusLabel(order.status)}
                                                        </Button>
                                                    )}
                                                </ButtonGroup>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </TabPanel>

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

export default Orders; 