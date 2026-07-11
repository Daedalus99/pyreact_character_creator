import { useAppData } from "../../state/AppDataContext";
import BasePersonasPage from "./BasePersonasPage";

export default function CharactersPage({ onChangePage }) {
  const { characters } = useAppData();

  return (
    <BasePersonasPage
      title="Characters"
      description="Create and manage AI-controlled roleplay characters."
      newEntityLabel="New Character"
      newEntitySubtitle="Create a new character"
      entityTypeLabel="character"
      collection={characters}
      wizardPage="character-persona-wizard"
      onChangePage={onChangePage}
    />
  );
}
