import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Auction from './components/Auction';
import AuctionList from './components/AuctionList';
import AccountSettings from './components/AccountSettings';
import CreateAuction from './components/CreateAuction';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route path="/auctions" element={<ProtectedRoute><AuctionList /></ProtectedRoute>} />
        <Route path="/auction/:id" element={<ProtectedRoute><Auction /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/create-auction" element={<ProtectedRoute><CreateAuction /></ProtectedRoute>} />

        {/* Redirects */}
        <Route path="/auction" element={<Navigate to="/auctions" replace />} />
        <Route path="/" element={<Navigate to="/auctions" replace />} />
        <Route path="*" element={<Navigate to="/auctions" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
