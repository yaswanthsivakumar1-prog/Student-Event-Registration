import { useState, useEffect } from 'react';
import { authAPI } from '../../services/api';
import '../../styles/admin/AdminUsers.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRegistrations = async (user) => {
    try {
      setSelectedUser(user);
      const response = await authAPI.getUserRegistrations(user._id);
      setUserRegistrations(response.data);
    } catch (err) {
      setError('Failed to load user registrations');
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm('Delete this user and remove their access? This cannot be undone.');
    if (!confirmDelete) return;

    try {
      await authAPI.deleteUser(userId);
      setUsers(prev => prev.filter(user => user._id !== userId));
      if (selectedUser?._id === userId) {
        setSelectedUser(null);
        setUserRegistrations([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.username || !formData.email || !formData.password) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setError('');
      const response = await authAPI.addUser(
        formData.firstName,
        formData.username.trim().toLowerCase(),
        formData.email,
        formData.password,
        'student'
      );
      setUsers([response.data, ...users]);
      setFormData({
        firstName: '',
        username: '',
        email: '',
        password: '',
      });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  if (loading) {
    return <div className="admin-users-container"><p>Loading Users...</p></div>;
  }

  return (
    <div className="admin-users-container">
      <div className="admin-header">
        <h1>👥 Manage Users</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="add-btn"
        >
          {showForm ? '❌ Cancel' : '✅ Add User'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Add User Form */}
      {showForm && (
        <div className="add-user-form">
          <h2>Add New User</h2>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                required
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">Add User</button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter to only display student users in the dashboard */}
      {(() => {
        const studentUsers = users.filter(u => u.role === 'student');
        return (
          <div className={`content-wrapper ${selectedUser ? 'has-selected' : ''}`}>
            {/* Users List */}
            <div className="users-section">
              <h2>All Students ({studentUsers.length})</h2>
              {studentUsers.length === 0 ? (
                <p className="no-data">No students found</p>
              ) : (
                <div className="users-table-wrapper">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentUsers.map(user => (
                        <tr key={user._id} className={selectedUser?._id === user._id ? 'selected' : ''}>
                          <td className="user-name">{user.name || user.firstName}</td>
                          <td className="user-username">@{user.username}</td>
                          <td className="user-email">{user.email}</td>
                          <td className="user-date">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="user-actions">
                            <button 
                              onClick={() => handleViewRegistrations(user)}
                              className="btn-view"
                            >
                              📋 View Registrations
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="btn-delete"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* User Registrations */}
            {selectedUser && (
              <div className="registrations-section">
                <h2>Registrations for {selectedUser.name || selectedUser.firstName}</h2>
                {userRegistrations.length === 0 ? (
                  <p className="no-data">No registrations found for this student</p>
                ) : (
                  <div className="registrations-list">
                    {userRegistrations.map(reg => (
                      <div key={reg._id} className="registration-card">
                        <h4>{reg.eventId?.name || 'Event'}</h4>
                        <p><span>📅</span> {reg.eventId?.date ? new Date(reg.eventId.date).toLocaleDateString() : 'N/A'}</p>
                        <p><span>⏰</span> {reg.eventId?.time || 'N/A'}</p>
                        <p><span>📍</span> {reg.eventId?.location || 'N/A'}</p>
                        <p className="registered-at">
                          Registered: {new Date(reg.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

export default AdminUsers;
