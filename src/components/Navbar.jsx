// components/Navbar.jsx
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  const raw = localStorage.getItem('user');
  const user = raw && raw !== 'undefined' ? JSON.parse(raw) : null;


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => navigate('/')}>
          🎓 Event Registration
        </div>

        {isLoggedIn ? (
          <div className="nav-links">
            <button onClick={() => navigate('/')}>Events</button>
            <button onClick={() => navigate('/my-registrations')}>My Registrations</button>
            <button onClick={() => navigate('/users')}>Users</button>
            <button onClick={() => navigate('/profile')}>
              {user?.name}
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-links">
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
