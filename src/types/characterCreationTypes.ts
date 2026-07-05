export type OptionId = string;

export type Option = {
  id: OptionId;
  displayText: string;
  imageUrl?: string;
  altText?: string;
  descriptionText?: string;
};

export type OptionGroup = {
  id: string;
  title: string;
  options: Option[];

  minSelectable: number;
  maxSelectable: number | null;

  allowCustomOptions?: boolean;
  customOptionsPlaceholder?: string;

  allowAdditionalDetails?: boolean;
  additionalDetailsPlaceholder?: string;
};

export type CreationStep = {
  id: string;
  title: string;
  optionGroups: OptionGroup[];

  showBackButton?: boolean;
  nextButtonText?: string;
};

export type CharacterDraft = {
  name: string;
  age: number;
  selectedOptionIdsByGroup: Record<string, string[]>;
  customTextByGroup: Record<string, string>;
  loreEntries: string[];
};