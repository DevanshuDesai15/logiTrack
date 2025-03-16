import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Grid,
    TextField,
    Divider,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/orderApi';

// Step components
const ShippingForm = ({ formData, setFormData, errors }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Shipping Address
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="firstName"
                        name="firstName"
                        label="First name"
                        fullWidth
                        value={formData.firstName}
                        onChange={handleChange}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="lastName"
                        name="lastName"
                        label="Last name"
                        fullWidth
                        value={formData.lastName}
                        onChange={handleChange}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="address1"
                        name="address1"
                        label="Address line 1"
                        fullWidth
                        value={formData.address1}
                        onChange={handleChange}
                        error={!!errors.address1}
                        helperText={errors.address1}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="address2"
                        name="address2"
                        label="Address line 2"
                        fullWidth
                        value={formData.address2}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="city"
                        name="city"
                        label="City"
                        fullWidth
                        value={formData.city}
                        onChange={handleChange}
                        error={!!errors.city}
                        helperText={errors.city}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="state"
                        name="state"
                        label="State/Province/Region"
                        fullWidth
                        value={formData.state}
                        onChange={handleChange}
                        error={!!errors.state}
                        helperText={errors.state}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="zip"
                        name="zip"
                        label="Zip / Postal code"
                        fullWidth
                        value={formData.zip}
                        onChange={handleChange}
                        error={!!errors.zip}
                        helperText={errors.zip}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="country"
                        name="country"
                        label="Country"
                        fullWidth
                        value={formData.country}
                        onChange={handleChange}
                        error={!!errors.country}
                        helperText={errors.country}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="phone"
                        name="phone"
                        label="Phone Number"
                        fullWidth
                        value={formData.phone}
                        onChange={handleChange}
                        error={!!errors.phone}
                        helperText={errors.phone}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

const PaymentForm = ({ formData, setFormData, errors }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Payment Method
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="cardName"
                        name="cardName"
                        label="Name on card"
                        fullWidth
                        value={formData.cardName}
                        onChange={handleChange}
                        error={!!errors.cardName}
                        helperText={errors.cardName}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="cardNumber"
                        name="cardNumber"
                        label="Card number"
                        fullWidth
                        value={formData.cardNumber}
                        onChange={handleChange}
                        error={!!errors.cardNumber}
                        helperText={errors.cardNumber}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="expDate"
                        name="expDate"
                        label="Expiry date (MM/YY)"
                        fullWidth
                        value={formData.expDate}
                        onChange={handleChange}
                        error={!!errors.expDate}
                        helperText={errors.expDate}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="cvv"
                        name="cvv"
                        label="CVV"
                        type="password"
                        fullWidth
                        value={formData.cvv}
                        onChange={handleChange}
                        error={!!errors.cvv}
                        helperText={errors.cvv}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

const Review = ({ cartItems, shippingAddress, totalPrice }) => {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Order Summary
            </Typography>

            <List disablePadding>
                {cartItems.map((item) => (
                    <ListItem key={item._id} sx={{ py: 1, px: 0 }}>
                        <ListItemText
                            primary={item.name}
                            secondary={`Qty: ${item.quantity}`}
                        />
                        <Typography variant="body2">
                            ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                    </ListItem>
                ))}

                <Divider sx={{ my: 2 }} />

                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Total" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        ${totalPrice.toFixed(2)}
                    </Typography>
                </ListItem>
            </List>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Shipping Address
            </Typography>

            <Typography gutterBottom>
                {`${shippingAddress.firstName} ${shippingAddress.lastName}`}
            </Typography>
            <Typography gutterBottom>{shippingAddress.address1}</Typography>
            {shippingAddress.address2 && <Typography gutterBottom>{shippingAddress.address2}</Typography>}
            <Typography gutterBottom>{`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}`}</Typography>
            <Typography gutterBottom>{shippingAddress.country}</Typography>
            <Typography gutterBottom>{shippingAddress.phone}</Typography>
        </Box>
    );
};

const steps = ['Shipping address', 'Payment details', 'Review your order'];

const Checkout = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderId, setOrderId] = useState(null);

    const [shippingFormData, setShippingFormData] = useState({
        firstName: '',
        lastName: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: ''
    });

    const [paymentFormData, setPaymentFormData] = useState({
        cardName: '',
        cardNumber: '',
        expDate: '',
        cvv: ''
    });

    const [shippingErrors, setShippingErrors] = useState({});
    const [paymentErrors, setPaymentErrors] = useState({});

    // Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Load cart items on component mount
    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }

        // Redirect to cart if cart is empty
        if (!storedCart || JSON.parse(storedCart).length === 0) {
            navigate('/cart');
        }
    }, [navigate]);

    // Handle next step
    const handleNext = () => {
        if (activeStep === 0) {
            // Validate shipping form
            const errors = validateShippingForm();
            if (Object.keys(errors).length > 0) {
                setShippingErrors(errors);
                return;
            }
            setShippingErrors({});
        } else if (activeStep === 1) {
            // Validate payment form
            const errors = validatePaymentForm();
            if (Object.keys(errors).length > 0) {
                setPaymentErrors(errors);
                return;
            }
            setPaymentErrors({});
        } else if (activeStep === 2) {
            // Submit order
            submitOrder();
            return;
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    // Handle back step
    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    // Validate shipping form
    const validateShippingForm = () => {
        const errors = {};

        if (!shippingFormData.firstName) errors.firstName = 'First name is required';
        if (!shippingFormData.lastName) errors.lastName = 'Last name is required';
        if (!shippingFormData.address1) errors.address1 = 'Address is required';
        if (!shippingFormData.city) errors.city = 'City is required';
        if (!shippingFormData.state) errors.state = 'State is required';
        if (!shippingFormData.zip) errors.zip = 'Zip code is required';
        if (!shippingFormData.country) errors.country = 'Country is required';
        if (!shippingFormData.phone) errors.phone = 'Phone number is required';

        return errors;
    };

    // Validate payment form
    const validatePaymentForm = () => {
        const errors = {};

        if (!paymentFormData.cardName) errors.cardName = 'Name on card is required';
        if (!paymentFormData.cardNumber) errors.cardNumber = 'Card number is required';
        if (!paymentFormData.expDate) errors.expDate = 'Expiry date is required';
        if (!paymentFormData.cvv) errors.cvv = 'CVV is required';

        return errors;
    };

    // Submit order
    const submitOrder = async () => {
        if (!currentUser) {
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Prepare order data
            const orderData = {
                items: cartItems.map(item => ({
                    productId: item._id,
                    quantity: item.quantity,
                    price: item.price
                })),
                shippingAddress: shippingFormData,
                totalPrice
            };

            // Call order service
            const response = await orderService.createOrder(orderData);

            // Clear cart
            localStorage.removeItem('cart');

            // Set order ID for confirmation
            setOrderId(response._id);

            // Move to confirmation step
            setActiveStep(3);
        } catch (err) {
            setError('Failed to create order. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Get step content
    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return <ShippingForm
                    formData={shippingFormData}
                    setFormData={setShippingFormData}
                    errors={shippingErrors}
                />;
            case 1:
                return <PaymentForm
                    formData={paymentFormData}
                    setFormData={setPaymentFormData}
                    errors={paymentErrors}
                />;
            case 2:
                return <Review
                    cartItems={cartItems}
                    shippingAddress={shippingFormData}
                    totalPrice={totalPrice}
                />;
            case 3:
                return (
                    <Box sx={{ textAlign: 'center', my: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Thank you for your order!
                        </Typography>
                        <Typography variant="subtitle1">
                            Your order number is #{orderId}. We have emailed your order
                            confirmation, and will send you an update when your order has
                            shipped.
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/dashboard')}
                            sx={{ mt: 3 }}
                        >
                            View Your Orders
                        </Button>
                    </Box>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography component="h1" variant="h4" align="center" gutterBottom>
                    Checkout
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {getStepContent(activeStep)}

                        {activeStep < 3 && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                                {activeStep !== 0 && (
                                    <Button onClick={handleBack} sx={{ mr: 1 }}>
                                        Back
                                    </Button>
                                )}
                                <Button
                                    variant="contained"
                                    onClick={handleNext}
                                    disabled={cartItems.length === 0}
                                >
                                    {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Paper>

            {activeStep < 3 && (
                <Card sx={{ mt: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Order Summary
                        </Typography>
                        <List disablePadding>
                            {cartItems.map((item) => (
                                <ListItem key={item._id} sx={{ py: 1, px: 0 }}>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={`Qty: ${item.quantity}`}
                                    />
                                    <Typography variant="body2">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </Typography>
                                </ListItem>
                            ))}
                            <Divider sx={{ my: 1 }} />
                            <ListItem sx={{ py: 1, px: 0 }}>
                                <ListItemText primary="Total" />
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                    ${totalPrice.toFixed(2)}
                                </Typography>
                            </ListItem>
                        </List>
                    </CardContent>
                </Card>
            )}
        </Container>
    );
};

export default Checkout; 