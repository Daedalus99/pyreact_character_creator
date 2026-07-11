const STORAGE_PREFIX = "pyreact-character-creator";

function getCollectionStorageKey(collectionName) {
  return `${STORAGE_PREFIX}:${collectionName}`;
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function canUseElectronStorage() {
  return typeof window !== "undefined" && Boolean(window.appStorage);
}

function loadLocalCollection(collectionName, fallbackEntities = []) {
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

function saveLocalCollection(collectionName, entities) {
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

function clearLocalCollection(collectionName) {
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

export async function loadCollection(collectionName, fallbackEntities = []) {
  if (!canUseElectronStorage()) {
    return loadLocalCollection(collectionName, fallbackEntities);
  }

  try {
    const electronEntities =
      await window.appStorage.loadCollection(collectionName);

    if (Array.isArray(electronEntities) && electronEntities.length > 0) {
      return electronEntities;
    }

    // One-time migration path from the old localStorage prototype storage.
    // After a successful migration, remove the localStorage copy so deleted
    // Electron collections do not get resurrected later.
    const localEntities = loadLocalCollection(collectionName, []);

    if (localEntities.length > 0) {
      await window.appStorage.saveCollection(collectionName, localEntities);
      clearLocalCollection(collectionName);

      return localEntities;
    }

    return Array.isArray(electronEntities)
      ? electronEntities
      : fallbackEntities;
  } catch (error) {
    console.warn(
      `Failed to load collection "${collectionName}" from Electron storage. Falling back to localStorage.`,
      error,
    );

    return loadLocalCollection(collectionName, fallbackEntities);
  }
}

export async function saveCollection(collectionName, entities) {
  if (!canUseElectronStorage()) {
    saveLocalCollection(collectionName, entities);
    return;
  }

  try {
    await window.appStorage.saveCollection(collectionName, entities);
  } catch (error) {
    console.warn(
      `Failed to save collection "${collectionName}" to Electron storage. Falling back to localStorage.`,
      error,
    );

    saveLocalCollection(collectionName, entities);
  }
}

export async function clearCollection(collectionName) {
  if (!canUseElectronStorage()) {
    clearLocalCollection(collectionName);
    return;
  }

  try {
    await window.appStorage.clearCollection(collectionName);
    clearLocalCollection(collectionName);
  } catch (error) {
    console.warn(
      `Failed to clear collection "${collectionName}" from Electron storage.`,
      error,
    );
  }
}
