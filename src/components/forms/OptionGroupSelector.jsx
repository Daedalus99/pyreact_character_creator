import { useId } from "react";

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

  const hasExplicitMaxSelectable =
    group && Object.prototype.hasOwnProperty.call(group, "maxSelectable");

  const resolvedMinSelectable = group?.minSelectable ?? 0;

  const resolvedMaxSelectable = hasExplicitMaxSelectable
    ? group.maxSelectable === null
      ? Infinity
      : group.maxSelectable
    : multi
      ? Infinity
      : 1;

  const resolvedMulti = multi ?? resolvedMaxSelectable !== 1;

  const resolvedSelected = resolvedMulti
    ? Array.isArray(selected)
      ? selected
      : selected
        ? [selected]
        : []
    : (selected ?? null);

  const selectedCount = resolvedMulti
    ? resolvedSelected.length
    : resolvedSelected
      ? 1
      : 0;

  const isSelectionValid =
    selectedCount >= resolvedMinSelectable &&
    selectedCount <= resolvedMaxSelectable;

  const isOptional = resolvedMinSelectable < 1;

  const selectionRuleText =
    resolvedMinSelectable === resolvedMaxSelectable
      ? `Select ${resolvedMinSelectable}`
      : resolvedMaxSelectable === Infinity
        ? `Select ${resolvedMinSelectable}+`
        : `Select ${resolvedMinSelectable}-${resolvedMaxSelectable}`;

  const validityText = isSelectionValid
    ? "valid"
    : selectedCount < resolvedMinSelectable
      ? `${resolvedMinSelectable - selectedCount} more required`
      : `${selectedCount - resolvedMaxSelectable} too many`;

  function getOptionValue(option, index) {
    return option.id ?? option.value ?? option.label ?? String(index);
  }

  function isSelected(value) {
    return resolvedMulti
      ? resolvedSelected.includes(value)
      : resolvedSelected === value;
  }
  function handleSelect(value) {
    let nextSelected;

    if (resolvedMulti) {
      const alreadySelected = resolvedSelected.includes(value);

      if (alreadySelected) {
        nextSelected = resolvedSelected.filter((item) => item !== value);
      } else {
        if (resolvedSelected.length >= resolvedMaxSelectable) {
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
    if (!resolvedMulti) {
      return false;
    }

    const alreadySelected = resolvedSelected.includes(value);

    return !alreadySelected && resolvedSelected.length >= resolvedMaxSelectable;
  }

  return (
    <fieldset className="option-group-selector">
      <legend className="option-group-legend">
        <span className="option-group-legend-title">
          {resolvedTitle}
          {isOptional && (
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
                type={resolvedMulti ? "checkbox" : "radio"}
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
