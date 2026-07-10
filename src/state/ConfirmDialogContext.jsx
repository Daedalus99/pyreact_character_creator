import { createContext, useContext, useState } from "react";
import ConfirmDialog from "../components/modals/ConfirmDialog";

const ConfirmDialogContext = createContext(null);

export function ConfirmDialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  function confirm(options) {
    return new Promise((resolve) => {
      setDialog({
        ...options,
        resolve,
      });
    });
  }

  function closeDialog(result) {
    dialog?.resolve?.(result);
    setDialog(null);
  }

  function handleConfirm() {
    dialog?.onConfirm?.();
    closeDialog(true);
  }

  function handleCancel() {
    dialog?.onCancel?.();
    closeDialog(false);
  }

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}

      <ConfirmDialog
        open={Boolean(dialog)}
        title={dialog?.title ?? "Are you sure?"}
        message={dialog?.message ?? ""}
        confirmLabel={dialog?.confirmLabel ?? "Confirm"}
        cancelLabel={dialog?.cancelLabel ?? "Cancel"}
        variant={dialog?.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog() {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error(
      "useConfirmDialog must be used inside ConfirmDialogProvider",
    );
  }

  return context;
}
