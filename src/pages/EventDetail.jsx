// pages/EventDetail.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, registrationAPI } from '../services/api';
import '../styles/EventDetail.css';

function EventDetail() {
  const { id } = useParams(); // Get event ID from URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
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
          const registered = registrations.data.some(reg => reg.eventId === id);
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

  useEffect(() => {
    loadEventDetails();
  }, [loadEventDetails]);

  const handleRegister = async () => {
    try {
      setRegistering(true);
      await registrationAPI.registerEvent(id);
      setIsRegistered(true);
      alert('Successfully registered for event!');
      loadEventDetails(); // Refresh event data
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (error) return <div className="container"><p>{error}</p></div>;
  if (!event) return <div className="container"><p>Event not found</p></div>;

  const isFull = event.registeredCount >= event.capacity;

  return (
    <div className="event-detail-container">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back to Events
      </button>

      <div className="event-detail">
        {event.image && <img src={event.image} alt={event.name} />}

        <h1>{event.name}</h1>

        <div className="event-meta">
          <p>📅 <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
          <p>⏰ <strong>Time:</strong> {event.time}</p>
          <p>📍 <strong>Location:</strong> {event.location}</p>
        </div>

        <div className="description">
          <h3>Description</h3>
          <p>{event.description}</p>
        </div>

        <div className="capacity-info">
          <p>
            Registered: <strong>{event.registeredCount}</strong> /{' '}
            <strong>{event.capacity}</strong>
          </p>
          {isFull && <p style={{ color: 'red' }}>Event is full</p>}
        </div>

        {isRegistered ? (
          <p style={{ color: 'green', fontSize: '18px' }}>
            ✓ You are already registered
          </p>
        ) : (
          <button
            className="register-btn"
            onClick={handleRegister}
            disabled={registering || isFull}
          >
            {registering ? 'Registering...' : 'Register'}
          </button>
        )}
      </div>
    </div>
  );
}

export default EventDetail;
