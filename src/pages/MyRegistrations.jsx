import { useState, useEffect } from 'react';
import { registrationAPI } from '../services/api';
import '../styles/MyRegistrations.css';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadRegistrations(); }, []);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const res = await registrationAPI.getMyRegistrations();
      setRegistrations(res.data);
    } catch (err) {
      setError('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId) => {
    if (!window.confirm('Are you sure you want to unregister?')) return;
    try {
      await registrationAPI.cancelRegistration(registrationId);
      alert('Unregistered successfully!');
      loadRegistrations();
    } catch (err) {
      alert('Failed to unregister');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="my-registrations-container">
      <h1>My Registrations</h1>

      {error && <p className="error">{error}</p>}

      {registrations.length === 0 ? (
        <p>You haven't registered for any events yet.</p>
      ) : (
        <div className="registrations-list">
          {registrations.map(reg => {
            const event = reg.eventId; // ✅ now a full object thanks to populate()
            return (
              <div key={reg._id} className="registration-card">
                <h3>{event?.name ?? 'Event not found'}</h3>
                <p>📅 {event?.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</p>
                <p>📍 {event?.location ?? 'N/A'}</p>
                <p>Status: <strong>{reg.status}</strong></p>
                <button onClick={() => handleCancel(reg._id)} className="cancel-btn">
                  Unregister
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyRegistrations;