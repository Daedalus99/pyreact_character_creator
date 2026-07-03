// ChatSettingsForm contains the fields for chat title, persona selection, and chat options.
// It composes common controls and can be reused for both New Chat and Edit Chat flows.
import BaseForm from './BaseForm';

export default function ChatSettingsForm() {
  return (
    <BaseForm
      title="Chat Settings"
      description="Choose the user profile, characters, and narrative options for this chat."
      actions={
        <>
          <button type="button">Cancel</button>
          <button type="submit">Save</button>
        </>
      }
    >
      <fieldset>
        <label>Chat Title</label>
        <input type="text" placeholder="Enter chat title" />
      </fieldset>
      <fieldset>
        <label>User Profile</label>
        <select>
          <option>Alex</option>
        </select>
      </fieldset>
      <fieldset>
        <label>Characters</label>
        <div className="multi-select">Select one or more characters</div>
      </fieldset>
      <fieldset>
        <label>Narration</label>
        <select>
          <option>Third Person</option>
        </select>
      </fieldset>
    </BaseForm>
  );
}
