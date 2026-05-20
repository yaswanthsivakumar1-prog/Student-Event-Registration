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

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAllEvents();
      const eventsData = response.data?.value || response.data || [];
      setEvents(eventsData);
      setError('');
    } catch (err) {
      setError('Failed to load events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      loadEvents();
      return;
    }

    try {
      setLoading(true);
      const response = await eventsAPI.searchEvents(searchQuery);
      const eventsData = response.data?.value || response.data || [];
      setEvents(eventsData);
      setError('');
    } catch (err) {
      setError('Search failed. Try another keyword.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    loadEvents();
  };

  return (
    <div className="home-container">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Discover Student Events</p>
          <h1>Find the next activity, workshop, or lecture on campus.</h1>
          <p className="hero-text">
            Browse upcoming events with beautiful cards, quick search, and fast registration.
          </p>
        </div>
      </section>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search events by name, location, or topic..."
        />
        <button type="submit" className="search-btn">Search</button>
        {searchQuery.trim() && (
          <button type="button" className="reset-btn" onClick={handleReset}>
            Clear
          </button>
        )}
      </form>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="loading">Loading events...</p>
      ) : (
        <>
          {events.length > 0 && (
            <div className="event-count">
              Showing {events.length} event{events.length === 1 ? '' : 's'}
              {searchQuery.trim() ? ` for "${searchQuery}"` : ''}
            </div>
          )}

          {events.length === 0 ? (
            <p className="no-events">No events found. Try a different search or create a new event.</p>
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
        </>
      )}
    </div>
  );
}

export default Home;
