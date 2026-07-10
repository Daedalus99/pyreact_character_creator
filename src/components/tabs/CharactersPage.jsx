// CharactersPage shows the character collection and new character action.
import BasePage from "./BasePage";
import CardGrid from "../panels/CardGrid";
import EntityCard from "../cards/EntityCard";

export default function CharactersPage({ characters = [], onChangePage }) {
  return (
    <BasePage
      title="Characters"
      description="Create and edit character personas for roleplay."
    >
      <CardGrid>
        <EntityCard
          isNew
          label="New Character"
          onOpen={() => onChangePage("character-wizard")}
          onEdit={() => onChangePage("character-wizard")}
        />

        {characters.map((character) => (
          <EntityCard
            key={character.id}
            label={character.label}
            subtitle={character.subtitle}
            onOpen={() => onChangePage("character-wizard")}
            onEdit={() => onChangePage("character-wizard")}
          />
        ))}
      </CardGrid>
    </BasePage>
  );
}
