// pages/EventDetail.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, registrationAPI } from '../services/api';
import '../styles/EventDetail.css';

function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const loadEventDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getEventById(id);
      setEvent(response.data);

      // Check if user is registered (Only if logged in)
      if (localStorage.getItem('token')) {
        try {
          const registrations = await registrationAPI.getMyRegistrations();
          const registered = registrations.data.some(reg => reg.eventId._id === id || reg.eventId === id);
          setIsRegistered(registered);
        } catch (regErr) {
          console.error("Error checking registration status", regErr);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load event details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    loadEventDetails();
  }, [loadEventDetails]);

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await registrationAPI.registerEvent(id);
      setIsRegistered(true);
      setToast({ type: 'success', message: '✓ Successfully registered for event!' });
      loadEventDetails();
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setToast({ type: 'error', message: msg });
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return (
    <div className="event-detail-container">
      <div className="loader"></div>
    </div>
  );

  if (error) return (
    <div className="event-detail-container">
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Events</button>
      <div className="error-message">{error}</div>
    </div>
  );

  if (!event) return (
    <div className="event-detail-container">
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Events</button>
      <div className="error-message">Event not found</div>
    </div>
  );

  const registeredCount = event.registeredCount || event.registrations?.length || 0;
  const isFull = registeredCount >= event.capacity;
  const spotsLeft = event.capacity - registeredCount;
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="event-detail-container">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="toast-close">×</button>
        </div>
      )}

      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

      <div className="event-detail">
        {event.image && (
          <div className="event-image-wrapper">
            <img 
              src={event.image.startsWith('http') ? event.image : `http://localhost:5000${event.image}`} 
              alt={event.name} 
              className="event-image" 
            />
          </div>
        )}

        <div className="event-content">
          <h1>{event.name}</h1>

          <div className="event-meta">
            <div className="meta-item">
              <span className="meta-icon">📅</span>
              <div className="meta-text">
                <span className="meta-label">Date</span>
                <span className="meta-value">{eventDate.toLocaleDateString('en-US', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</span>
              </div>
            </div>

            <div className="meta-item">
              <span className="meta-icon">🕐</span>
              <div className="meta-text">
                <span className="meta-label">Time</span>
                <span className="meta-value">{event.time}</span>
              </div>
            </div>

            <div className="meta-item">
              <span className="meta-icon">📍</span>
              <div className="meta-text">
                <span className="meta-label">Location</span>
                <span className="meta-value">{event.location}</span>
              </div>
            </div>
          </div>

          <div className="description">
            <h3>About This Event</h3>
            <p>{event.description}</p>
          </div>

          <div className="capacity-section">
            <div className="capacity-bar">
              <div className="capacity-fill" style={{width: `${Math.min(100, (registeredCount / event.capacity) * 100)}%`}}></div>
            </div>
            <div className="capacity-info">
              <span>{registeredCount} of {event.capacity} registered</span>
              {!isFull && <span className="spots-left">{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left</span>}
              {isFull && <span className="full-badge">Event Full</span>}
            </div>
          </div>

          <div className="registration-status">
            {isRegistered ? (
              <div className="registered-badge">
                <span>✓</span> You are registered for this event
              </div>
            ) : isFull ? (
              <div className="full-badge-large">Event is full</div>
            ) : !isUpcoming ? (
              <div className="past-badge">This event has passed</div>
            ) : (
              <button
                className="register-btn"
                onClick={handleRegister}
                disabled={registering}
              >
                {registering ? 'Registering...' : 'Register Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
