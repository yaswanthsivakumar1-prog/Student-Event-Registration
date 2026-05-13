import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import '../styles/AdminUsers.css';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the "Add User" form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    try {
      const response = await authAPI.addUser(newName, newEmail, newPassword);
      setUsers([response.data, ...users]);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add user');
    }
  };

  if (loading) return <div className="admin-container"><p>Loading Users...</p></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="user-stats">
          Total Users: <strong>{users.length}</strong>
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="quick-add-form">
        <h3>Add New User</h3>
        <form onSubmit={handleAddUser}>
          <input 
            type="text" 
            placeholder="Name" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button type="submit">Add User</button>
        </form>
      </div>

      {error && <div className="mock-warning">{error}</div>}

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Password (Demo)</th>
              <th>Joined Date</th>
              <th>User ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td className="user-name">{user.name}</td>
                <td>{user.email}</td>
                <td><code className="password-mask">{user.password || '******'}</code></td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="user-id">#{user._id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;
