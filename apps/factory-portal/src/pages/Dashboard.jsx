import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Container,
    Typography,
    Box,
    Paper,
    AppBar,
    Toolbar,
    IconButton,
    Menu,
    MenuItem,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Badge
} from '@mui/material';
import {
    AccountCircle,
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const Dashboard = () => {
    const { admin, logout, isAdmin, isSubAdmin } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(true);

    useEffect(() => {
        // If somehow admin gets here without authentication, redirect to login
        if (!admin) {
            navigate('/login');
        }
    }, [admin, navigate]);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!admin) {
        return null; // Don't render anything if not authenticated
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        LogiTrack Factory Portal
                    </Typography>
                    <div>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Badge
                                color="secondary"
                                variant="dot"
                                invisible={!(admin?.role === 'admin')}
                            >
                                <AccountCircle />
                            </Badge>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleClose}>Profile</MenuItem>
                            <MenuItem onClick={handleClose}>Settings</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="persistent"
                open={drawerOpen}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        <ListItem button>
                            <ListItemIcon>
                                <DashboardIcon />
                            </ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem button>
                            <ListItemIcon>
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText primary="Users" />
                        </ListItem>
                    </List>
                    <Divider />
                    {isAdmin() && (
                        <List>
                            <ListItem button>
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Admin Settings" />
                            </ListItem>
                        </List>
                    )}
                    <Divider />
                    <List>
                        <ListItem button onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon />
                            </ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h5" gutterBottom color="primary">
                        Welcome, {admin.name}!
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Role: {admin.role.toUpperCase()}
                    </Typography>
                    <Typography paragraph sx={{ mt: 2 }}>
                        You are logged in to the factory portal. This is your dashboard.
                    </Typography>
                    {isAdmin() && (
                        <Typography paragraph sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                            You have full administrative privileges.
                        </Typography>
                    )}
                    {isSubAdmin() && (
                        <Typography paragraph sx={{ fontWeight: 'bold' }}>
                            You have limited administrative privileges.
                        </Typography>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default Dashboard; 