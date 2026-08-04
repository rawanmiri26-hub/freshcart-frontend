import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Shop from './pages/Shop';
import AiPlanner from './pages/AiPlanner';
import Cart from './pages/Cart';
import CheckoutEntry from './pages/CheckoutEntry';
import Checkout from './pages/Checkout';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Signup from './pages/Signup';

import StoreLogin from './pages/admin/StoreLogin';
import Dashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import AdminOrders from './pages/admin/AdminOrders';
import Members from './pages/admin/Members';
import AdminLayout from './pages/admin/AdminLayout';

export default function App() {
  return (
    <Routes>
      {/* Public, customer-facing pages */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/ai-planner" element={<AiPlanner />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout-entry" element={<CheckoutEntry />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Store / admin pages */}
      <Route path="/store/login" element={<StoreLogin />} />
      <Route
        path="/store"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="members" element={<Members />} />
      </Route>
    </Routes>
  );
}
