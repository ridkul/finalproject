import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import ServiceListing from './pages/ServiceListing';
import ProviderDashboard from './pages/ProviderDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServiceDetail from './pages/ServiceDetail';
// Add these imports
import ChatPage from './pages/ChatPage';
import ChatListPage from './pages/ChatListPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<ServiceListing />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute role="provider" />}>
            <Route path="/dashboard" element={<ProviderDashboard />} />
          </Route>
          
          <Route path="/chats" element={<ChatListPage />} />
          <Route path="/chat/:otherUserId" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        // Add to your routes
        <Route path="/payment/callback" element={<PaymentCallback />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        <Route path="/payment/verify" element={<PaymentVerify />} />
        <Route path="/payment/create-order" element={<PaymentCreateOrder />} />
        <Route path="/payment/checkout" element={<PaymentCheckout />} />
        
        {/* Add more routes as needed */}
      </Router>
    </AuthProvider>
  );
}

export default App;


