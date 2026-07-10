import { useId } from "react";
import {
  getGroupValidityText,
  getOptionValue,
  getResolvedSelectionRules,
  getSelectedCount,
  getSelectionRuleText,
  normalizeSelectedValue,
} from "../../utils/characterCreationRules";

export default function OptionGroupSelector({
  group,
  title,
  options,
  multi,
  selected,
  onChange,
}) {
  const groupId = useId();

  const resolvedTitle = group?.title ?? title;
  const resolvedOptions = group?.options ?? options ?? [];

  const rules = getResolvedSelectionRules(
    group ?? { maxSelectable: multi ? null : 1 },
  );

  const resolvedSelected = normalizeSelectedValue(selected, rules.isMulti);
  const selectedCount = getSelectedCount(selected, rules.isMulti);
  const selectionRuleText = getSelectionRuleText(
    group ?? { maxSelectable: multi ? null : 1 },
  );

  const validityText = getGroupValidityText(
    group ?? { maxSelectable: multi ? null : 1 },
    selected,
  );

  const isSelectionValid = validityText === "valid";

  const hasExplicitMaxSelectable =
    group && Object.prototype.hasOwnProperty.call(group, "maxSelectable");

  function getOptionValue(option, index) {
    return option.id ?? option.value ?? option.label ?? String(index);
  }

  function isSelected(value) {
    return rules.isMulti
      ? resolvedSelected.includes(value)
      : resolvedSelected === value;
  }
  function handleSelect(value) {
    let nextSelected;

    if (rules.isMulti) {
      const alreadySelected = resolvedSelected.includes(value);

      if (alreadySelected) {
        nextSelected = resolvedSelected.filter((item) => item !== value);
      } else {
        if (resolvedSelected.length >= rules.maxSelectable) {
          return;
        }

        nextSelected = [...resolvedSelected, value];
      }
    } else {
      nextSelected = value;
    }

    onChange?.(nextSelected);
  }
  function isOptionDisabled(value) {
    if (!rules.isMulti) {
      return false;
    }

    const alreadySelected = resolvedSelected.includes(value);

    return !alreadySelected && resolvedSelected.length >= rules.maxSelectable;
  }

  return (
    <fieldset className="option-group-selector">
      <legend className="option-group-legend">
        <span className="option-group-legend-title">
          {resolvedTitle}
          {rules.isOptional && (
            <span className="option-group-optional"> (optional)</span>
          )}
        </span>

        <span className="option-group-selection-status">
          {selectedCount} selected · {selectionRuleText}
        </span>

        <span
          className={`option-group-validity ${
            isSelectionValid ? "valid" : "invalid"
          }`}
        >
          {validityText}
        </span>
      </legend>
      <div className="option-group-grid">
        {resolvedOptions.map((option, index) => {
          const value = getOptionValue(option, index);
          const inputId = `${groupId}-${value}`;
          const checked = isSelected(value);
          const disabled = isOptionDisabled(value);

          return (
            <label
              key={value}
              htmlFor={inputId}
              className={`option-card ${checked ? "selected" : ""} ${disabled ? "disabled" : ""}`}
            >
              <input
                id={inputId}
                type={rules.isMulti ? "checkbox" : "radio"}
                name={groupId}
                value={value}
                checked={checked}
                disabled={disabled}
                onChange={() => handleSelect(value)}
              />

              {option.imageUrl && (
                <img
                  className="option-card-image"
                  src={option.imageUrl}
                  alt={option.altText ?? ""}
                  draggable={false}
                />
              )}

              <span className="option-card-label">
                {option.displayText ?? option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
