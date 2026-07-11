import BasePage from "./BasePage";
import { useAppData } from "../../state/AppDataContext";

export default function ChatViewPage({ onChangePage }) {
  const { chats, characters, userPersonas } = useAppData();

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

  const selectedCharacters = characters.entities.filter((character) =>
    chat.characterIds?.includes(character.id),
  );

  const selectedUserPersona = userPersonas.entities.find(
    (persona) => persona.id === chat.userPersonaId,
  );

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

          <button
            type="button"
            className="primary-button"
            onClick={editChatSettings}
          >
            Edit Settings
          </button>
        </aside>

        <main className="chat-view-main">
          <div className="chat-placeholder">
            <h2>Chat view placeholder</h2>
            <p>
              This is where messages, AI replies, and chat controls will go
              later.
            </p>
          </div>

          {chat.scenario && (
            <section className="chat-view-section">
              <h2>Scenario</h2>
              <p>{chat.scenario}</p>
            </section>
          )}

          {chat.greeting && (
            <section className="chat-view-section">
              <h2>Opening Greeting</h2>
              <p>{chat.greeting}</p>
            </section>
          )}
        </main>
      </section>
    </BasePage>
  );
}
