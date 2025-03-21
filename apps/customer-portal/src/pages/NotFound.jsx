import { Link as RouterLink } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 5, textAlign: 'center' }}>
                    <Typography variant="h1" color="error" sx={{ fontSize: '8rem', fontWeight: 'bold', lineHeight: 1.1 }}>
                        404
                    </Typography>

                    <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
                        Page Not Found
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        The page you are looking for might have been removed, had its name changed,
                        or is temporarily unavailable.
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            component={RouterLink}
                            to="/"
                            variant="contained"
                            startIcon={<HomeIcon />}
                            size="large"
                        >
                            GO TO HOME
                        </Button>

                        <Button
                            component={RouterLink}
                            to="/products"
                            variant="outlined"
                            size="large"
                        >
                            BROWSE PRODUCTS
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default NotFound; 