// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If token exists, show the page
  return children;
}

export default ProtectedRoute;
