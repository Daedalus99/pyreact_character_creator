import { useState } from "react";

// Simple markdown-to-HTML converter for basic formatting
function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

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

  function handleEditKeyDown(event) {
    // Ctrl+Enter to save
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      saveChanges();
      return;
    }

    // Escape to cancel
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
      return;
    }

    // Markdown shortcuts (similar to ChatInput)
    if (event.ctrlKey || event.metaKey) {
      const textarea = event.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = editDraft.substring(start, end);

      let newContent = editDraft;
      let newCursorPos = start;

      switch (event.key) {
        case 'b': // Bold
          event.preventDefault();
          if (selectedText) {
            newContent = editDraft.substring(0, start) + `**${selectedText}**` + editDraft.substring(end);
            newCursorPos = start + 2 + selectedText.length + 2;
          } else {
            newContent = editDraft.substring(0, start) + "****" + editDraft.substring(end);
            newCursorPos = start + 2;
          }
          break;
          
        case 'i': // Italic
          event.preventDefault();
          if (selectedText) {
            newContent = editDraft.substring(0, start) + `*${selectedText}*` + editDraft.substring(end);
            newCursorPos = start + 1 + selectedText.length + 1;
          } else {
            newContent = editDraft.substring(0, start) + "**" + editDraft.substring(end);
            newCursorPos = start + 1;
          }
          break;

        case 'u': // Underline
          event.preventDefault();
          if (selectedText) {
            newContent = editDraft.substring(0, start) + `<u>${selectedText}</u>` + editDraft.substring(end);
            newCursorPos = start + 3 + selectedText.length + 4;
          } else {
            newContent = editDraft.substring(0, start) + "<u></u>" + editDraft.substring(end);
            newCursorPos = start + 3;
          }
          break;

        default:
          return;
      }

      setEditDraft(newContent);
      
      // Set cursor position after state update
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
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
        <div className="chat-message-edit-container">
          <textarea
            className="chat-message-edit-textarea"
            value={editDraft}
            onChange={(event) => setEditDraft(event.target.value)}
            onKeyDown={handleEditKeyDown}
            placeholder="Edit your message..."
            rows={4}
          />
          <div className="edit-help">
            Ctrl+Enter to save • Esc to cancel • Ctrl+B/I/U for formatting
          </div>
        </div>
      ) : (
        <div 
          className="chat-message-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
        />
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
