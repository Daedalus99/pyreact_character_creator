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
  const [activeEntityId, setActiveEntityId] = useState(null);

  useEffect(() => {
    saveToLocalStorage(storageKey, entities);
  }, [storageKey, entities]);

  const editingEntity = useMemo(() => {
    if (!editingEntityId) {
      return null;
    }

    return entities.find((entity) => entity.id === editingEntityId) ?? null;
  }, [entities, editingEntityId]);

  const activeEntity =
    entities.find((entity) => entity.id === activeEntityId) ?? null;

  function openEntity(entityId) {
    setActiveEntityId(entityId);
  }

  function clearActiveEntity() {
    setActiveEntityId(null);
  }

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
    saveEntity,
    deleteEntity,
    openEntity,

    clearActiveEntity,
  };
}
