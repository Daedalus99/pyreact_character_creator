import BasePage from "./BasePage";
import CardGrid from "../panels/CardGrid";
import EntityCard from "../cards/EntityCard";
import { useAppData } from "../../state/AppDataContext";
import { useEntityDeleteConfirmation } from "../../hooks/useEntityDeleteConfirmation";

export default function ChatsPage({ onChangePage }) {
  const { chats } = useAppData();

  const requestDeleteChat = useEntityDeleteConfirmation({
    entityTypeLabel: "chat",
    collection: chats,
  });

  function startNewChat() {
    chats.startNewEntity();
    onChangePage("chat-settings");
  }

  function startEditChat(chatId) {
    chats.startEditEntity(chatId);
    onChangePage("chat-settings");
  }

  function openChat(chatId) {
    chats.openEntity(chatId);
    onChangePage("chat-view");
  }

  return (
    <BasePage
      title="Chats"
      description="Create, open, and manage your roleplay chats."
    >
      <CardGrid>
        <EntityCard
          isNew
          label="New Chat"
          subtitle="Create a new chat"
          onClick={startNewChat}
        />

        {chats.entities.map((chat) => (
          <EntityCard
            key={chat.id}
            label={chat.label}
            subtitle={chat.subtitle}
            onClick={() => openChat(chat.id)}
            onEdit={() => startEditChat(chat.id)}
            onDelete={() => requestDeleteChat(chat)}
          />
        ))}
      </CardGrid>
    </BasePage>
  );
}
