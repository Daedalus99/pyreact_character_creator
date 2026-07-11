import { useState } from "react";

function ChatActionButton({ label, iconUrl, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className="chat-message-action-button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
    >
      <img src={iconUrl} alt="" draggable={false} />
    </button>
  );
}

export default function ChatMessage({
  message,
  onDelete,
  onUpdateMessage,
  onExtendMessage,
  onRegenerateMessage,
  onCancelResponse,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(message.content);

  const isUser = message.role === "user";
  const isGenerating = message.status === "generating";
  const isError = message.status === "error";

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (error) {
      console.warn("Failed to copy message.", error);
    }
  }

  function startEditing() {
    setEditDraft(message.content);
    setIsEditing(true);
  }

  function saveChanges() {
    const trimmedDraft = editDraft.trim();

    if (!trimmedDraft) {
      return;
    }

    onUpdateMessage?.(message.id, trimmedDraft);
    setIsEditing(false);
  }

  function cancelEditing() {
    setEditDraft(message.content);
    setIsEditing(false);
  }

  return (
    <article
      className={[
        "chat-message",
        isUser ? "user" : "assistant",
        isEditing ? "editing" : "",
        isGenerating ? "generating" : "",
        isError ? "error" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="chat-message-header">
        <strong>
          {message.speakerLabel ?? (isUser ? "You" : "Assistant")}
        </strong>
      </header>

      {isEditing ? (
        <textarea
          className="chat-message-edit-textarea"
          value={editDraft}
          onChange={(event) => setEditDraft(event.target.value)}
        />
      ) : (
        <p>{message.content}</p>
      )}

      <div className="chat-message-actions">
        {isGenerating ? (
          <ChatActionButton
            label="Cancel Response"
            iconUrl="/icons/chat_icon_pause.svg"
            onClick={() => onCancelResponse?.(message.id)}
          />
        ) : isEditing ? (
          <>
            <ChatActionButton
              label="Save Changes"
              iconUrl="/icons/chat_icon_save.svg"
              onClick={saveChanges}
              disabled={!editDraft.trim()}
            />

            <ChatActionButton
              label="Cancel Changes"
              iconUrl="/icons/chat_icon_cancel.svg"
              onClick={cancelEditing}
            />
          </>
        ) : (
          <>
            <ChatActionButton
              label="Edit Message"
              iconUrl="/icons/chat_icon_edit.svg"
              onClick={startEditing}
            />

            <ChatActionButton
              label="Delete Message"
              iconUrl="/icons/chat_icon_delete.svg"
              onClick={() => onDelete(message.id)}
            />

            <ChatActionButton
              label="Copy Message"
              iconUrl="/icons/chat_icon_copy.svg"
              onClick={copyMessage}
            />

            <ChatActionButton
              label="Extend Message"
              iconUrl="/icons/chat_icon_extend.svg"
              onClick={() => onExtendMessage?.(message)}
            />

            {!isUser && (
              <ChatActionButton
                label="Regenerate Message"
                iconUrl="/icons/chat_icon_regenerate.svg"
                onClick={() => onRegenerateMessage?.(message)}
              />
            )}
          </>
        )}
      </div>
    </article>
  );
}
