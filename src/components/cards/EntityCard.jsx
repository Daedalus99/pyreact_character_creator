import IconButton from '../cards/IconButton';

const iconUrlNew = '/icons/icon_add.svg';
const iconUrlDflt = '/icons/icon_image.svg';

// EntityCard represents a reusable card in the grid for chats, characters, or image targets.
export default function EntityCard({ isNew, label, subtitle }) {
  const thumbnailIconUrl = isNew ? iconUrlNew : iconUrlDflt;
  return (
    <article className={`entity-card ${isNew ? 'new-card' : ''}`}>
      <div className="card-thumbnail">
        <img
          className="card-thumbnail-icon"
          src={thumbnailIconUrl}
          alt={isNew ? 'Add new item' : ''}
        />

        {!isNew && (
          <div className="card-actions">
            <IconButton iconUrl="/icons/chat_icon_edit.svg" />
            <IconButton iconUrl="/icons/chat_icon_delete.svg" />
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