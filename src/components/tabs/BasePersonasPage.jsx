import BasePage from "./BasePage";
import CardGrid from "../panels/CardGrid";
import EntityCard from "../cards/EntityCard";
import { useEntityDeleteConfirmation } from "../../hooks/useEntityDeleteConfirmation";

export default function BasePersonasPage({
  title,
  description,
  newEntityLabel,
  newEntitySubtitle,
  entityTypeLabel,
  collection,
  wizardPage,
  onChangePage,
}) {
  const requestDeleteEntity = useEntityDeleteConfirmation({
    entityTypeLabel,
    collection,
  });

  function startNewEntity() {
    collection.startNewEntity();
    onChangePage(wizardPage);
  }

  function startEditEntity(entityId) {
    collection.startEditEntity(entityId);
    onChangePage(wizardPage);
  }

  return (
    <BasePage title={title} description={description}>
      <CardGrid>
        <EntityCard
          isNew
          label={newEntityLabel}
          subtitle={newEntitySubtitle}
          onClick={startNewEntity}
        />

        {collection.entities.map((entity) => (
          <EntityCard
            key={entity.id}
            label={entity.label}
            subtitle={entity.subtitle}
            onClick={() => startEditEntity(entity.id)}
            onEdit={() => startEditEntity(entity.id)}
            onDelete={() => requestDeleteEntity(entity)}
          />
        ))}
      </CardGrid>
    </BasePage>
  );
}
