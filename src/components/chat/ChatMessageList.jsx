import ChatMessage from "./ChatMessage";

export default function ChatMessageList({
  messages,
  onDeleteMessage,
  onUpdateMessage,
  onExtendMessage,
  onRegenerateMessage,
  onCancelResponse,
}) {
  if (messages.length === 0) {
    return (
      <div className="chat-empty-state">
        <h2>No messages yet</h2>
        <p>Send a message to start the chat.</p>
      </div>
    );
  }

  return (
    <div className="chat-message-list">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onDelete={onDeleteMessage}
          onUpdateMessage={onUpdateMessage}
          onExtendMessage={onExtendMessage}
          onRegenerateMessage={onRegenerateMessage}
          onCancelResponse={onCancelResponse}
        />
      ))}
    </div>
  );
}
