import { useState } from "react";

export default function ChatInput({ onSendMessage, disabled = false }) {
  const [content, setContent] = useState("");

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
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  return (
    <form className="chat-input-form" onSubmit={handleSubmit}>
      <textarea
        value={content}
        placeholder="Type your message..."
        disabled={disabled}
        onChange={(event) => setContent(event.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        type="submit"
        className="primary-button"
        disabled={disabled || !content.trim()}
      >
        Send
      </button>
    </form>
  );
}
