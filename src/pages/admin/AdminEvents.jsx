import { useState, useEffect } from 'react';
import { eventsAPI } from '../../services/api';
import '../../styles/admin/AdminEvents.css';

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
    capacity: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getAllEvents();
      setEvents(response.data);
    } catch (err) {
      setError('Failed to load events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.time || !formData.location || !formData.capacity) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setError('');
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('date', formData.date);
      payload.append('time', formData.time);
      payload.append('location', formData.location);
      payload.append('description', formData.description);
      payload.append('capacity', formData.capacity);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingId) {
        const response = await eventsAPI.updateEvent(editingId, payload);
        const updatedEvent = response.data || { ...events.find(e => e._id === editingId), ...formData, image: imagePreview };
        setEvents(events.map(e => e._id === editingId ? updatedEvent : e));
        setEditingId(null);
      } else {
        const response = await eventsAPI.createEvent(payload);
        setEvents([response.data, ...events]);
      }

      setFormData({
        name: '',
        date: '',
        time: '',
        location: '',
        description: '',
        capacity: '',
      });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setFormData({
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description || '',
      capacity: event.capacity,
    });
    setImageFile(null);
    setImagePreview(event.image || null);
    setEditingId(event._id);
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventsAPI.deleteEvent(eventId);
        setEvents(events.filter(e => e._id !== eventId));
      } catch (err) {
        setError('Failed to delete event');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      date: '',
      time: '',
      location: '',
      description: '',
      capacity: '',
    });
    setImageFile(null);
    setImagePreview(null);
  };

  if (loading) {
    return <div className="admin-events-container"><p>Loading Events...</p></div>;
  }

  return (
    <div className="admin-events-container">
      <div className="admin-header">
        <h1>📅 Manage Events</h1>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="add-btn"
        >
          {showForm ? '❌ Cancel' : '✅ Add Event'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Event Form */}
      {showForm && (
        <div className="event-form-container">
          <h2>{editingId ? 'Edit Event' : 'Create New Event'}</h2>
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label>Event Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Annual Tech Conference"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time *</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Main Auditorium"
                required
              />
            </div>

            <div className="form-group">
              <label>Capacity *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Event details..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Event Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Event preview" />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingId ? 'Update Event' : 'Create Event'}
              </button>
              <button type="button" onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="events-list">
        <h2>Events ({events.length})</h2>
        {events.length === 0 ? (
          <p className="no-data">No events found. Create one to get started!</p>
        ) : (
          <div className="events-grid">
            {events.map((event, index) => (
              <div key={event._id || index} className="event-card-admin">
                <div className="event-header">
                  <h3>{event.name}</h3>
                  <div className="event-meta">
                    <span className="capacity-badge">{event.registrations?.length || 0} / {event.capacity}</span>
                  </div>
                </div>

                <div className="event-details">
                  <p><span>📅</span> {new Date(event.date).toLocaleDateString()}</p>
                  <p><span>⏰</span> {event.time}</p>
                  <p><span>📍</span> {event.location}</p>
                  {event.description && <p className="description">{event.description}</p>}
                </div>

                <div className="event-actions">
                  <button 
                    onClick={() => handleEdit(event)} 
                    className="btn-edit"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(event._id)} 
                    className="btn-delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminEvents;
