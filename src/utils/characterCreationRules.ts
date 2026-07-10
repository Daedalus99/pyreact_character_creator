import type {
  CharacterDraft,
  Option,
  OptionGroup,
  CreationStep,
} from "../types/characterCreationTypes";

export type ResolvedSelectionRules = {
  minSelectable: number;
  maxSelectable: number;
  isMulti: boolean;
  isOptional: boolean;
};

export type SelectedOptionValue = string | string[] | null | undefined;

export type ResolvedOptionGroup = OptionGroup & {
  visible: boolean;
};

function getSelectedValuesForGroup(
  draft: CharacterDraft,
  groupId: string,
): string[] {
  const selected = draft.selectedOptionIdsByGroup[groupId];

  if (Array.isArray(selected)) {
    return selected;
  }

  return selected ? [selected] : [];
}

function overrideMatchesDraft(
  override: NonNullable<OptionGroup["conditionalOverrides"]>[number],
  draft: CharacterDraft,
): boolean {
  const controllingGroupId = override.when.group.id;
  const requiredOptionIds = override.when.options.map((option) => option.id);
  const selectedValues = getSelectedValuesForGroup(draft, controllingGroupId);

  const matchMode = override.when.match ?? "any";

  if (matchMode === "all") {
    return requiredOptionIds.every((optionId) =>
      selectedValues.includes(optionId),
    );
  }

  return requiredOptionIds.some((optionId) =>
    selectedValues.includes(optionId),
  );
}

function mergeOptions(
  baseOptions: Option[],
  optionsToAdd: Option[] = [],
): Option[] {
  const seenOptionIds = new Set<string>();
  const mergedOptions: Option[] = [];

  [...baseOptions, ...optionsToAdd].forEach((option) => {
    if (seenOptionIds.has(option.id)) {
      return;
    }

    seenOptionIds.add(option.id);
    mergedOptions.push(option);
  });

  return mergedOptions;
}

export function getResolvedOptionGroup(
  group: OptionGroup,
  draft: CharacterDraft,
): ResolvedOptionGroup {
  let resolvedGroup: ResolvedOptionGroup = {
    ...group,
    options: [...group.options],
    visible: true,
  };

  group.conditionalOverrides?.forEach((override) => {
    if (!overrideMatchesDraft(override, draft)) {
      return;
    }

    if (typeof override.visible === "boolean") {
      resolvedGroup.visible = override.visible;
    }

    if (typeof override.minSelectable === "number") {
      resolvedGroup.minSelectable = override.minSelectable;
    }

    if (
      typeof override.maxSelectable === "number" ||
      override.maxSelectable === null
    ) {
      resolvedGroup.maxSelectable = override.maxSelectable;
    }

    if (override.replaceOptions) {
      resolvedGroup.options = [...override.replaceOptions];
    }

    if (override.addOptions) {
      resolvedGroup.options = mergeOptions(
        resolvedGroup.options,
        override.addOptions,
      );
    }
  });

  return resolvedGroup;
}

export function getVisibleOptionGroups(
  groups: OptionGroup[],
  draft: CharacterDraft,
): ResolvedOptionGroup[] {
  return groups
    .map((group) => getResolvedOptionGroup(group, draft))
    .filter((group) => group.visible);
}

export function getResolvedSelectionRules(
  group: Partial<OptionGroup> = {},
): ResolvedSelectionRules {
  const hasExplicitMaxSelectable = Object.prototype.hasOwnProperty.call(
    group,
    "maxSelectable",
  );

  const minSelectable =
    typeof group.minSelectable === "number" ? group.minSelectable : 0;

  const maxSelectable = hasExplicitMaxSelectable
    ? group.maxSelectable === null
      ? Infinity
      : typeof group.maxSelectable === "number"
        ? group.maxSelectable
        : 1
    : 1;

  return {
    minSelectable,
    maxSelectable,
    isMulti: maxSelectable !== 1,
    isOptional: minSelectable < 1,
  };
}

export function normalizeSelectedValue(
  selected: SelectedOptionValue,
  isMulti: boolean,
): string[] | string | null {
  if (isMulti) {
    if (Array.isArray(selected)) {
      return selected;
    }

    return selected ? [selected] : [];
  }

  return typeof selected === "string" ? selected : null;
}

export function getSelectedCount(
  selected: SelectedOptionValue,
  isMulti: boolean,
): number {
  const normalizedSelected = normalizeSelectedValue(selected, isMulti);

  if (isMulti) {
    return Array.isArray(normalizedSelected) ? normalizedSelected.length : 0;
  }

  return normalizedSelected ? 1 : 0;
}

export function isGroupSelectionValid(
  group: Partial<OptionGroup>,
  selected: SelectedOptionValue,
): boolean {
  const rules = getResolvedSelectionRules(group);
  const selectedCount = getSelectedCount(selected, rules.isMulti);

  return (
    selectedCount >= rules.minSelectable && selectedCount <= rules.maxSelectable
  );
}

export function getSelectionRuleText(group: Partial<OptionGroup>): string {
  const { minSelectable, maxSelectable } = getResolvedSelectionRules(group);

  if (minSelectable === maxSelectable) {
    return `Select ${minSelectable}`;
  }

  if (maxSelectable === Infinity) {
    return `Select ${minSelectable}+`;
  }

  return `Select ${minSelectable}-${maxSelectable}`;
}

export function getGroupValidityText(
  group: Partial<OptionGroup>,
  selected: SelectedOptionValue,
): string {
  const rules = getResolvedSelectionRules(group);
  const selectedCount = getSelectedCount(selected, rules.isMulti);

  if (
    selectedCount >= rules.minSelectable &&
    selectedCount <= rules.maxSelectable
  ) {
    return "valid";
  }

  if (selectedCount < rules.minSelectable) {
    return `${rules.minSelectable - selectedCount} more required`;
  }

  return `${selectedCount - rules.maxSelectable} too many`;
}

export function getOptionValue(
  option: { id?: string; value?: string; label?: string },
  index: number,
): string {
  return option.id ?? option.value ?? option.label ?? String(index);
}

export function sanitizeDraftSelections(
  draft: CharacterDraft,
  characterCreationSteps: CreationStep[],
): CharacterDraft {
  const nextSelectedOptionIdsByGroup: CharacterDraft["selectedOptionIdsByGroup"] =
    {};

  characterCreationSteps.forEach((step) => {
    step.optionGroups.forEach((baseGroup) => {
      const resolvedGroup = getResolvedOptionGroup(baseGroup, {
        ...draft,
        selectedOptionIdsByGroup: nextSelectedOptionIdsByGroup,
      });

      if (!resolvedGroup.visible) {
        return;
      }

      const rules = getResolvedSelectionRules(resolvedGroup);
      const selected = draft.selectedOptionIdsByGroup[resolvedGroup.id];
      const validOptionIds = new Set(
        resolvedGroup.options.map((option) => option.id),
      );

      if (rules.isMulti) {
        const selectedArray = Array.isArray(selected)
          ? selected
          : selected
            ? [selected]
            : [];

        const validSelectedArray = selectedArray.filter((optionId) =>
          validOptionIds.has(optionId),
        );

        if (validSelectedArray.length > 0) {
          nextSelectedOptionIdsByGroup[resolvedGroup.id] = validSelectedArray;
        }

        return;
      }

      if (typeof selected === "string" && validOptionIds.has(selected)) {
        nextSelectedOptionIdsByGroup[resolvedGroup.id] = selected;
      }
    });
  });

  return {
    ...draft,
    selectedOptionIdsByGroup: nextSelectedOptionIdsByGroup,
  };
}
