import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import InventoryDetail from './pages/InventoryDetail';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import FactoryLayout from './components/FactoryLayout';

// Create a theme with factory/admin colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e88e5', // Blue shade
    },
    secondary: {
      main: '#ff3d00', // Orange shade
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes with shared layout */}
            <Route element={<ProtectedRoute />}>
              <Route  element={<FactoryLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/inventory/:id" element={<InventoryDetail />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:id" element={<OrderDetail />} />
                {/* Add more protected routes here that both roles can access */}
              </Route>
            </Route>

            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route element={<FactoryLayout />}>
                {/* Add admin-only routes here */}
              </Route>
            </Route>

            {/* Redirect to login if no route matches */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
