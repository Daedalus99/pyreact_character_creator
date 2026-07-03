// SettingsPage holds global configuration, including API endpoints and storage location.
import BasePage from './BasePage';

export default function SettingsPage() {
  return (
    <BasePage title="Settings" description="Configure model providers, storage, and application behavior.">
      <section className="settings-grid">
        <div className="settings-card">
          <h2>AI Providers</h2>
          <p>Configure LM Studio, OpenAI, Gemini, or Grok endpoints and API keys.</p>
        </div>
        <div className="settings-card">
          <h2>Storage</h2>
          <p>Set where chat history, characters, and images are saved.</p>
        </div>
      </section>
    </BasePage>
  );
}
