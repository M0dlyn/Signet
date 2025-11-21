import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Placeholder for Auction route */}
        <Route path="/auction" element={<div className="text-white text-center mt-20">Auction Page (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;
