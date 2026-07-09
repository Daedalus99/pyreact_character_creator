import { useState } from "react";
import OptionGroupSelector from "./OptionGroupSelector";
import { characterCreationSteps } from "../../data/characterCreationSteps";

const iconUrlDice = "/icons/icon_dice.svg";

export default function CharacterWizard({ onChangePage }) {
  const [draft, setDraft] = useState({
    name: "",
    age: 30,
    selectedOptionIdsByGroup: {},
    customTextByGroup: {},
    loreEntries: [],
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = characterCreationSteps[currentStepIndex];

  function cancelCharacterCreation() {
    onChangePage("characters");
  }

  function randomizeCharacter() {
    console.log("Randomize character");
  }

  function updateGroupSelection(groupId, nextSelected) {
    setDraft((previousDraft) => ({
      ...previousDraft,
      selectedOptionIdsByGroup: {
        ...previousDraft.selectedOptionIdsByGroup,
        [groupId]: nextSelected,
      },
    }));
  }

  return (
    <div className="character-wizard-layout">
      <aside className="character-wizard-sidebar">
        <div className="character-wizard-sidebar-header">
          <h2>Character Steps</h2>
        </div>

        <nav className="wizard-step-nav" aria-label="Character creation steps">
          {characterCreationSteps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={`wizard-step-button ${
                index === currentStepIndex ? "active" : ""
              }`}
              onClick={() => setCurrentStepIndex(index)}
            >
              <span>{step.title}</span>
              <span className="wizard-step-status">{index + 1}</span>
            </button>
          ))}
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
      </aside>

      <main className="character-wizard-main">
        <header className="character-wizard-header">
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

          {currentStep.optionGroups.length > 0 ? (
            currentStep.optionGroups.map((group) => (
              <>
                <OptionGroupSelector
                  group={group}
                  selected={draft.selectedOptionIdsByGroup[group.id] ?? []}
                  onChange={(nextSelected) =>
                    updateGroupSelection(group.id, nextSelected)
                  }
                />
                <hr style={{ width: "100%" }} />
              </>
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
