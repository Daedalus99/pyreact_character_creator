// FooterMenu shows the provider select and global action menu at the bottom.
// It also helps keep provider selection consistent across pages.
const providers = [
  { id: 'lmstudio', label: 'LM Studio' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'grok', label: 'Grok' },
  { id: 'openai', label: 'OpenAI' },
];

export default function FooterMenu({ activePage, onChangePage }) {
  return (
    <footer className="footer-menu">
      <label>
        AI Provider
        <select defaultValue="lmstudio">
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.label}
            </option>
          ))}
        </select>
      </label>
      <div className="footer-actions">
        <button type="button" onClick={() => onChangePage('settings')}>
          Provider settings
        </button>
      </div>
    </footer>
  );
}
