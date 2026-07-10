import type { OptionGroup } from "../types/characterCreationTypes";

export type ResolvedSelectionRules = {
  minSelectable: number;
  maxSelectable: number;
  isMulti: boolean;
  isOptional: boolean;
};

export type SelectedOptionValue = string | string[] | null | undefined;

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
