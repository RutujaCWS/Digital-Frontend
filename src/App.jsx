import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public
import Landing from '../src/components/pages/Landing';
import ProductDetail from '../src/components/pages/ProductDetail';
import Cart from '../src/components/pages/Cart';
import Login from '../src/components/pages/Login';
import ForgotPassword from '../src/components/pages/ForgotPassword';
import Register from '../src/components/pages/Register';
import Checkout from '../src/components/pages/Checkout';
import Orders from '../src/components/pages/Orders';
import Support from '../src/components/pages/Support';
import About from '../src/components/pages/About';
import Contact from '../src/components/pages/Contact';

// Admin
import AdminDashboard from '../src/components/pages/admin/AdminDashboard';
import AdminProducts from '../src/components/pages/admin/AdminProducts';
import AdminOrders from '../src/components/pages/admin/AdminOrders';
import StaffManagement from '../src/components/pages/admin/StaffManagement';
import SupportRequests from '../src/components/pages/admin/SupportRequests';
import SystemMonitor from '../src/components/pages/admin/SystemMonitor';
import SiteSettings from '../src/components/pages/admin/SiteSettings';
import AdminCategories from '../src/components/pages/admin/AdminCategories';
import AdminBrands from '../src/components/pages/admin/AdminBrands';
import AdminContacts from '../src/components/pages/admin/AdminContacts';
import AdminOffers from '../src/components/pages/admin/AdminOffers';
import AdminGallery from '../src/components/pages/admin/AdminGallery';
import AdminWhatsApp from '../src/components/pages/admin/AdminWhatsApp';
import AdminReports from '../src/components/pages/admin/AdminReports';

// Back Office
import BackOfficeDashboard from '../src/components/pages/backoffice/BackOfficeDashboard';
import BackOfficeProducts from '../src/components/pages/backoffice/BackOfficeProducts';
import BackOfficeSupport from '../src/components/pages/backoffice/BackOfficeSupport';

// Network
import NetworkDashboard from '../src/components/pages/network/NetworkDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute roles={['admin']}><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute roles={['admin']}><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/staff" element={<ProtectedRoute roles={['admin']}><StaffManagement /></ProtectedRoute>} />
            <Route path="/admin/support" element={<ProtectedRoute roles={['admin']}><SupportRequests /></ProtectedRoute>} />
            <Route path="/admin/system" element={<ProtectedRoute roles={['admin']}><SystemMonitor /></ProtectedRoute>} />
            <Route path="/admin/site-settings" element={<ProtectedRoute roles={['admin']}><SiteSettings /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute roles={['admin']}><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/brands" element={<ProtectedRoute roles={['admin']}><AdminBrands /></ProtectedRoute>} />
            <Route path="/admin/contacts" element={<ProtectedRoute roles={['admin']}><AdminContacts /></ProtectedRoute>} />
            <Route path="/admin/offers" element={<ProtectedRoute roles={['admin']}><AdminOffers /></ProtectedRoute>} />
            <Route path="/admin/gallery" element={<ProtectedRoute roles={['admin']}><AdminGallery /></ProtectedRoute>} />
            <Route path="/admin/whatsapp" element={<ProtectedRoute roles={['admin']}><AdminWhatsApp /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute roles={['admin']}><AdminReports /></ProtectedRoute>} />

            {/* Back Office */}
            <Route path="/backoffice" element={<ProtectedRoute roles={['backoffice', 'admin']}><BackOfficeDashboard /></ProtectedRoute>} />
            <Route path="/backoffice/products" element={<ProtectedRoute roles={['backoffice', 'admin']}><BackOfficeProducts /></ProtectedRoute>} />
            <Route path="/backoffice/support" element={<ProtectedRoute roles={['backoffice', 'admin']}><BackOfficeSupport /></ProtectedRoute>} />

            {/* Network */}
            <Route path="/network" element={<ProtectedRoute roles={['network', 'admin']}><NetworkDashboard /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;