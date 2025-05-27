import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { refreshToken, getUserProfile } from './store/slices/authSlice';
import { RootState, AppDispatch } from './store';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { PermissionsProvider } from './contexts/PermissionsContext';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import SupplierRegistrationPage from './pages/supplier/SupplierRegistrationPage';

// Placeholder pages for testing
const Dashboard = () => <div>Dashboard (Protected)</div>;
const SupplierDashboard = () => <div>Supplier Dashboard (Supplier Only)</div>;
const Unauthorized = () => <div>Unauthorized Access</div>;

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import SuppliersPage from './pages/admin/SuppliersPage';
import SupplierDetailPage from './pages/admin/SupplierDetailPage';
import ServicesPage from './pages/admin/ServicesPage';
import ServiceDetailPage from './pages/admin/ServiceDetailPage';

// Supplier pages
import SupplierServicesPage from './pages/supplier/services/SupplierServicesPage';
import ServiceCreatePage from './pages/supplier/services/ServiceCreatePage';
import ServiceEditPage from './pages/supplier/services/ServiceEditPage';

// Marketplace pages
import HomePage from './pages/marketplace/HomePage';
import CategoriesPage from './pages/marketplace/CategoriesPage';
import CategoryDetailPage from './pages/marketplace/CategoryDetailPage';
import ServicesPage from './pages/marketplace/ServicesPage';
import MarketplaceServiceDetailPage from './pages/marketplace/ServiceDetailPage';
import ContractDetailsPage from './pages/contracts/ContractDetailsPage';
import PaymentPage from './pages/contracts/payment/PaymentPage';
import ClientContractsPage from './pages/contracts/ClientContractsPage';
import ContractDetailPage from './pages/contracts/ContractDetailPage';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // Try to refresh token on app load
    if (localStorage.getItem('refreshToken')) {
      dispatch(refreshToken());
    }
    
    // Get user profile if authenticated
    if (isAuthenticated) {
      dispatch(getUserProfile());
    }
  }, [dispatch, isAuthenticated]);
  
  return (
    <Router>
      <PermissionsProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/esqueci-senha" element={<ForgotPasswordPage />} />
          <Route path="/reset-senha/:token" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Marketplace Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/categorias" element={<CategoriesPage />} />
          <Route path="/categorias/:categoryId" element={<CategoryDetailPage />} />
          <Route path="/servicos" element={<ServicesPage />} />
          <Route path="/servicos/:serviceId" element={<MarketplaceServiceDetailPage />} />
          <Route 
            path="/servicos/:serviceId/contratar" 
            element={
              <ProtectedRoute>
                <ContractDetailsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cliente/contratos" 
            element={
              <ProtectedRoute>
                <ClientContractsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cliente/contratos/:contractId" 
            element={
              <ProtectedRoute>
                <ContractDetailPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/cliente/contratos/:contractId/pagamento" 
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Supplier Registration */}
          <Route 
            path="/cadastro-fornecedor" 
            element={
              <ProtectedRoute>
                <SupplierRegistrationPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Role-Specific Routes */}
          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/fornecedores" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SuppliersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/fornecedores/:supplierId" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SupplierDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/servicos" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ServicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/servicos/:serviceId" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ServiceDetailPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Supplier Routes */}
          <Route 
            path="/fornecedor" 
            element={
              <ProtectedRoute allowedRoles={['SUPPLIER']}>
                <SupplierDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fornecedor/servicos" 
            element={
              <ProtectedRoute allowedRoles={['SUPPLIER']}>
                <SupplierServicesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fornecedor/servicos/novo" 
            element={
              <ProtectedRoute allowedRoles={['SUPPLIER']}>
                <ServiceCreatePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/fornecedor/servicos/editar/:serviceId" 
            element={
              <ProtectedRoute allowedRoles={['SUPPLIER']}>
                <ServiceEditPage />
              </ProtectedRoute>
            } 
          />
          
          {/* We replaced this with an actual home page route */}
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PermissionsProvider>
    </Router>
  );
};

export default App;