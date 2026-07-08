import { useState } from 'react';
import BaseForm from './BaseForm';
import OptionGroupSelector from './OptionGroupSelector';
import { characterCreationSteps } from '../../data/characterCreationSteps';

export default function CharacterWizard({ onChangePage }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const currentStep = characterCreationSteps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === characterCreationSteps.length - 1;

    function goToPreviousStep() {
        if (isFirstStep) {
            onChangePage('characters');
            return;
        }

        setCurrentStepIndex((index) => index - 1);
    }

    function goToNextStep() {
        if (isLastStep) {
            console.log('Finish character creation');
            // Later: validate + save character, then return to Characters page.
            // onChangePage('characters');
            return;
        }

        setCurrentStepIndex((index) => index + 1);
    }

    function cancelCharacterCreation() {
        onChangePage('characters');
    }

    return (
        <BaseForm
            title="Create Character"
            description="Build a persona with name, appearance, traits, and backstory."
            actions={
                <>
                    <button type="button" onClick={goToPreviousStep}>
                        {isFirstStep ? 'Back' : 'Previous'}
                    </button>

                    <button type="button" onClick={goToNextStep}>
                        {isLastStep ? 'Finish' : currentStep.nextButtonText || 'Next'}
                    </button>

                    <button type="button" onClick={cancelCharacterCreation}>
                        Cancel
                    </button>
                </>
            }
        >
            <div className="character-wizard-layout">
                <aside className="character-wizard-sidebar">
                    <h2>Character Steps</h2>

                    <nav className="wizard-step-nav" aria-label="Character creation steps">
                        {characterCreationSteps.map((step, index) => (
                            <button
                                key={step.id}
                                type="button"
                                className={`wizard-step-button ${
                                    index === currentStepIndex ? 'active' : ''
                                }`}
                                onClick={() => setCurrentStepIndex(index)}
                            >
                                <span>{step.title}</span>
                                <span className="wizard-step-status">
                                    {index + 1}
                                </span>
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="character-wizard-main">
                    <div className="wizard-progress">
                        Step {currentStepIndex + 1} / {characterCreationSteps.length}: {currentStep.title}
                    </div>

                    <div className="wizard-step-stack">
                        {currentStep.id === 'basic-info' && (
                            <div className="basic-info-fields">
                                <label className="basic-info-field">
                                    Name
                                    <input type="text" placeholder="Character name" />
                                </label>

                                <label className="basic-info-field">
                                    Age
                                    <input type="range" min="18" max="100" defaultValue="30" />
                                </label>
                            </div>
                        )}

                        {currentStep.optionGroups.length > 0 ? (
                            currentStep.optionGroups.map((group) => (
                                <OptionGroupSelector
                                    key={group.id || group.title}
                                    title={group.title}
                                    multi={group.maxSelectable !== 1}
                                    options={group.options}
                                />
                            ))
                        ) : (
                            <p className="empty-step-message">
                                No option groups added to this step yet.
                            </p>
                        )}
                    </div>
                </main>
            </div>
        </BaseForm>
    );
}