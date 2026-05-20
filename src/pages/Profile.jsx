// pages/Profile.jsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registrationAPI, authAPI } from '../services/api';
import '../styles/Profile.css';

function Profile() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [stats, setStats] = useState({ total: 0, upcoming: 0, attended: 0 });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const imageUrl = preview
    || (user?.profileImage ? `http://localhost:5000${user.profileImage}` : null);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await registrationAPI.getMyRegistrations();
        const regs = res.data;
        const now = new Date();
        const upcoming = regs.filter(r => r.eventId?.date && new Date(r.eventId.date) > now).length;
        const attended = regs.filter(r => r.eventId?.date && new Date(r.eventId.date) <= now).length;
        setStats({ total: regs.length, upcoming, attended });
      } catch (err) { console.error(err); }
    };
    load();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('name', name);
      if (imageFile) formData.append('profileImage', imageFile);

      const res = await authAPI.updateProfile(formData);
      const updatedUser = res.data.user;

      // Update AuthContext + localStorage with new user data
      login(updatedUser, localStorage.getItem('token'));

      setEditing(false);
      setImageFile(null);
      setPreview(null);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setName(user?.name || '');
    setImageFile(null);
    setPreview(null);
  };

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Banner */}
        <div className="profile-banner">
          <div className="profile-avatar" onClick={() => editing && fileRef.current.click()}>
            {imageUrl
              ? <img src={imageUrl} alt="Profile" />
              : <span>{initials}</span>
            }
            {editing && (
              <div className="avatar-overlay">
                <span>📷</span>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
        </div>

        {/* Header */}
        <div className="profile-header">
          {editing ? (
            <input
              className="name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          ) : (
            <div>
              <h2>{user?.name}</h2>
              <p className="profile-sub">Student</p>
            </div>
          )}
          <span className={`role-pill ${user?.role}`}>{user?.role}</span>
        </div>

        {message && <p className="profile-message">{message}</p>}

        <div className="divider" />

        {/* Info */}
        <div className="profile-info">
          <div className="info-row">
            <span className="info-icon">✉️</span>
            <div>
              <p className="info-label">Email</p>
              <p className="info-value">{user?.email}</p>
            </div>
          </div>
          <div className="info-row">
            <span className="info-icon">📅</span>
            <div>
              <p className="info-label">Member since</p>
              <p className="info-value">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* Stats */}
        <div className="profile-stats">
          <div className="stat-box">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Registered</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{stats.upcoming}</span>
            <span className="stat-label">Upcoming</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{stats.attended}</span>
            <span className="stat-label">Attended</span>
          </div>
        </div>

        {/* Actions */}
        <div className="profile-actions">
          {editing ? (
            <>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : '✓ Save Changes'}
              </button>
              <button className="btn-outline" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button className="btn-outline" onClick={() => navigate('/my-registrations')}>
                🎟 My Registrations
              </button>
              <button className="btn-edit" onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
              <button className="btn-logout" onClick={() => { logout(); navigate('/login'); }}>
                Logout
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;