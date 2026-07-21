import { useState, useRef } from "react";

export default function ChatInput({ onSendMessage, disabled = false }) {
  const [content, setContent] = useState("");
  const textareaRef = useRef(null);

  function submitMessage() {
    const trimmedContent = content.trim();

    if (!trimmedContent || disabled) {
      return;
    }

    onSendMessage(trimmedContent);
    setContent("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    submitMessage();
  }

  function handleKeyDown(event) {
    // Ctrl+Enter or Cmd+Enter to send
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      submitMessage();
      return;
    }
    
    // Plain Enter creates new line
    if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
      // Allow default behavior (new line)
      return;
    }

    // Markdown shortcuts
    handleMarkdownShortcuts(event);
  }

  function handleMarkdownShortcuts(event) {
    if (!event.ctrlKey && !event.metaKey) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let newContent = content;
    let newCursorPos = start;

    switch (event.key) {
      case 'b': // Bold
        event.preventDefault();
        if (selectedText) {
          newContent = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
          newCursorPos = start + 2 + selectedText.length + 2;
        } else {
          newContent = content.substring(0, start) + "****" + content.substring(end);
          newCursorPos = start + 2;
        }
        break;
        
      case 'i': // Italic
        event.preventDefault();
        if (selectedText) {
          newContent = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
          newCursorPos = start + 1 + selectedText.length + 1;
        } else {
          newContent = content.substring(0, start) + "**" + content.substring(end);
          newCursorPos = start + 1;
        }
        break;

      case 'u': // Underline (using HTML)
        event.preventDefault();
        if (selectedText) {
          newContent = content.substring(0, start) + `<u>${selectedText}</u>` + content.substring(end);
          newCursorPos = start + 3 + selectedText.length + 4;
        } else {
          newContent = content.substring(0, start) + "<u></u>" + content.substring(end);
          newCursorPos = start + 3;
        }
        break;

      default:
        return;
    }

    setContent(newContent);
    
    // Set cursor position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <div className="chat-input-container">
        <textarea
          ref={textareaRef}
          value={content}
          placeholder="Type your message..."
          disabled={disabled}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={3}
        />
        
        <div className="chat-input-actions">
          <button
            type="submit"
            className="primary-button"
            disabled={disabled || !content.trim()}
          >
            Send
          </button>
        </div>
      </div>
      
      <div className="chat-input-help">
        <span>Ctrl+Enter to send • Ctrl+B for bold • Ctrl+I for italic • Ctrl+U for underline</span>
      </div>
    </form>
  );
}
