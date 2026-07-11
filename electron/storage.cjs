const fs = require("node:fs/promises");
const path = require("node:path");
const { app } = require("electron");

const ALLOWED_COLLECTIONS = new Set(["characters", "userPersonas", "chats"]);

function assertValidCollectionName(collectionName) {
  if (!ALLOWED_COLLECTIONS.has(collectionName)) {
    throw new Error(`Invalid collection name: ${collectionName}`);
  }
}

function getCollectionsDirectory() {
  return path.join(app.getPath("userData"), "rp-app-data", "collections");
}

function getCollectionFilePath(collectionName) {
  assertValidCollectionName(collectionName);

  return path.join(getCollectionsDirectory(), `${collectionName}.json`);
}

async function ensureCollectionsDirectory() {
  await fs.mkdir(getCollectionsDirectory(), { recursive: true });
}

async function loadCollection(collectionName) {
  const filePath = getCollectionFilePath(collectionName);

  try {
    const rawValue = await fs.readFile(filePath, "utf8");
    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      console.warn(
        `Collection "${collectionName}" did not contain an array. Returning empty collection.`,
      );

      return [];
    }

    return parsedValue;
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    console.warn(`Failed to load collection "${collectionName}".`, error);

    return [];
  }
}

async function saveCollection(collectionName, entities) {
  if (!Array.isArray(entities)) {
    throw new Error(
      `Cannot save collection "${collectionName}": expected an array.`,
    );
  }

  await ensureCollectionsDirectory();

  const filePath = getCollectionFilePath(collectionName);
  const temporaryFilePath = `${filePath}.tmp`;
  const serializedValue = `${JSON.stringify(entities, null, 2)}\n`;

  await fs.writeFile(temporaryFilePath, serializedValue, "utf8");
  await fs.rename(temporaryFilePath, filePath);

  return true;
}

async function clearCollection(collectionName) {
  const filePath = getCollectionFilePath(collectionName);

  try {
    await fs.rm(filePath, { force: true });
  } catch (error) {
    console.warn(`Failed to clear collection "${collectionName}".`, error);
  }

  return true;
}

function getStorageInfo() {
  return {
    collectionsDirectory: getCollectionsDirectory(),
  };
}

module.exports = {
  loadCollection,
  saveCollection,
  clearCollection,
  getStorageInfo,
};
