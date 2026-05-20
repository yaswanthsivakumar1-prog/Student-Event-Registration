// pages/MyRegistrations.jsx
import { useState, useEffect } from 'react';
import { registrationAPI } from '../services/api';
import '../styles/MyRegistrations.css';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => { loadRegistrations(); }, []);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await registrationAPI.getMyRegistrations();
      setRegistrations(res.data);
    } catch (err) {
      console.error('Error loading registrations:', err?.response || err);
      setError(err.response?.data?.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    setCancellingId(id);
    try {
      await registrationAPI.cancelRegistration(id);
      setToast({ type: 'success', message: '✓ Successfully unregistered!' });
      loadRegistrations();
    } catch (err) {
      console.error('Unregister failed:', err?.response || err);
      const msg = err?.response?.data?.message || 'Failed to unregister';
      setToast({ type: 'error', message: msg });
    } finally {
      setCancellingId(null);
    }
  };

  const isUpcoming = (date) => date && new Date(date) > new Date();

  const getDaysLabel = (date) => {
    if (!date) return '';
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff > 0) return `Upcoming — in ${diff} day${diff !== 1 ? 's' : ''}`;
    return 'Event has passed';
  };

  if (loading) return (
    <div className="reg-page">
      <div className="reg-container">
        <div className="loader"></div>
      </div>
    </div>
  );

  return (
    <div className="reg-page">
      <div className="reg-container">

        {/* Toast Notification */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="toast-close">×</button>
          </div>
        )}

        {/* Header */}
        <div className="reg-header">
          <div>
            <h1>My Registrations</h1>
            <p>{registrations.length} event{registrations.length !== 1 ? 's' : ''} registered</p>
          </div>
          <span className="reg-count">{registrations.length}</span>
        </div>

        {error && <div className="reg-error-banner">{error}</div>}

        {registrations.length === 0 ? (
          <div className="reg-empty">
            <div className="empty-icon">🎟</div>
            <p>You haven't registered for any events yet.</p>
          </div>
        ) : (
          <div className="reg-list">
            {registrations.map(reg => {
              const event = reg.eventId;
              const upcoming = isUpcoming(event?.date);
              return (
                <div key={reg._id} className={`reg-card ${!upcoming ? 'past' : ''}`}>
                  <div className={`reg-card-bar ${upcoming ? 'blue' : 'gray'}`} />
                  <div className="reg-card-body">

                    <div className="reg-card-top">
                      <div className="reg-info">
                        <h3>{event?.name ?? 'Event'}</h3>
                        <div className="reg-meta">
                          <span className="meta-item">📅 {event?.date ? new Date(event.date).toLocaleDateString('en-US', {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'}) : 'N/A'}</span>
                          <span className="meta-item">🕐 {event?.time ?? 'N/A'}</span>
                          <span className="meta-item">📍 {event?.location ?? 'N/A'}</span>
                        </div>
                      </div>
                      <span className={`reg-status ${upcoming ? 'registered' : 'attended'}`}>
                        {upcoming ? '✓ Registered' : 'Attended'}
                      </span>
                    </div>

                    <div className="reg-divider" />

                    <div className="reg-card-bottom">
                      <span className="reg-days">{getDaysLabel(event?.date)}</span>
                      {upcoming && (
                        <button 
                          className="btn-unregister" 
                          onClick={() => handleCancel(reg._id)}
                          disabled={cancellingId === reg._id}
                        >
                          {cancellingId === reg._id ? 'Cancelling...' : '✕ Unregister'}
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRegistrations;