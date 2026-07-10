// ConfirmDialog is a reusable modal for delete, cancel, or destructive actions.
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="confirm-dialog-backdrop" role="presentation">
      <div
        className={`confirm-dialog ${variant === "danger" ? "danger" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{message}</p>

        <div className="confirm-dialog-actions">
          <button type="button" onClick={onCancel}>
            {cancelLabel}
          </button>

          <button
            type="button"
            className={
              variant === "danger" ? "danger-button" : "primary-button"
            }
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
