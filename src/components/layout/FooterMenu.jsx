import { useState, useEffect } from 'react';

const providers = [
    { id: 'lmstudio', label: 'LM Studio', requiresKey: false },
    { id: 'openai', label: 'OpenAI', requiresKey: true },
    { id: 'gemini', label: 'Gemini', requiresKey: true },
    { id: 'grok', label: 'Grok', requiresKey: true },
];

export default function FooterMenu({ activePage, onChangePage }) {
    const [selectedProvider, setSelectedProvider] = useState('lmstudio');
    const [settings, setSettings] = useState({});
    const [connectionStatus, setConnectionStatus] = useState('unknown');

    useEffect(() => {
        loadSettings();
        loadSelectedProvider();
    }, []);

    useEffect(() => {
        if (selectedProvider) {
            saveSelectedProvider();
            updateBackendProvider();
        }
    }, [selectedProvider]);

    async function loadSettings() {
        try {
            const stored = localStorage.getItem('pyreact-character-creator:settings');
            if (stored) {
                setSettings(JSON.parse(stored));
            }
        } catch (error) {
            console.warn('Failed to load settings:', error);
        }
    }

    function loadSelectedProvider() {
        try {
            const stored = localStorage.getItem('pyreact-character-creator:selected-provider');
            if (stored) {
                setSelectedProvider(stored);
            }
        } catch (error) {
            console.warn('Failed to load selected provider:', error);
        }
    }

    function saveSelectedProvider() {
        try {
            localStorage.setItem('pyreact-character-creator:selected-provider', selectedProvider);
        } catch (error) {
            console.warn('Failed to save selected provider:', error);
        }
    }

    async function updateBackendProvider() {
        try {
            await fetch('http://127.0.0.1:5000/api/provider/select', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider: selectedProvider })
            });
        } catch (error) {
            console.warn('Failed to update backend provider:', error);
        }
    }

    function handleProviderChange(event) {
        const newProvider = event.target.value;
        setSelectedProvider(newProvider);
    }

    function isProviderConfigured(providerId) {
        const provider = providers.find(p => p.id === providerId);
        if (!provider?.requiresKey) return true;
        
        const providerSettings = settings[providerId];
        return providerSettings?.apiKey?.trim();
    }

    function getProviderStatus(providerId) {
        if (!isProviderConfigured(providerId)) {
            return '⚠️';
        }
        return '✓';
    }

    return (
        <footer className="footer-menu">
            <div className="footer-provider-section">
                <label className="footer-provider-label">
                    AI Provider
                    <select 
                        value={selectedProvider} 
                        onChange={handleProviderChange}
                        className="footer-provider-select"
                    >
                        {providers.map((provider) => (
                            <option 
                                key={provider.id} 
                                value={provider.id}
                                disabled={!isProviderConfigured(provider.id)}
                            >
                                {getProviderStatus(provider.id)} {provider.label}
                            </option>
                        ))}
                    </select>
                </label>
                
                <div className="footer-provider-info">
                    {!isProviderConfigured(selectedProvider) && (
                        <span className="footer-warning">
                            Configure in settings
                        </span>
                    )}
                </div>
            </div>

            <div className="footer-actions">
                <button 
                    type="button" 
                    onClick={() => onChangePage('settings')}
                    className="footer-settings-button"
                    title="Configure providers and settings"
                >
                    ⚙️ Settings
                </button>
            </div>
        </footer>
    );
}
