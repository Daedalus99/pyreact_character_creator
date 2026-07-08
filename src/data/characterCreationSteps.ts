import { allOptionGroups } from "./characterCreationOptionGroups";
import type { CreationStep } from "../types/characterCreationTypes";

export const creationStepBasic: CreationStep = {
  id: "basic-info",
    title: "Basic Info",
    showBackButton: true,
    nextButtonText: "Next",
    optionGroups: [ 
      allOptionGroups.genderOptionGroup,
      allOptionGroups.artstyleOptionGroup
    ]
};

export const creationStepFace: CreationStep = {
  id: "face",
  title: "Face",
  showBackButton: true,
  nextButtonText: "Next",
  optionGroups: [
    allOptionGroups.raceOptionGroup,
    allOptionGroups.eyesOptionGroup
  ]
};

export const creationStepHair: CreationStep = {
  id: "hair",
  title: "Hair",
  showBackButton: true,
  nextButtonText: "Next",
  optionGroups: [
    allOptionGroups.hairColorOptionGroup,
    allOptionGroups.hairstyleOptionGroup
  ]
};

export const creationStepPhysique: CreationStep = {
  id: "physique",
  title: "Physique",
  showBackButton: true,
  nextButtonText: "Next",
  optionGroups: [
    allOptionGroups.bodyTypeOptionGroup,
    allOptionGroups.breastSizeOptionGroup,
    allOptionGroups.cockSizeOptionGroup,
    allOptionGroups.buttSizeOptionGroup
  ]
};

export const creationStepTraits: CreationStep = {
  id: "traits",
  title: "Traits",
  showBackButton: true,
  nextButtonText: "Next",
  optionGroups: [
    allOptionGroups.personalityOptionGroup,
    allOptionGroups.relationshipOptionGroup,
  ]
};

export const creationStepLifestyle: CreationStep = {
  id: "lifestyle",
  title: "Lifestyle",
  showBackButton: true,
  nextButtonText: "Next",
  optionGroups: [
    allOptionGroups.occupationOptionGroup,
    allOptionGroups.hobbiesOptionGroup,
    allOptionGroups.kinksOptionGroup
  ]
};

export const creationStepAttire: CreationStep = {
  id: "attire",
  title: "Attire",
  showBackButton: true,
  nextButtonText: "Next",
  optionGroups: [
    allOptionGroups.outfitOptionGroup,
    allOptionGroups.featuresOptionGroup,
  ]
};

export const creationStepLore: CreationStep = {
  id: "lore",
  title: "Lore",
  showBackButton: true,
  nextButtonText: "Next",
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