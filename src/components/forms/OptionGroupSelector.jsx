import { useId } from 'react';

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
    const resolvedMulti = multi ?? group?.maxSelectable !== 1;

    const resolvedSelected =
        selected ?? (resolvedMulti ? [] : null);

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
            nextSelected = resolvedSelected.includes(value)
                ? resolvedSelected.filter((item) => item !== value)
                : [...resolvedSelected, value];
        } else {
            nextSelected = value;
        }

        onChange?.(nextSelected);
    }

    return (
        <fieldset className="option-group-selector">
            <legend>{resolvedTitle}</legend>

            <div className="option-group-grid">
                {resolvedOptions.map((option, index) => {
                    const value = getOptionValue(option, index);
                    const inputId = `${groupId}-${value}`;
                    const checked = isSelected(value);

                    return (
                        <label
                            key={value}
                            htmlFor={inputId}
                            className={`option-card ${checked ? 'selected' : ''}`}
                        >
                            <input
                                id={inputId}
                                type={resolvedMulti ? 'checkbox' : 'radio'}
                                name={groupId}
                                value={value}
                                checked={checked}
                                onChange={() => handleSelect(value)}
                            />

                            {option.imageUrl && (
                                <img
                                    className="option-card-image"
                                    src={option.imageUrl}
                                    alt={option.altText ?? ''}
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