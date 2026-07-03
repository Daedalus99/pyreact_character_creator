// ImageGenerationForm collects prompt details, pose, outfit, and custom text.
// It can be reused by both character and chat image workflows.
import BaseForm from './BaseForm';

export default function ImageGenerationForm() {
  return (
    <BaseForm
      title="Image Generation"
      description="Combine persona details, pose, and custom prompt text into a single request."
      actions={
        <>
          <button type="button">Back</button>
          <button type="submit">Generate</button>
        </>
      }
    >
      <fieldset>
        <label>Prompt</label>
        <textarea placeholder="Describe the scene, outfit, and mood." />
      </fieldset>
      <fieldset>
        <label>Pose / Action</label>
        <select>
          <option>Standing</option>
        </select>
      </fieldset>
      <fieldset>
        <label>Expression</label>
        <select>
          <option>Smiling</option>
        </select>
      </fieldset>
    </BaseForm>
  );
}
