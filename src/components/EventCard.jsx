// components/EventCard.jsx
function EventCard({ event, onClick }) {
  return (
    <div className="event-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="event-image">
        {event.image ? (
          <img src={event.image} alt={event.name} />
        ) : (
          <div className="image-placeholder">Event Image</div>
        )}
      </div>
      <div className="event-info">
        <h3>{event.name}</h3>
        <p className="date">📅 {new Date(event.date).toLocaleDateString()}</p>
        <p className="location">📍 {event.location}</p>
        <p className="description">{event.description?.substring(0, 100)}...</p>
        <p className="slots">
          Registered: {event.registeredCount} / {event.capacity}
        </p>
      </div>
    </div>
  );
}

export default EventCard;
