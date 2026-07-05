import { useId, useState } from 'react';

export default function OptionGroupSelector({
    title,
    options = [],
    multi = false,
    defaultSelected = multi ? [] : null,
    onChange,
}) {
    const groupId = useId();

    const [selected, setSelected] = useState(() => {
        if (multi) {
            return Array.isArray(defaultSelected) ? defaultSelected : [];
        }

        return defaultSelected;
    });

    function getOptionValue(option, index) {
        return option.id ?? option.value ?? option.label ?? String(index);
    }

    function isSelected(value) {
        return multi ? selected.includes(value) : selected === value;
    }

    function handleSelect(value) {
        let nextSelected;

        if (multi) {
            nextSelected = selected.includes(value)
                ? selected.filter((item) => item !== value)
                : [...selected, value];
        } else {
            nextSelected = value;
        }

        setSelected(nextSelected);
        onChange?.(nextSelected);
    }

    return (
        <fieldset className="option-group-selector">
            <legend>{title}</legend>

            <div className="option-group-grid">
                {options.map((option, index) => {
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
                                type={multi ? 'checkbox' : 'radio'}
                                name={multi ? inputId : groupId}
                                value={value}
                                checked={checked}
                                onChange={() => handleSelect(value)}
                            />

                            {option.imageUrl && (
                                <img
                                    className="option-card-image"
                                    src={option.imageUrl}
                                    alt={option.altText ?? ''}
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