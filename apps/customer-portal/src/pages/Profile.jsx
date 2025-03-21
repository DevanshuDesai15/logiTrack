import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Divider
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon
} from '@mui/icons-material';
import useAuth from '../hooks/useAuth';
import { authService } from '../services/api';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'United States'
    });

    // Fetch user profile on component mount
    useEffect(() => {
        if (user) {
            fetchUserProfile();
        }
    }, [user]);

    // Fetch user profile data
    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            // Try to get profile from API (this might need to be adjusted based on your API)
            const response = await authService.getUserProfile();
            const userData = response.data || {};

            // Update form with user data
            setProfileData(prev => ({
                ...prev,
                name: userData.name || user?.name || '',
                email: userData.email || user?.email || '',
                phone: userData.phone || '',
                street: userData.address?.street || '',
                city: userData.address?.city || '',
                state: userData.address?.state || '',
                postalCode: userData.address?.postalCode || '',
                country: userData.address?.country || 'United States'
            }));

        } catch (err) {
            console.error('Failed to fetch profile:', err);
            // If we can't fetch custom profile, at least use basic user info
            if (user) {
                setProfileData(prev => ({
                    ...prev,
                    name: user.name || '',
                    email: user.email || ''
                }));
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // This endpoint may need to be adjusted based on your API
            await authService.updateProfile({
                name: profileData.name,
                phone: profileData.phone,
                address: {
                    street: profileData.street,
                    city: profileData.city,
                    state: profileData.state,
                    postalCode: profileData.postalCode,
                    country: profileData.country
                }
            });

            setSuccess('Profile updated successfully');
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    My Profile
                </Typography>
                <Button
                    component={RouterLink}
                    to="/dashboard"
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Dashboard
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper elevation={3} sx={{ p: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h6" gutterBottom>
                            Personal Information
                        </Typography>

                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Name"
                                    name="name"
                                    value={profileData.name}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={profileData.email}
                                    disabled
                                    helperText="Email cannot be changed"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Phone"
                                    name="phone"
                                    value={profileData.phone}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Shipping Address
                        </Typography>

                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Street Address"
                                    name="street"
                                    value={profileData.street}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="City"
                                    name="city"
                                    value={profileData.city}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="State/Province"
                                    name="state"
                                    value={profileData.state}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="ZIP / Postal Code"
                                    name="postalCode"
                                    value={profileData.postalCode}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    label="Country"
                                    name="country"
                                    value={profileData.country}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                type="submit"
                                variant="contained"
                                startIcon={<SaveIcon />}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            )}
        </Container>
    );
};

export default Profile; 