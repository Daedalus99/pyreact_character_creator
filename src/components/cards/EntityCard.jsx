import IconButton from "../cards/IconButton";

const iconUrlNew = "/icons/icon_add.svg";
const iconUrlDflt = "/icons/icon_image.svg";

export default function EntityCard({
  isNew,
  label,
  subtitle,
  onClick,
  onOpen,
  onEdit,
  onDelete,
}) {
  const thumbnailIconUrl = isNew ? iconUrlNew : iconUrlDflt;

  return (
    <article className={`entity-card ${isNew ? "new-card" : ""}`}>
      <button
        type="button"
        className="entity-card-main"
        onClick={onClick}
        aria-label={isNew ? "Add new item" : `Open ${label}`}
      >
        <div className="card-thumbnail">
          <img className="card-thumbnail-icon" src={thumbnailIconUrl} alt="" />
        </div>

        <div className="card-details">
          <strong>{label}</strong>
          {subtitle && <small>{subtitle}</small>}
        </div>
      </button>

      {!isNew && (
        <div className="card-actions">
          <IconButton
            iconUrl="/icons/chat_icon_edit.svg"
            ariaLabel={`Edit ${label}`}
            onClick={onEdit}
          />
          <IconButton
            iconUrl="/icons/chat_icon_delete.svg"
            ariaLabel={`Delete ${label}`}
            onClick={onDelete}
          />
        </div>
      )}
    </article>
  );
}
