// components/Navbar.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => navigate('/')}>
          🎓 Event Registration
        </div>

        {isAuthenticated ? (
          <div className="nav-links">
            {/* Student Links */}
            {!isAdmin && (
              <>
                <button onClick={() => navigate('/')} className="nav-btn">Events</button>
                <button onClick={() => navigate('/my-registrations')} className="nav-btn">My Registrations</button>
              </>
            )}

            {/* Admin Links - Only for admins */}
            {isAdmin && (
              <>
                <button onClick={() => navigate('/admin/dashboard')} className="nav-btn admin-btn">Dashboard</button>
                <button onClick={() => navigate('/admin/events')} className="nav-btn admin-btn">Manage Events</button>
                <button onClick={() => navigate('/admin/users')} className="nav-btn admin-btn">Manage Users</button>
              </>
            )}

            {/* Profile */}
            <button onClick={() => navigate('/profile')} className="nav-btn profile-btn">
              👤 {user?.name}
            </button>

            {/* Logout */}
            <button onClick={handleLogout} className="nav-btn logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-links">
            <button onClick={() => navigate('/login')} className="nav-btn">Login</button>
            <button onClick={() => navigate('/signup')} className="nav-btn">Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
