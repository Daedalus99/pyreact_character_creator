import BasePage from "./BasePage";
import EntityCard from "../cards/EntityCard";
import { useAppData } from "../../state/AppDataContext";
import { useEntityDeleteConfirmation } from "../../hooks/useEntityDeleteConfirmation";

export default function CharactersPage({ onChangePage }) {
  const { characters } = useAppData();

  const requestDeleteCharacter = useEntityDeleteConfirmation({
    entityTypeLabel: "character",
    collection: characters,
  });

  function startNewCharacter() {
    characters.startNewEntity();
    onChangePage("character-wizard");
  }

  function startEditCharacter(characterId) {
    characters.startEditEntity(characterId);
    onChangePage("character-wizard");
  }

  return (
    <BasePage
      title="Characters"
      description="Create and manage roleplay characters."
    >
      <div className="card-grid">
        <EntityCard
          isNew
          label="New Character"
          subtitle="Create a new character"
          onClick={startNewCharacter}
        />

        {characters.entities.map((character) => (
          <EntityCard
            key={character.id}
            label={character.label}
            subtitle={character.subtitle}
            onClick={() => startEditCharacter(character.id)}
            onEdit={() => startEditCharacter(character.id)}
            onDelete={() => requestDeleteCharacter(character)}
          />
        ))}
      </div>
    </BasePage>
  );
}
