import { useConfirmDialog } from "../state/ConfirmDialogContext";

export function useEntityDeleteConfirmation({ entityTypeLabel, collection }) {
  const confirm = useConfirmDialog();

  return function requestDeleteEntity(entity) {
    const entityLabel = entity.label ?? entity.title ?? "Untitled";

    confirm({
      title: `Delete ${entityTypeLabel}?`,
      message: `Delete "${entityLabel}"? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
      onConfirm: () => {
        collection.deleteEntity(entity.id);
      },
    });
  };
}
