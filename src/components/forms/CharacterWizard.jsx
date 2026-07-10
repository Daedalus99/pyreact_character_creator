import { useRef, useState, useEffect } from "react";
import OptionGroupSelector from "./OptionGroupSelector";
import {
  characterCreationSteps,
  blankDraft,
} from "../../data/characterCreationSteps";
import { createRandomCharacterDraft } from "../../utils/characterRandomizer";
import {
  isGroupSelectionValid,
  getResolvedOptionGroup,
  sanitizeDraftSelections,
} from "../../utils/characterCreationRules";
import { useAppData } from "../../state/AppDataContext";

const iconUrlDice = "/icons/icon_dice.svg";

export default function CharacterWizard({
  onChangePage,
  setNavigationBlocker,
}) {
  const { characters } = useAppData();
  const editingCharacter = characters.editingEntity;

  const [draft, setDraft] = useState(() => {
    return editingCharacter?.draft ?? blankDraft;
  });

  useEffect(() => {
    setDraft(editingCharacter?.draft ?? blankDraft);
  }, [editingCharacter?.id]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const mainTopRef = useRef(null);

  const hasUnsavedChanges =
    draft.name.trim().length > 0 ||
    Object.keys(draft.selectedOptionIdsByGroup).length > 0 ||
    draft.age !== 30;

  useEffect(() => {
    setNavigationBlocker?.({
      shouldBlock: () => hasUnsavedChanges,
      message: "You have unsaved character changes. Leave without saving?",
    });

    return () => {
      setNavigationBlocker?.(null);
    };
  }, [setNavigationBlocker, hasUnsavedChanges]);

  function changeStep(index) {
    setCurrentStepIndex(index);

    requestAnimationFrame(() => {
      mainTopRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    });
  }
  const currentStep = characterCreationSteps[currentStepIndex];

  function cancelCharacterCreation() {
    onChangePage("characters");
  }

  function randomizeCharacter() {
    setDraft(createRandomCharacterDraft(characterCreationSteps));
  }

  function updateGroupSelection(groupId, nextSelected) {
    setDraft((previousDraft) => {
      const nextDraft = {
        ...previousDraft,
        selectedOptionIdsByGroup: {
          ...previousDraft.selectedOptionIdsByGroup,
          [groupId]: nextSelected,
        },
      };

      return sanitizeDraftSelections(nextDraft, characterCreationSteps);
    });
  }

  function isBasicInfoValid(draftToValidate = draft) {
    return (
      draftToValidate.name.trim().length > 0 &&
      draftToValidate.age >= 18 &&
      draftToValidate.age <= 100
    );
  }

  function isStepValid(step, draftToValidate = draft) {
    if (step.id === "basic-info") {
      return isBasicInfoValid(draftToValidate);
    }

    return step.optionGroups
      .map((group) => getResolvedOptionGroup(group, draftToValidate))
      .filter((group) => group.visible)
      .every((group) =>
        isGroupSelectionValid(
          group,
          draftToValidate.selectedOptionIdsByGroup[group.id],
        ),
      );
  }

  function isCharacterDraftValid() {
    return characterCreationSteps.every((step) => isStepValid(step));
  }

  function finishCharacterCreation() {
    const sanitizedDraft = sanitizeDraftSelections(
      draft,
      characterCreationSteps,
    );

    const invalidSteps = characterCreationSteps.filter(
      (step) => !isStepValid(step, sanitizedDraft),
    );

    if (invalidSteps.length > 0) {
      console.log(
        "Cannot finish. Invalid steps:",
        invalidSteps.map((step) => step.title),
      );
      return;
    }

    const character = {
      id: editingCharacter?.id ?? crypto.randomUUID(),
      label: sanitizedDraft.name,
      subtitle: `Age ${sanitizedDraft.age}`,
      draft: sanitizedDraft,
      createdAt: editingCharacter?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    characters.saveEntity(character);
    onChangePage("characters", { force: true });
  }

  const visibleOptionGroups = currentStep.optionGroups
    .map((group) => getResolvedOptionGroup(group, draft))
    .filter((group) => group.visible);

  return (
    <div className="character-wizard-layout">
      <aside className="character-wizard-sidebar">
        <div className="character-wizard-sidebar-header">
          <h2>Character Steps</h2>
        </div>

        <nav className="wizard-step-nav" aria-label="Character creation steps">
          {characterCreationSteps.map((step, index) => {
            const stepIsValid = isStepValid(step);
            return (
              <button
                key={step.id}
                type="button"
                className={[
                  "wizard-step-button",
                  index === currentStepIndex ? "active" : "",
                  stepIsValid ? "complete" : "incomplete",
                ].join(" ")}
                onClick={() => changeStep(index)}
              >
                <span>{step.title}</span>

                <span
                  className="wizard-step-status"
                  aria-label={stepIsValid ? "Complete" : "Incomplete"}
                  title={stepIsValid ? "Complete" : "Incomplete"}
                >
                  {stepIsValid ? "✓" : "!"}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="character-wizard-sidebar-footer">
          <button
            type="button"
            className="randomize-icon-button"
            onClick={randomizeCharacter}
            aria-label="Randomize character"
            title="Randomize character"
          >
            <img src={iconUrlDice} alt="" />
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={cancelCharacterCreation}
          >
            Cancel
          </button>
        </div>
        <button
          type="button"
          className="log-draft-button"
          onClick={() => {
            console.log("Draft:", draft);
            console.log(
              "Step validity:",
              characterCreationSteps.map((step) => ({
                step: step.title,
                valid: isStepValid(step),
              })),
            );
          }}
        >
          Log Draft
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={!isCharacterDraftValid()}
          onClick={finishCharacterCreation}
        >
          Finish
        </button>
      </aside>

      <main className="character-wizard-main">
        <header ref={mainTopRef} className="character-wizard-header">
          <h1>Create Character</h1>
          <p>Build a persona with name, appearance, traits, and backstory.</p>
        </header>

        <div className="wizard-progress">
          Step {currentStepIndex + 1} / {characterCreationSteps.length}:{" "}
          {currentStep.title}
        </div>

        <div className="wizard-step-stack">
          {currentStep.id === "basic-info" && (
            <div className="basic-info-fields">
              <label className="basic-info-field">
                Name
                <input
                  type="text"
                  placeholder="Character name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((previousDraft) => ({
                      ...previousDraft,
                      name: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="basic-info-field">
                Age: {draft.age}
                <input
                  type="range"
                  min="18"
                  max="100"
                  value={draft.age}
                  onChange={(event) =>
                    setDraft((previousDraft) => ({
                      ...previousDraft,
                      age: Number(event.target.value),
                    }))
                  }
                />
              </label>
            </div>
          )}

          {visibleOptionGroups.length > 0 ? (
            visibleOptionGroups.map((group, index) => (
              <div
                className="option-group-section"
                key={group.id || group.title}
              >
                <OptionGroupSelector
                  group={group}
                  selected={
                    draft.selectedOptionIdsByGroup[group.id] ??
                    (group.maxSelectable === 1 ? null : [])
                  }
                  onChange={(nextSelected) =>
                    updateGroupSelection(group.id, nextSelected)
                  }
                />

                {index < visibleOptionGroups.length - 1 && (
                  <hr className="option-group-divider" />
                )}
              </div>
            ))
          ) : (
            <p className="empty-step-message">
              No option groups added to this step yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
