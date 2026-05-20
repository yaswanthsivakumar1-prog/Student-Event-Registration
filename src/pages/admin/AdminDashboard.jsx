import { useState, useEffect } from 'react';
import { authAPI, eventsAPI } from '../../services/api';
import '../../styles/admin/AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Get dashboard stats from backend
      const dashboardResponse = await authAPI.getDashboardStats();
      setStats(dashboardResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard stats');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h1>📊 Admin Dashboard</h1>
        <button onClick={loadDashboardStats} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Total Events</h3>
            <p className="stat-value">{stats.totalEvents || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Total Registrations</h3>
            <p className="stat-value">{stats.totalRegistrations || 0}</p>
          </div>
        </div>

        {stats.usersOnline !== undefined && (
          <div className="stat-card online">
            <div className="stat-icon">🟢</div>
            <div className="stat-content">
              <h3>Users Online</h3>
              <p className="stat-value">{stats.usersOnline || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="quick-links">
        <h2>Quick Actions</h2>
        <div className="links-grid">
          <a href="/admin/users" className="quick-link">
            👥 Manage Users
          </a>
          <a href="/admin/events" className="quick-link">
            📅 Manage Events
          </a>
          <a href="/" className="quick-link">
            📱 View Events
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
