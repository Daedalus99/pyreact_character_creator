import { useEffect, useState } from "react";
import { useAppData } from "../../state/AppDataContext";

const blankChatDraft = {
  title: "",
  characterIds: [],
  userPersonaId: "",
  scenario: "",
  greeting: "",
};

function cloneDraft(draft) {
  return JSON.parse(JSON.stringify(draft));
}

function getDraftSignature(draft) {
  return JSON.stringify(draft);
}

function getChatDraftFromEntity(chat) {
  if (chat?.draft) {
    return {
      ...blankChatDraft,
      ...chat.draft,
      characterIds: chat.draft.characterIds ?? [],
      userPersonaId: chat.draft.userPersonaId ?? "",
    };
  }

  return cloneDraft(blankChatDraft);
}

function getCharacterSubtitle(characterCount) {
  if (characterCount === 1) {
    return "1 character";
  }

  return `${characterCount} characters`;
}

export default function ChatSettingsForm({
  onChangePage,
  setNavigationBlocker,
}) {
  const { chats, characters, userPersonas } = useAppData();

  const editingChat = chats.editingEntity;
  const isEditingChat = Boolean(editingChat);

  const [initialDraft, setInitialDraft] = useState(() =>
    getChatDraftFromEntity(editingChat),
  );

  const [draft, setDraft] = useState(() => getChatDraftFromEntity(editingChat));

  const hasUnsavedChanges =
    getDraftSignature(draft) !== getDraftSignature(initialDraft);

  useEffect(() => {
    const nextDraft = getChatDraftFromEntity(editingChat);

    setInitialDraft(nextDraft);
    setDraft(nextDraft);
  }, [editingChat?.id]);

  useEffect(() => {
    setNavigationBlocker?.({
      shouldBlock: () => hasUnsavedChanges,
      message: "You have unsaved chat settings. Leave without saving?",
    });

    return () => {
      setNavigationBlocker?.(null);
    };
  }, [setNavigationBlocker, hasUnsavedChanges]);

  function updateDraftField(field, value) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  function toggleCharacter(characterId) {
    setDraft((currentDraft) => {
      const currentCharacterIds = currentDraft.characterIds ?? [];
      const isSelected = currentCharacterIds.includes(characterId);

      return {
        ...currentDraft,
        characterIds: isSelected
          ? currentCharacterIds.filter((id) => id !== characterId)
          : [...currentCharacterIds, characterId],
      };
    });
  }

  function saveChat() {
    const title = draft.title.trim() || "Untitled Chat";

    const selectedCharacters = characters.entities.filter((character) =>
      draft.characterIds.includes(character.id),
    );

    const selectedUserPersona = userPersonas.entities.find(
      (persona) => persona.id === draft.userPersonaId,
    );

    const subtitleParts = [];

    if (selectedCharacters.length > 0) {
      subtitleParts.push(getCharacterSubtitle(selectedCharacters.length));
    }

    if (selectedUserPersona) {
      subtitleParts.push(`as ${selectedUserPersona.label}`);
    }

    const sanitizedDraft = {
      ...draft,
      title,
      characterIds: draft.characterIds ?? [],
      userPersonaId: draft.userPersonaId || null,
      scenario: draft.scenario.trim(),
      greeting: draft.greeting.trim(),
    };

    const chat = {
      id: editingChat?.id ?? crypto.randomUUID(),
      label: title,
      subtitle: subtitleParts.join(" · ") || "Chat settings",
      title,
      characterIds: sanitizedDraft.characterIds,
      userPersonaId: sanitizedDraft.userPersonaId,
      scenario: sanitizedDraft.scenario,
      greeting: sanitizedDraft.greeting,
      draft: sanitizedDraft,
      createdAt: editingChat?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    chats.saveEntity(chat);
    onChangePage("chats", { force: true });
  }

  function cancelChatSettings() {
    onChangePage("chats");
  }

  return (
    <section className="form-page">
      <header className="form-page-header">
        <h1>{isEditingChat ? "Edit Chat" : "Create Chat"}</h1>
        <p>Configure the chat title, participants, and starter setup.</p>
      </header>

      <div className="form-section">
        <label className="form-field">
          <span>Chat title</span>
          <input
            type="text"
            value={draft.title}
            placeholder="New Chat"
            onChange={(event) => updateDraftField("title", event.target.value)}
          />
        </label>
      </div>

      <div className="form-section">
        <h2>User Persona</h2>

        <label className="form-field">
          <span>Roleplay as</span>
          <select
            value={draft.userPersonaId ?? ""}
            onChange={(event) =>
              updateDraftField("userPersonaId", event.target.value)
            }
          >
            <option value="">No user persona selected</option>

            {userPersonas.entities.map((persona) => (
              <option key={persona.id} value={persona.id}>
                {persona.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-section">
        <h2>Characters</h2>

        {characters.entities.length === 0 ? (
          <p className="muted-text">
            No characters yet. Create a character before adding one to this
            chat.
          </p>
        ) : (
          <div className="checkbox-list">
            {characters.entities.map((character) => (
              <label key={character.id} className="checkbox-list-item">
                <input
                  type="checkbox"
                  checked={draft.characterIds.includes(character.id)}
                  onChange={() => toggleCharacter(character.id)}
                />

                <span>{character.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="form-section">
        <label className="form-field">
          <span>Scenario</span>
          <textarea
            value={draft.scenario}
            placeholder="Optional setup for the chat."
            onChange={(event) =>
              updateDraftField("scenario", event.target.value)
            }
          />
        </label>

        <label className="form-field">
          <span>Opening greeting</span>
          <textarea
            value={draft.greeting}
            placeholder="Optional first message or greeting."
            onChange={(event) =>
              updateDraftField("greeting", event.target.value)
            }
          />
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={cancelChatSettings}>
          Cancel
        </button>

        <button type="button" className="primary-button" onClick={saveChat}>
          {isEditingChat ? "Save Changes" : "Create Chat"}
        </button>
      </div>
    </section>
  );
}
