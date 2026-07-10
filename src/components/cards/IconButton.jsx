// IconButton is the reusable action icon button.
export default function IconButton({
  label,
  ariaLabel,
  title,
  iconUrl,
  active,
  onClick,
  showLabel = false,
}) {
  const accessibleLabel = ariaLabel ?? label ?? "Icon button";

  return (
    <button
      type="button"
      className={`icon-button ${active ? "active" : ""}`}
      onClick={onClick}
      aria-label={accessibleLabel}
      title={title ?? accessibleLabel}
    >
      {iconUrl ? (
        <img className="icon" src={iconUrl} alt="" draggable={false} />
      ) : (
        <span aria-hidden="true">{label?.[0] ?? "?"}</span>
      )}

      {showLabel && label && <span className="icon-label">{label}</span>}
    </button>
  );
}
