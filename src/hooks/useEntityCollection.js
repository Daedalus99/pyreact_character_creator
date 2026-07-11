import { useEffect, useMemo, useState } from "react";
import { loadCollection, saveCollection } from "../storage/entityStorage";

export function useEntityCollection(collectionName, fallbackEntities = []) {
  const [entities, setEntities] = useState(() =>
    loadCollection(collectionName, fallbackEntities),
  );

  const [editingEntityId, setEditingEntityId] = useState(null);
  const [activeEntityId, setActiveEntityId] = useState(null);

  const editingEntity = useMemo(
    () => entities.find((entity) => entity.id === editingEntityId) ?? null,
    [entities, editingEntityId],
  );

  const activeEntity = useMemo(
    () => entities.find((entity) => entity.id === activeEntityId) ?? null,
    [entities, activeEntityId],
  );

  useEffect(() => {
    saveCollection(collectionName, entities);
  }, [collectionName, entities]);

  function startNewEntity() {
    setEditingEntityId(null);
  }

  function startEditEntity(entityId) {
    setEditingEntityId(entityId);
  }

  function clearEditingEntity() {
    setEditingEntityId(null);
  }

  function openEntity(entityId) {
    setActiveEntityId(entityId);
  }

  function clearActiveEntity() {
    setActiveEntityId(null);
  }

  function saveEntity(entityToSave) {
    setEntities((currentEntities) => {
      const existingEntity = currentEntities.find(
        (entity) => entity.id === entityToSave.id,
      );

      if (!existingEntity) {
        return [...currentEntities, entityToSave];
      }

      return currentEntities.map((entity) =>
        entity.id === entityToSave.id ? entityToSave : entity,
      );
    });

    setEditingEntityId(null);
  }

  function deleteEntity(entityId) {
    setEntities((currentEntities) =>
      currentEntities.filter((entity) => entity.id !== entityId),
    );

    if (editingEntityId === entityId) {
      setEditingEntityId(null);
    }

    if (activeEntityId === entityId) {
      setActiveEntityId(null);
    }
  }

  return {
    entities,

    editingEntityId,
    editingEntity,

    activeEntityId,
    activeEntity,

    startNewEntity,
    startEditEntity,

    clearEditingEntity,
    openEntity,
    clearActiveEntity,
    saveEntity,

    deleteEntity,
  };
}
