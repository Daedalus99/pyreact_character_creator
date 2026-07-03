// EntityCard represents a reusable card in the grid for chats, characters, or image targets.
export default function EntityCard({ isNew, label, subtitle }) {
  return (
    <article className={`entity-card ${isNew ? 'new-card' : ''}`}>
      <div className="card-thumbnail">{isNew ? '+' : 'IMG'}</div>
      <div className="card-details">
        <strong>{label}</strong>
        {subtitle && <small>{subtitle}</small>}
      </div>
      {!isNew && (
        <div className="card-actions">
          <button>Edit</button>
          <button>Delete</button>
        </div>
      )}
    </article>
  );
}
