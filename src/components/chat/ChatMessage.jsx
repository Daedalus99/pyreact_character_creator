export default function ChatMessage({ message, onDelete }) {
  const isUser = message.role === "user";

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (error) {
      console.warn("Failed to copy message.", error);
    }
  }

  return (
    <article className={`chat-message ${isUser ? "user" : "assistant"}`}>
      <header className="chat-message-header">
        <strong>
          {message.speakerLabel ?? (isUser ? "You" : "Assistant")}
        </strong>

        <div className="chat-message-actions">
          <button type="button" onClick={copyMessage}>
            Copy
          </button>

          <button type="button" onClick={() => onDelete(message.id)}>
            Delete
          </button>
        </div>
      </header>

      <p>{message.content}</p>
    </article>
  );
}
