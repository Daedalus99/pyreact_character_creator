const STORAGE_PREFIX = "pyreact-character-creator";

function getCollectionStorageKey(collectionName) {
  return `${STORAGE_PREFIX}:${collectionName}`;
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function loadCollection(collectionName, fallbackEntities = []) {
  if (!canUseLocalStorage()) {
    return fallbackEntities;
  }

  try {
    const storageKey = getCollectionStorageKey(collectionName);
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      return fallbackEntities;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      console.warn(
        `Stored collection "${collectionName}" was not an array. Falling back to defaults.`,
      );

      return fallbackEntities;
    }

    return parsedValue;
  } catch (error) {
    console.warn(
      `Failed to load collection "${collectionName}" from localStorage.`,
      error,
    );

    return fallbackEntities;
  }
}

export function saveCollection(collectionName, entities) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    const storageKey = getCollectionStorageKey(collectionName);
    window.localStorage.setItem(storageKey, JSON.stringify(entities));
  } catch (error) {
    console.warn(
      `Failed to save collection "${collectionName}" to localStorage.`,
      error,
    );
  }
}

export function clearCollection(collectionName) {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    const storageKey = getCollectionStorageKey(collectionName);
    window.localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn(
      `Failed to clear collection "${collectionName}" from localStorage.`,
      error,
    );
  }
}
