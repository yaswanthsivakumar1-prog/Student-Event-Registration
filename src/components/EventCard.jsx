// components/EventCard.jsx
function EventCard({ event, onClick }) {
  // Calculate registered count - handle both formats
  const registeredCount = event.registeredCount || event.registrations?.length || 0;
  
  // Build full image URL if needed
  const imageUrl = event.image
    ? event.image.startsWith('http')
      ? event.image
      : `http://localhost:5000${event.image}`
    : null;
  
  return (
    <div className="event-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="event-image">
        {imageUrl ? (
          <img src={imageUrl} alt={event.name} />
        ) : (
          <div className="image-placeholder">Event Image</div>
        )}
      </div>
      <div className="event-info">
        <h3>{event.name || event.title || 'Untitled Event'}</h3>
        <p className="date">
          📅 {event.date ? new Date(event.date).toLocaleDateString() : 'Date TBD'}
        </p>
        <p className="location">📍 {event.location || 'Location TBD'}</p>
        <p className="description">
          {event.description ? `${event.description.substring(0, 100)}...` : 'No description available.'}
        </p>
        <p className="slots">
          Registered: {registeredCount} / {event.capacity || 'N/A'}
        </p>
      </div>
    </div>
  );
}

export default EventCard;
