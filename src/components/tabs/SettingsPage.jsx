import { useState, useEffect } from 'react';
import BasePage from './BasePage';

const DEFAULT_SETTINGS = {
  lmStudio: {
    endpoint: 'http://localhost:7095/v1/chat/completions',
    model: 'gemma-4-26b-a4b-it'
  },
  openai: {
    apiKey: '',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo'
  },
  gemini: {
    apiKey: '',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    model: 'gemini-pro'
  },
  grok: {
    apiKey: '',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    model: 'grok-1'
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [storageInfo, setStorageInfo] = useState(null);

  useEffect(() => {
    loadSettings();
    loadStorageInfo();
  }, []);

  async function loadSettings() {
    try {
      const stored = localStorage.getItem('pyreact-character-creator:settings');
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }

  async function loadStorageInfo() {
    try {
      if (window.appStorage?.getInfo) {
        const info = await window.appStorage.getInfo();
        setStorageInfo(info);
      }
    } catch (error) {
      console.warn('Failed to load storage info:', error);
    }
  }

  function updateProviderSetting(provider, key, value) {
    setSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [key]: value
      }
    }));
    setHasChanges(true);
  }

  async function saveSettings() {
    try {
      localStorage.setItem('pyreact-character-creator:settings', JSON.stringify(settings));
      setHasChanges(false);
      
      // Also notify backend if needed
      try {
        await fetch('http://127.0.0.1:5000/api/settings/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
      } catch (error) {
        console.warn('Backend settings update failed:', error);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  function resetSettings() {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  }

  function renderProviderSection(title, provider, config) {
    return (
      <div className="settings-section">
        <h3>{title}</h3>
        <div className="settings-form">
          {config.endpoint && (
            <div className="form-group">
              <label htmlFor={`${provider}-endpoint`}>Endpoint URL:</label>
              <input
                id={`${provider}-endpoint`}
                type="url"
                value={settings[provider].endpoint}
                onChange={(e) => updateProviderSetting(provider, 'endpoint', e.target.value)}
                placeholder="Enter API endpoint URL"
              />
            </div>
          )}
          
          {config.model && (
            <div className="form-group">
              <label htmlFor={`${provider}-model`}>Model:</label>
              <input
                id={`${provider}-model`}
                type="text"
                value={settings[provider].model}
                onChange={(e) => updateProviderSetting(provider, 'model', e.target.value)}
                placeholder="Enter model name"
              />
            </div>
          )}
          
          {config.apiKey && (
            <div className="form-group">
              <label htmlFor={`${provider}-key`}>API Key:</label>
              <input
                id={`${provider}-key`}
                type="password"
                value={settings[provider].apiKey}
                onChange={(e) => updateProviderSetting(provider, 'apiKey', e.target.value)}
                placeholder="Enter API key"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <BasePage title="Settings" description="Configure AI providers, storage, and application behavior.">
      <div className="settings-container">
        <div className="settings-main">
          <section className="settings-group">
            <h2>AI Providers</h2>
            
            {renderProviderSection('LM Studio', 'lmStudio', {
              endpoint: true,
              model: true
            })}
            
            {renderProviderSection('OpenAI', 'openai', {
              endpoint: true,
              model: true,
              apiKey: true
            })}
            
            {renderProviderSection('Google Gemini', 'gemini', {
              endpoint: true,
              model: true,
              apiKey: true
            })}
            
            {renderProviderSection('Grok (X.AI)', 'grok', {
              endpoint: true,
              model: true,
              apiKey: true
            })}
          </section>

          <section className="settings-group">
            <h2>Storage Information</h2>
            <div className="settings-info">
              {storageInfo ? (
                <>
                  <p><strong>Storage Location:</strong> {storageInfo.dataPath || 'Browser localStorage'}</p>
                  <p><strong>Collections:</strong> {storageInfo.collections?.join(', ') || 'None'}</p>
                </>
              ) : (
                <p>Storage information unavailable</p>
              )}
            </div>
          </section>
        </div>

        <div className="settings-actions">
          <button 
            type="button" 
            className="primary-button"
            onClick={saveSettings}
            disabled={!hasChanges}
          >
            Save Settings
          </button>
          
          <button 
            type="button" 
            onClick={resetSettings}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </BasePage>
  );
}
