// pages/Home.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { eventsAPI } from '../services/api';
import '../styles/Home.css';

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAllEvents();
      setEvents(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Search events
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      loadEvents();
      return;
    }

    try {
      setLoading(true);
      const response = await eventsAPI.searchEvents(searchQuery);
      setEvents(response.data);
    } catch (err) {
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <h1>Available Events</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events..."
        />
        <button type="submit">Search</button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="loading">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="no-events">No events found</p>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <EventCard
              key={event._id}
              event={event}
              onClick={() => navigate(`/event/${event._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
