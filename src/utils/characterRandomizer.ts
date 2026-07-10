import type {
  CharacterDraft,
  CreationStep,
  OptionGroup,
} from "../types/characterCreationTypes";

import {
  getOptionValue,
  getResolvedSelectionRules,
  getResolvedOptionGroup,
} from "./characterCreationRules";

const RANDOM_UNLIMITED_MAX = 4;

function randomIntInclusive(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffleArray<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function getRandomSelectionCount(
  group: OptionGroup,
  optionCount: number,
): number {
  const { minSelectable, maxSelectable, isOptional } =
    getResolvedSelectionRules(group);

  if (optionCount <= 0) {
    return 0;
  }

  if (isOptional && Math.random() < 0.5) {
    return 0;
  }

  const lowerBound = isOptional ? 1 : minSelectable;

  const effectiveMax =
    maxSelectable === Infinity
      ? Math.min(RANDOM_UNLIMITED_MAX, optionCount)
      : Math.min(maxSelectable, optionCount);

  if (effectiveMax < lowerBound) {
    return effectiveMax;
  }

  return randomIntInclusive(lowerBound, effectiveMax);
}

function randomizeGroupSelection(group: OptionGroup): string | string[] | null {
  const { isMulti } = getResolvedSelectionRules(group);
  const options = Array.isArray(group.options) ? group.options : [];

  const selectionCount = getRandomSelectionCount(group, options.length);

  if (selectionCount <= 0) {
    return isMulti ? [] : null;
  }

  const shuffledOptions = shuffleArray(options);
  const chosenIds = shuffledOptions
    .slice(0, selectionCount)
    .map((option, index) => getOptionValue(option, index));

  return isMulti ? chosenIds : (chosenIds[0] ?? null);
}

export function createRandomCharacterDraft(
  characterCreationSteps: CreationStep[] = [],
): CharacterDraft {
  const draft: CharacterDraft = {
    name: `Random Character ${randomIntInclusive(100, 999)}`,
    age: randomIntInclusive(18, 100),
    selectedOptionIdsByGroup: {},
    customTextByGroup: {},
    loreEntries: [],
  };

  characterCreationSteps.forEach((step) => {
    step.optionGroups?.forEach((baseGroup) => {
      const group = getResolvedOptionGroup(baseGroup, draft);

      if (!group.visible) {
        return;
      }

      draft.selectedOptionIdsByGroup[group.id] = randomizeGroupSelection(group);
    });
  });

  return draft;
}
