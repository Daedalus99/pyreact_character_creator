import { allOptionGroups } from "./characterCreationOptionGroups";
import type {
  CreationStep,
  CharacterDraft,
} from "../types/characterCreationTypes";

export const blankDraft: CharacterDraft = {
  name: "",
  age: 30,
  selectedOptionIdsByGroup: {},
  customTextByGroup: {},
  loreEntries: [],
};

export const creationStepBasic: CreationStep = {
  id: "basic-info",
  title: "Basic Info",
  optionGroups: [
    allOptionGroups.genderOptionGroup,
    allOptionGroups.artstyleOptionGroup,
  ],
};

export const creationStepFace: CreationStep = {
  id: "face",
  title: "Face",
  optionGroups: [
    allOptionGroups.raceOptionGroup,
    allOptionGroups.eyesOptionGroup,
  ],
};

export const creationStepHair: CreationStep = {
  id: "hair",
  title: "Hair",
  optionGroups: [
    allOptionGroups.hairColorOptionGroup,
    allOptionGroups.hairstyleOptionGroup,
  ],
};

export const creationStepPhysique: CreationStep = {
  id: "physique",
  title: "Physique",
  optionGroups: [
    allOptionGroups.bodyTypeOptionGroup,
    allOptionGroups.breastSizeOptionGroup,
    allOptionGroups.cockSizeOptionGroup,
    allOptionGroups.buttSizeOptionGroup,
  ],
};

export const creationStepTraits: CreationStep = {
  id: "traits",
  title: "Traits",
  optionGroups: [
    allOptionGroups.personalityOptionGroup,
    allOptionGroups.relationshipOptionGroup,
  ],
};

export const creationStepLifestyle: CreationStep = {
  id: "lifestyle",
  title: "Lifestyle",
  optionGroups: [
    allOptionGroups.occupationOptionGroup,
    allOptionGroups.hobbiesOptionGroup,
    allOptionGroups.kinksOptionGroup,
  ],
};

export const creationStepAttire: CreationStep = {
  id: "attire",
  title: "Attire",
  optionGroups: [
    allOptionGroups.outfitOptionGroup,
    allOptionGroups.featuresOptionGroup,
  ],
};

export const creationStepLore: CreationStep = {
  id: "lore",
  title: "Lore",
  optionGroups: [],
};

export const characterCreationSteps: CreationStep[] = [
  creationStepBasic,
  creationStepFace,
  creationStepHair,
  creationStepPhysique,
  creationStepTraits,
  creationStepLifestyle,
  creationStepAttire,
  creationStepLore,
];
