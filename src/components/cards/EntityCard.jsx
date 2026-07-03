import IconButton from '../cards/IconButton';

// EntityCard represents a reusable card in the grid for chats, characters, or image targets.
export default function EntityCard({ isNew, label, subtitle }) {
  return (
    <article className={`entity-card ${isNew ? 'new-card' : ''}`}>
      <div className="card-thumbnail">
        {isNew ? '+' : 'IMG'}

        {!isNew && (
          <div className="card-actions">
            <IconButton size="50%" iconUrl="/icons/chat_icon_edit.svg" />
            <IconButton size="50%" iconUrl="/icons/chat_icon_delete.svg" />
          </div>
        )}
      </div>

      <div className="card-details">
        <strong>{label}</strong>
        {subtitle && <small>{subtitle}</small>}
      </div>
    </article>
  );
}