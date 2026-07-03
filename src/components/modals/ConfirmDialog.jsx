// ConfirmDialog is a reusable modal for delete, cancel, or destructive actions.
export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <dialog open className="confirm-dialog">
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="dialog-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="button" onClick={onConfirm}>Confirm</button>
      </div>
    </dialog>
  );
}
