import { useEffect, useMemo, useState } from "react";

function loadFromLocalStorage(storageKey, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(storageKey);
    return savedValue ? JSON.parse(savedValue) : fallbackValue;
  } catch (error) {
    console.warn(`Failed to load ${storageKey} from localStorage`, error);
    return fallbackValue;
  }
}

function saveToLocalStorage(storageKey, value) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save ${storageKey} to localStorage`, error);
  }
}

export function useEntityCollection(storageKey, initialEntities = []) {
  const [entities, setEntities] = useState(() =>
    loadFromLocalStorage(storageKey, initialEntities),
  );

  const [editingEntityId, setEditingEntityId] = useState(null);

  useEffect(() => {
    saveToLocalStorage(storageKey, entities);
  }, [storageKey, entities]);

  const editingEntity = useMemo(() => {
    if (!editingEntityId) {
      return null;
    }

    return entities.find((entity) => entity.id === editingEntityId) ?? null;
  }, [entities, editingEntityId]);

  function startNewEntity() {
    setEditingEntityId(null);
  }

  function startEditEntity(entityId) {
    setEditingEntityId(entityId);
  }

  function clearEditingEntity() {
    setEditingEntityId(null);
  }

  function saveEntity(entity) {
    setEntities((previousEntities) => {
      const entityExists = previousEntities.some(
        (existingEntity) => existingEntity.id === entity.id,
      );

      if (entityExists) {
        return previousEntities.map((existingEntity) =>
          existingEntity.id === entity.id ? entity : existingEntity,
        );
      }

      return [...previousEntities, entity];
    });

    setEditingEntityId(null);
  }

  function deleteEntity(entityId) {
    setEntities((previousEntities) =>
      previousEntities.filter((entity) => entity.id !== entityId),
    );

    setEditingEntityId((currentEditingEntityId) =>
      currentEditingEntityId === entityId ? null : currentEditingEntityId,
    );
  }

  return {
    entities,
    editingEntityId,
    editingEntity,

    startNewEntity,
    startEditEntity,
    clearEditingEntity,

    saveEntity,
    deleteEntity,
  };
}
