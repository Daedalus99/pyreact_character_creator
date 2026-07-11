import BasePage from "./BasePage";
import { useAppData } from "../../state/AppDataContext";
import { useConfirmDialog } from "../../state/ConfirmDialogContext";
import ChatInput from "../chat/ChatInput";
import ChatMessageList from "../chat/ChatMessageList";

function createChatMessage({
  role,
  content,
  speakerId = null,
  speakerType = null,
  speakerLabel = null,
}) {
  return {
    id: crypto.randomUUID(),
    role,
    speakerId,
    speakerType,
    speakerLabel,
    content,
    status: "complete",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function ChatViewPage({ onChangePage }) {
  const { chats, characters, userPersonas } = useAppData();
  const confirm = useConfirmDialog();

  const chat = chats.activeEntity;

  if (!chat) {
    return (
      <BasePage
        title="No Chat Selected"
        description="Choose a chat from the Chats page."
      >
        <button type="button" onClick={() => onChangePage("chats")}>
          Back to Chats
        </button>
      </BasePage>
    );
  }

  const messages = chat.messages ?? [];

  const selectedCharacters = characters.entities.filter((character) =>
    chat.characterIds?.includes(character.id),
  );

  const selectedUserPersona = userPersonas.entities.find(
    (persona) => persona.id === chat.userPersonaId,
  );

  function saveChatMessages(nextMessages) {
    chats.saveEntity({
      ...chat,
      messages: nextMessages,
      updatedAt: new Date().toISOString(),
    });
  }

  function sendUserMessage(content) {
    const message = createChatMessage({
      role: "user",
      content,
      speakerId: selectedUserPersona?.id ?? null,
      speakerType: selectedUserPersona ? "userPersona" : "user",
      speakerLabel: selectedUserPersona?.label ?? "You",
    });

    saveChatMessages([...messages, message]);
  }

  function seedOpeningGreeting() {
    if (!chat.greeting) {
      return;
    }

    const firstCharacter = selectedCharacters[0];

    const greetingMessage = createChatMessage({
      role: "assistant",
      content: chat.greeting,
      speakerId: firstCharacter?.id ?? null,
      speakerType: firstCharacter ? "character" : "assistant",
      speakerLabel: firstCharacter?.label ?? "Assistant",
    });

    saveChatMessages([greetingMessage, ...messages]);
  }

  function deleteMessage(messageId) {
    saveChatMessages(messages.filter((message) => message.id !== messageId));
  }

  async function clearMessages() {
    const shouldClear = await confirm({
      title: "Clear chat messages?",
      message: "This will delete every message in this chat.",
      confirmLabel: "Clear Messages",
      cancelLabel: "Cancel",
      variant: "danger",
    });

    if (!shouldClear) {
      return;
    }

    saveChatMessages([]);
  }

  function editChatSettings() {
    chats.startEditEntity(chat.id);
    onChangePage("chat-settings", { returnPage: "chat-view" });
  }

  return (
    <BasePage title={chat.label} description={chat.subtitle || "Roleplay chat"}>
      <section className="chat-view-layout">
        <aside className="chat-view-sidebar">
          <div className="chat-view-section">
            <h2>User Persona</h2>
            <p>
              {selectedUserPersona
                ? selectedUserPersona.label
                : "No user persona selected"}
            </p>
          </div>

          <div className="chat-view-section">
            <h2>Characters</h2>

            {selectedCharacters.length > 0 ? (
              <ul>
                {selectedCharacters.map((character) => (
                  <li key={character.id}>{character.label}</li>
                ))}
              </ul>
            ) : (
              <p>No characters selected</p>
            )}
          </div>

          {chat.scenario && (
            <div className="chat-view-section">
              <h2>Scenario</h2>
              <p>{chat.scenario}</p>
            </div>
          )}

          <div className="chat-view-sidebar-actions">
            <button
              type="button"
              className="primary-button"
              onClick={editChatSettings}
            >
              Edit Settings
            </button>

            <button
              type="button"
              onClick={clearMessages}
              disabled={messages.length === 0}
            >
              Clear Messages
            </button>
          </div>
        </aside>

        <main className="chat-view-main">
          {chat.greeting && messages.length === 0 && (
            <section className="chat-greeting-panel">
              <h2>Opening Greeting</h2>
              <p>{chat.greeting}</p>

              <button type="button" onClick={seedOpeningGreeting}>
                Add Greeting to Chat
              </button>
            </section>
          )}

          <ChatMessageList
            messages={messages}
            onDeleteMessage={deleteMessage}
          />

          <ChatInput onSendMessage={sendUserMessage} />
        </main>
      </section>
    </BasePage>
  );
}
