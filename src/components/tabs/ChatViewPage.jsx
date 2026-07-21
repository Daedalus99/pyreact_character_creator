import BasePage from "./BasePage";
import { useAppData } from "../../state/AppDataContext";
import { useConfirmDialog } from "../../state/ConfirmDialogContext";
import ChatInput from "../chat/ChatInput";
import ChatMessageList from "../chat/ChatMessageList";
import { useState } from "react";

function createChatMessage({
  role,
  content,
  speakerId = null,
  speakerType = null,
  speakerLabel = null,
  status = "complete",
}) {
  return {
    id: crypto.randomUUID(),
    role,
    speakerId,
    speakerType,
    speakerLabel,
    content,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function ChatViewPage({ onChangePage }) {
  const { chats, characters, userPersonas } = useAppData();
  const confirm = useConfirmDialog();
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [currentRequestController, setCurrentRequestController] = useState(null);

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

    const newMessages = [...messages, message];
    saveChatMessages(newMessages);
    
    // Automatically request assistant response after user message
    setTimeout(() => {
      requestAssistantResponseForMessages(newMessages);
    }, 100); // Small delay to ensure state is updated
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

  function updateMessage(messageId, content) {
    saveChatMessages(
      messages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              content,
              updatedAt: new Date().toISOString(),
            }
          : message,
      ),
    );
  }

  async function extendMessage(message) {
    if (isGeneratingResponse) {
      return;
    }

    // Determine which character should extend the message
    let extendingCharacter;
    if (message.role === "user") {
      // For user messages, use the selected user persona or default user
      extendingCharacter = {
        label: selectedUserPersona?.label || "You",
        summary: selectedUserPersona?.summary || "User"
      };
    } else {
      // For assistant messages, find the character or use the first one
      extendingCharacter = selectedCharacters.find(char => 
        char.id === message.speakerId || char.label === message.speakerLabel
      ) || selectedCharacters[0];
      
      if (!extendingCharacter) {
        console.warn("Cannot extend message without a character context.");
        return;
      }
    }

    // Create an abort controller for this extend request
    const controller = new AbortController();
    setCurrentRequestController(controller);

    // Create a temporary "extending" version of the message
    const extendingMessageState = {
      ...message,
      content: message.content + " [Extending...]",
      status: "generating",
      updatedAt: new Date().toISOString(),
    };

    // Update the message to show extending state
    const messageIndex = messages.findIndex(m => m.id === message.id);
    const updatedMessages = [...messages];
    updatedMessages[messageIndex] = extendingMessageState;
    saveChatMessages(updatedMessages);
    setIsGeneratingResponse(true);

    try {
      // Build context for extending
      const extendPrompt = {
        chat: {
          ...chat,
          scenario: `Continue the following message naturally and seamlessly. Add more content that flows from what was already said. Do not repeat the existing content, only add to it.`
        },
        messages: [
          {
            role: message.role,
            content: `CONTINUE THIS MESSAGE: "${message.content}"`,
            speakerLabel: message.speakerLabel
          }
        ],
        respondingCharacter: extendingCharacter,
        userPersona: selectedUserPersona ?? null,
        characters: selectedCharacters,
      };

      const response = await fetch("http://127.0.0.1:5000/api/chat/extend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(extendPrompt),
        signal: controller.signal, // Add abort signal
      });

      // Check if the request was cancelled before processing
      if (controller.signal.aborted) {
        return;
      }

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to extend message.");
      }

      // Check again after JSON parsing
      if (controller.signal.aborted) {
        return;
      }

      // Combine original content with extended content
      const extendedContent = message.content + " " + payload.content.trim();
      
      const extendedMessage = {
        ...message,
        content: extendedContent,
        status: "complete",
        updatedAt: new Date().toISOString(),
      };

      const finalMessages = [...messages];
      finalMessages[messageIndex] = extendedMessage;
      saveChatMessages(finalMessages);
    } catch (error) {
      // Don't show error if the request was cancelled
      if (error.name === 'AbortError' || controller.signal.aborted) {
        console.log("Extend request was cancelled by user");
        // Restore the original message
        const restoredMessages = [...messages];
        restoredMessages[messageIndex] = message;
        saveChatMessages(restoredMessages);
        return;
      }

      console.warn("Failed to extend message.", error);

      const errorMessage = {
        ...message,
        content: message.content + " [Extension failed]",
        status: "error",
        updatedAt: new Date().toISOString(),
      };

      const errorMessages = [...messages];
      errorMessages[messageIndex] = errorMessage;
      saveChatMessages(errorMessages);
    } finally {
      setIsGeneratingResponse(false);
      setCurrentRequestController(null);
    }
  }

  async function regenerateMessage(message) {
    if (isGeneratingResponse) {
      return;
    }

    const respondingCharacter = selectedCharacters[0];

    if (!respondingCharacter) {
      console.warn("Cannot regenerate response without a selected character.");
      return;
    }

    // Create a temporary "generating" version of the message
    const regeneratingMessage = {
      ...message,
      content: "Regenerating response...",
      status: "generating",
      updatedAt: new Date().toISOString(),
    };

    // Update the message list to show the regenerating state
    const messagesBeforeTarget = messages.slice(0, messages.findIndex(m => m.id === message.id));
    const messagesWithPlaceholder = [...messagesBeforeTarget, regeneratingMessage];

    saveChatMessages(messagesWithPlaceholder);
    setIsGeneratingResponse(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/chat/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat,
          messages: messagesBeforeTarget, // Use messages before the one being regenerated
          respondingCharacter,
          userPersona: selectedUserPersona ?? null,
          characters: selectedCharacters,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to regenerate response.");
      }

      const regeneratedMessage = {
        ...message,
        content: payload.content,
        status: "complete",
        updatedAt: new Date().toISOString(),
      };

      saveChatMessages([...messagesBeforeTarget, regeneratedMessage]);
    } catch (error) {
      console.warn("Failed to regenerate assistant response.", error);

      const failedMessage = {
        ...message,
        content: "Failed to regenerate response. Check that LM Studio is running and the backend can reach it.",
        status: "error",
        updatedAt: new Date().toISOString(),
      };

      saveChatMessages([...messagesBeforeTarget, failedMessage]);
    } finally {
      setIsGeneratingResponse(false);
    }
  }

  function cancelResponse(messageId) {
    // Abort the current request if it exists
    if (currentRequestController) {
      currentRequestController.abort();
      setCurrentRequestController(null);
    }

    // Find the generating message and remove it
    const filteredMessages = messages.filter(m => m.id !== messageId);
    saveChatMessages(filteredMessages);
    setIsGeneratingResponse(false);
  }

  async function requestAssistantResponseForMessages(sourceMessages) {
    if (isGeneratingResponse) {
      return;
    }

    const respondingCharacter = selectedCharacters[0];

    if (!respondingCharacter) {
      console.warn("Cannot generate response without a selected character.");
      return;
    }

    // Create an abort controller for this request
    const controller = new AbortController();
    setCurrentRequestController(controller);

    const generatingMessage = createChatMessage({
      role: "assistant",
      content: "Generating response...",
      speakerId: respondingCharacter.id,
      speakerType: "character",
      speakerLabel: respondingCharacter.label,
      status: "generating",
    });

    const messagesWithPlaceholder = [...sourceMessages, generatingMessage];

    saveChatMessages(messagesWithPlaceholder);
    setIsGeneratingResponse(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/chat/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat,
          messages: sourceMessages,
          respondingCharacter,
          userPersona: selectedUserPersona ?? null,
          characters: selectedCharacters,
        }),
        signal: controller.signal, // Add abort signal
      });

      // Check if the request was cancelled before processing the response
      if (controller.signal.aborted) {
        return; // Exit early if cancelled
      }

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to generate response.");
      }

      // Double-check that we weren't cancelled during the JSON parsing
      if (controller.signal.aborted) {
        return;
      }

      const completedMessage = {
        ...generatingMessage,
        content: payload.content,
        status: "complete",
        updatedAt: new Date().toISOString(),
      };

      saveChatMessages([...sourceMessages, completedMessage]);
    } catch (error) {
      // Don't show error if the request was cancelled
      if (error.name === 'AbortError' || controller.signal.aborted) {
        console.log("Request was cancelled by user");
        return;
      }

      console.warn("Failed to generate assistant response.", error);

      const failedMessage = {
        ...generatingMessage,
        content:
          "Failed to generate response. Check that LM Studio is running and the backend can reach it.",
        status: "error",
        updatedAt: new Date().toISOString(),
      };

      saveChatMessages([...sourceMessages, failedMessage]);
    } finally {
      setIsGeneratingResponse(false);
      setCurrentRequestController(null);
    }
  }

  async function requestAssistantResponse() {
    return requestAssistantResponseForMessages(messages);
  }

  const lastMessage = messages[messages.length - 1] ?? null;
  const canRequestAssistantResponse = lastMessage?.role === "user";

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
            onUpdateMessage={updateMessage}
            onExtendMessage={extendMessage}
            onRegenerateMessage={regenerateMessage}
            onCancelResponse={cancelResponse}
          />
          {canRequestAssistantResponse && (
            <div className="chat-response-request-row">
              <button
                type="button"
                className="chat-response-request-button primary-button"
                onClick={requestAssistantResponse}
                disabled={isGeneratingResponse}
              >
                {isGeneratingResponse ? "Generating..." : "Request Response"}
              </button>
            </div>
          )}
          <ChatInput
            onSendMessage={sendUserMessage}
            disabled={isGeneratingResponse}
          />
        </main>
      </section>
    </BasePage>
  );
}
