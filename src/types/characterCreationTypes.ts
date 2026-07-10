export type OptionId = string;

export type Option = {
  id: OptionId;
  displayText: string;
  imageUrl?: string;
  altText?: string;
  descriptionText?: string;
};

export type OptionRef = {
  id: string;
};

export type OptionGroupRef = {
  id: string;
};

export type ConditionalOverride = {
  when: {
    group: OptionGroupRef;
    options: OptionRef[];
    match?: "any" | "all";
  };

  visible?: boolean;

  minSelectable?: number;
  maxSelectable?: number | null;

  addOptions?: Option[];
  replaceOptions?: Option[];
};

export type OptionGroup = {
  id: string;
  title: string;
  options: Option[];

  minSelectable: number;
  maxSelectable: number | null;

  conditionalOverrides?: ConditionalOverride[];

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
  selectedOptionIdsByGroup: Record<string, string | string[] | null>;
  customTextByGroup: Record<string, string>;
  loreEntries: string[];
};
