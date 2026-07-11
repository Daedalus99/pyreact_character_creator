import { useEffect, useRef, useState } from "react";
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

export const characterWizardConfig = {
  entityTypeLabel: "Character",
  entityTypeLabelPlural: "Characters",
  returnPage: "characters",
  collectionKey: "characters",
  pageDescription: "Create and manage AI-controlled roleplay characters.",
  wizardDescription:
    "Build an AI-controlled roleplay character with name, appearance, traits, and backstory.",
};

export const userPersonaWizardConfig = {
  entityTypeLabel: "User Persona",
  entityTypeLabelPlural: "User Personas",
  returnPage: "user",
  collectionKey: "userPersonas",
  pageDescription: "Create and manage the identities you roleplay as.",
  wizardDescription:
    "Build the identity you roleplay as, including name, appearance, traits, and backstory.",
};

function cloneDraft(draft) {
  return JSON.parse(JSON.stringify(draft));
}

function getDraftSignature(draft) {
  return JSON.stringify(draft);
}

function getEntityLabel(config) {
  return config.entityTypeLabel ?? "Persona";
}

function getEntityLabelLower(config) {
  return getEntityLabel(config).toLowerCase();
}

function getFreshDraft(editingEntity) {
  return cloneDraft(editingEntity?.draft ?? blankDraft);
}

export default function PersonaWizard({
  onChangePage,
  setNavigationBlocker,
  config = characterWizardConfig,
}) {
  const appData = useAppData();
  const collection = appData[config.collectionKey];

  if (!collection) {
    throw new Error(
      `PersonaWizard could not find collection "${config.collectionKey}" in AppDataContext.`,
    );
  }

  const editingEntity = collection.editingEntity;
  const isEditingEntity = Boolean(editingEntity);
  const entityTypeLabel = getEntityLabel(config);
  const entityTypeLabelLower = getEntityLabelLower(config);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const mainTopRef = useRef(null);

  const [initialDraft, setInitialDraft] = useState(() =>
    getFreshDraft(editingEntity),
  );

  const [draft, setDraft] = useState(() => getFreshDraft(editingEntity));

  useEffect(() => {
    const nextDraft = getFreshDraft(editingEntity);

    setInitialDraft(nextDraft);
    setDraft(nextDraft);
    setCurrentStepIndex(0);
  }, [config.collectionKey, editingEntity?.id]);

  const hasUnsavedChanges =
    getDraftSignature(draft) !== getDraftSignature(initialDraft);

  const wizardTitle = isEditingEntity
    ? `Edit ${entityTypeLabel}`
    : `Create ${entityTypeLabel}`;

  const finishButtonLabel = isEditingEntity ? "Save Changes" : "Finish";
  const showDebugControls = import.meta.env.DEV;

  useEffect(() => {
    setNavigationBlocker?.({
      shouldBlock: () => hasUnsavedChanges,
      message: `You have unsaved ${entityTypeLabelLower} changes. Leave without saving?`,
    });

    return () => {
      setNavigationBlocker?.(null);
    };
  }, [entityTypeLabelLower, hasUnsavedChanges, setNavigationBlocker]);

  function scrollToWizardTop() {
    requestAnimationFrame(() => {
      mainTopRef.current?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    });
  }

  function changeStep(index) {
    setCurrentStepIndex(index);
    scrollToWizardTop();
  }

  function cancelPersonaCreation() {
    onChangePage(config.returnPage);
  }

  function randomizePersona() {
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

  function updateDraftField(fieldName, nextValue) {
    setDraft((previousDraft) => ({
      ...previousDraft,
      [fieldName]: nextValue,
    }));
  }

  function getSanitizedDraft(draftToSanitize = draft) {
    const sanitizedDraft = sanitizeDraftSelections(
      draftToSanitize,
      characterCreationSteps,
    );

    return {
      ...sanitizedDraft,
      name: sanitizedDraft.name.trim(),
    };
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

  function isPersonaDraftValid(draftToValidate = draft) {
    return characterCreationSteps.every((step) =>
      isStepValid(step, draftToValidate),
    );
  }

  function goToFirstInvalidStep(sanitizedDraft) {
    const firstInvalidStepIndex = characterCreationSteps.findIndex(
      (step) => !isStepValid(step, sanitizedDraft),
    );

    if (firstInvalidStepIndex >= 0) {
      changeStep(firstInvalidStepIndex);
    }

    return firstInvalidStepIndex;
  }

  function finishPersonaCreation() {
    const sanitizedDraft = getSanitizedDraft();

    if (!isPersonaDraftValid(sanitizedDraft)) {
      const firstInvalidStepIndex = goToFirstInvalidStep(sanitizedDraft);

      if (showDebugControls) {
        console.log(
          "Cannot finish. Invalid steps:",
          characterCreationSteps
            .filter((step) => !isStepValid(step, sanitizedDraft))
            .map((step) => step.title),
          "First invalid step index:",
          firstInvalidStepIndex,
        );
      }

      return;
    }

    const now = new Date().toISOString();

    const entity = {
      id: editingEntity?.id ?? crypto.randomUUID(),
      label: sanitizedDraft.name,
      subtitle: `${
        sanitizedDraft.selectedOptionIdsByGroup.gender
          ?.replace(/^gender_/, "")
          .replaceAll("_", " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "Unknown"
      } - Age ${sanitizedDraft.age}`,
      draft: sanitizedDraft,
      createdAt: editingEntity?.createdAt ?? now,
      updatedAt: now,
    };

    collection.saveEntity(entity);
    onChangePage(config.returnPage, { force: true });
  }

  const currentStep = characterCreationSteps[currentStepIndex];

  const visibleOptionGroups = currentStep.optionGroups
    .map((group) => getResolvedOptionGroup(group, draft))
    .filter((group) => group.visible);

  return (
    <div className="persona-wizard-layout">
      <aside className="persona-wizard-sidebar">
        <div className="persona-wizard-sidebar-header">
          <h2>{entityTypeLabel} Steps</h2>
        </div>

        <nav
          className="wizard-step-nav"
          aria-label={`${entityTypeLabel} creation steps`}
        >
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

        <div className="persona-wizard-sidebar-footer">
          <button
            type="button"
            className="randomize-icon-button"
            onClick={randomizePersona}
            aria-label={`Randomize ${entityTypeLabelLower}`}
            title={`Randomize ${entityTypeLabelLower}`}
          >
            <img src={iconUrlDice} alt="" draggable={false} />
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={cancelPersonaCreation}
          >
            Cancel
          </button>
        </div>
        <button
          type="button"
          className="primary-button"
          disabled={!isPersonaDraftValid()}
          onClick={finishPersonaCreation}
        >
          {finishButtonLabel}
        </button>
        {showDebugControls && (
          <button
            type="button"
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
        )}
      </aside>

      <main className="persona-wizard-main">
        <header ref={mainTopRef} className="persona-wizard-header">
          <h1>{wizardTitle}</h1>
          <p>
            {config.wizardDescription ??
              "Build a persona with name, appearance, traits, and backstory."}
          </p>
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
                  placeholder={`${entityTypeLabel} name`}
                  value={draft.name}
                  onChange={(event) =>
                    updateDraftField("name", event.target.value)
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
                    updateDraftField("age", Number(event.target.value))
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
