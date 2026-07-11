import { useAppData } from "../../state/AppDataContext";
import BasePersonasPage from "./BasePersonasPage";

export default function UserPage({ onChangePage }) {
  const { userPersonas } = useAppData();

  return (
    <BasePersonasPage
      title="User Personas"
      description="Create and manage the identities you roleplay as."
      newEntityLabel="New User Persona"
      newEntitySubtitle="Create a persona for yourself"
      entityTypeLabel="user persona"
      collection={userPersonas}
      wizardPage="user-persona-wizard"
      onChangePage={onChangePage}
    />
  );
}
