// CharacterWizard is a step-driven character creator.
// It renders option groups, progress state, and can hide/show fields based on gender or validation.
import BaseForm from './BaseForm';
import OptionGroupSelector from './OptionGroupSelector';

export default function CharacterWizard({ onChangePage }) {
    return (
        <BaseForm
            title="Create Character"
            description="Build a persona with name, appearance, traits, and backstory."
            actions={
                <>
                    <button type="button" onClick={() => onChangePage('characters')}>
                        Back
                    </button>
                    <button type="button">Next</button>
                    <button type="button" onClick={() => onChangePage('characters')}>
                        Cancel
                    </button>
                </>
            }
        >
            <div className="wizard-progress">Step 1 / 6</div>
            <fieldset>
                <label>Name</label>
                <input type="text" placeholder="Character name" />
            </fieldset>
            <fieldset>
                <label>Age</label>
                <input type="range" min="18" max="100" defaultValue="25" />
            </fieldset>
            <OptionGroupSelector title="Art Style" options={[{ label: 'Anime' }, { label: 'Realistic' }]} />
            <OptionGroupSelector title="Personality Traits" multi options={[{ label: 'Brave' }, { label: 'Mischievous' }]} />
        </BaseForm>
    );
}
