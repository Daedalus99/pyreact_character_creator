import { useState, useEffect } from 'react';
import BasePage from '../tabs/BasePage';

const POSE_OPTIONS = [
    { id: 'standing', label: 'Standing' },
    { id: 'sitting', label: 'Sitting' },
    { id: 'lying', label: 'Lying Down' },
    { id: 'walking', label: 'Walking' },
    { id: 'running', label: 'Running' },
    { id: 'dancing', label: 'Dancing' },
    { id: 'fighting', label: 'Fighting Pose' },
    { id: 'relaxing', label: 'Relaxing' }
];

const EXPRESSION_OPTIONS = [
    { id: 'neutral', label: 'Neutral' },
    { id: 'happy', label: 'Happy' },
    { id: 'sad', label: 'Sad' },
    { id: 'angry', label: 'Angry' },
    { id: 'surprised', label: 'Surprised' },
    { id: 'confused', label: 'Confused' },
    { id: 'excited', label: 'Excited' },
    { id: 'serious', label: 'Serious' },
    { id: 'smirking', label: 'Smirking' },
    { id: 'laughing', label: 'Laughing' }
];

const OUTFIT_OPTIONS = [
    { id: 'casual', label: 'Casual' },
    { id: 'formal', label: 'Formal' },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'medieval', label: 'Medieval' },
    { id: 'modern', label: 'Modern' },
    { id: 'scifi', label: 'Sci-Fi' },
    { id: 'swimwear', label: 'Swimwear' },
    { id: 'sleepwear', label: 'Sleepwear' },
    { id: 'uniform', label: 'Uniform' },
    { id: 'none', label: 'Nude' }
];

const SCENERY_OPTIONS = [
    { id: 'none', label: 'No Background' },
    { id: 'bedroom', label: 'Bedroom' },
    { id: 'forest', label: 'Forest' },
    { id: 'beach', label: 'Beach' },
    { id: 'city', label: 'City' },
    { id: 'castle', label: 'Castle' },
    { id: 'space', label: 'Space' },
    { id: 'cafe', label: 'Cafe' },
    { id: 'library', label: 'Library' },
    { id: 'garden', label: 'Garden' }
];

export default function ImageGenerationSettings({ entity, entityType, onBack }) {
    const [settings, setSettings] = useState({
        pose: '',
        expression: '',
        outfit: '',
        scenery: '',
        customPrompt: ''
    });
    const [generatedImages, setGeneratedImages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);

    useEffect(() => {
        // Load existing images for this entity
        loadExistingImages();
    }, [entity.id]);

    function loadExistingImages() {
        try {
            const stored = localStorage.getItem(`images:${entity.id}`);
            if (stored) {
                setGeneratedImages(JSON.parse(stored));
            }
        } catch (error) {
            console.warn('Failed to load images:', error);
        }
    }

    function saveImages(images) {
        try {
            localStorage.setItem(`images:${entity.id}`, JSON.stringify(images));
        } catch (error) {
            console.warn('Failed to save images:', error);
        }
    }

    function updateSetting(key, value) {
        setSettings(prev => ({ ...prev, [key]: value }));
    }

    function buildImagePrompt() {
        const parts = [];
        
        // Add entity description if available
        if (entity.summary || entity.description) {
            parts.push(entity.summary || entity.description);
        }
        
        // Add entity name
        if (entity.label) {
            parts.push(`character named ${entity.label}`);
        }

        // Add selected options
        if (settings.pose) {
            const pose = POSE_OPTIONS.find(p => p.id === settings.pose);
            if (pose) parts.push(pose.label);
        }

        if (settings.expression) {
            const expression = EXPRESSION_OPTIONS.find(e => e.id === settings.expression);
            if (expression) parts.push(`${expression.label} expression`);
        }

        if (settings.outfit) {
            const outfit = OUTFIT_OPTIONS.find(o => o.id === settings.outfit);
            if (outfit && outfit.id !== 'none') {
                parts.push(`wearing ${outfit.label}`);
            }
        }

        if (settings.scenery && settings.scenery !== 'none') {
            const scenery = SCENERY_OPTIONS.find(s => s.id === settings.scenery);
            if (scenery) {
                parts.push(`in ${scenery.label}`);
            }
        }

        // Add custom prompt
        if (settings.customPrompt.trim()) {
            parts.push(settings.customPrompt.trim());
        }

        // Add art style if available
        if (entity.artstyle) {
            parts.push(`${entity.artstyle} art style`);
        }

        return parts.join(', ');
    }

    async function generateImage() {
        if (isGenerating) return;

        setIsGenerating(true);
        
        try {
            const prompt = buildImagePrompt();
            
            // For now, we'll simulate image generation
            // In a real implementation, this would call PixAI.art or Perchance
            const mockImage = {
                id: crypto.randomUUID(),
                prompt,
                url: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23e2e8f0'/%3E%3Ctext x='200' y='180' text-anchor='middle' fill='%23475569' font-size='14' font-family='sans-serif'%3EGenerated Image%3C/text%3E%3Ctext x='200' y='200' text-anchor='middle' fill='%2364748b' font-size='10' font-family='sans-serif'%3E${entity.label}%3C/text%3E%3Ctext x='200' y='220' text-anchor='middle' fill='%2394a3b8' font-size='8' font-family='sans-serif'%3E${new Date().toLocaleString()}%3C/text%3E%3C/svg%3E`,
                createdAt: new Date().toISOString(),
                settings: { ...settings }
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            setCurrentImage(mockImage);
        } catch (error) {
            console.error('Image generation failed:', error);
            alert('Failed to generate image. Please check your settings and try again.');
        } finally {
            setIsGenerating(false);
        }
    }

    function saveCurrentImage() {
        if (!currentImage) return;

        const newImages = [...generatedImages, currentImage];
        setGeneratedImages(newImages);
        saveImages(newImages);
        setCurrentImage(null);
    }

    function discardCurrentImage() {
        setCurrentImage(null);
    }

    function deleteImage(imageId) {
        const newImages = generatedImages.filter(img => img.id !== imageId);
        setGeneratedImages(newImages);
        saveImages(newImages);
    }

    function setAsPrimaryImage(image) {
        // This would update the entity's primary image
        console.log('Setting as primary image:', image);
        // You could implement this by updating the entity in the app data
    }

    if (currentImage) {
        return (
            <BasePage title={`Generated Image - ${entity.label}`} description="Review your generated image">
                <div className="image-generation-result">
                    <div className="generated-image-display">
                        <img src={currentImage.url} alt={`Generated image for ${entity.label}`} />
                    </div>
                    
                    <div className="generation-info">
                        <h3>Prompt Used:</h3>
                        <p>{currentImage.prompt}</p>
                    </div>

                    <div className="image-actions">
                        <button 
                            type="button" 
                            className="primary-button"
                            onClick={saveCurrentImage}
                        >
                            Save Image
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => generateImage()}
                            disabled={isGenerating}
                        >
                            Regenerate
                        </button>
                        
                        <button 
                            type="button"
                            onClick={discardCurrentImage}
                        >
                            Discard & Retry
                        </button>
                        
                        <button 
                            type="button"
                            onClick={onBack}
                        >
                            Back to Selection
                        </button>
                    </div>
                </div>
            </BasePage>
        );
    }

    return (
        <BasePage title={`Generate Image - ${entity.label}`} description={`Create images for ${entityType}: ${entity.label}`}>
            <div className="image-generation-container">
                <div className="image-generation-main">
                    <section className="entity-summary">
                        <h2>Entity Summary</h2>
                        <div className="entity-info">
                            <p><strong>Name:</strong> {entity.label}</p>
                            {entity.summary && <p><strong>Description:</strong> {entity.summary}</p>}
                            {entity.artstyle && <p><strong>Art Style:</strong> {entity.artstyle}</p>}
                        </div>
                    </section>

                    <section className="generation-options">
                        <h2>Image Options</h2>
                        
                        <div className="options-grid">
                            <div className="option-group">
                                <label htmlFor="pose">Pose/Action:</label>
                                <select 
                                    id="pose"
                                    value={settings.pose}
                                    onChange={(e) => updateSetting('pose', e.target.value)}
                                >
                                    <option value="">Select pose...</option>
                                    {POSE_OPTIONS.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="option-group">
                                <label htmlFor="expression">Expression:</label>
                                <select 
                                    id="expression"
                                    value={settings.expression}
                                    onChange={(e) => updateSetting('expression', e.target.value)}
                                >
                                    <option value="">Select expression...</option>
                                    {EXPRESSION_OPTIONS.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="option-group">
                                <label htmlFor="outfit">Outfit:</label>
                                <select 
                                    id="outfit"
                                    value={settings.outfit}
                                    onChange={(e) => updateSetting('outfit', e.target.value)}
                                >
                                    <option value="">Select outfit...</option>
                                    {OUTFIT_OPTIONS.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="option-group">
                                <label htmlFor="scenery">Scenery/Setting:</label>
                                <select 
                                    id="scenery"
                                    value={settings.scenery}
                                    onChange={(e) => updateSetting('scenery', e.target.value)}
                                >
                                    <option value="">Select scenery...</option>
                                    {SCENERY_OPTIONS.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="custom-prompt">
                            <label htmlFor="customPrompt">Custom Prompt:</label>
                            <textarea
                                id="customPrompt"
                                value={settings.customPrompt}
                                onChange={(e) => updateSetting('customPrompt', e.target.value)}
                                placeholder="Add any additional details for the image..."
                                rows={3}
                            />
                        </div>

                        <div className="prompt-preview">
                            <h3>Generated Prompt Preview:</h3>
                            <p>{buildImagePrompt() || 'Select options to see prompt preview...'}</p>
                        </div>
                    </section>

                    <div className="generation-actions">
                        <button 
                            type="button" 
                            className="primary-button generate-button"
                            onClick={generateImage}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'Generate Image'}
                        </button>
                        
                        <button type="button" onClick={onBack}>
                            Back
                        </button>
                    </div>
                </div>

                <aside className="image-gallery">
                    <h2>Existing Images</h2>
                    
                    {generatedImages.length > 0 ? (
                        <div className="image-grid">
                            {generatedImages.map((image) => (
                                <div key={image.id} className="image-item">
                                    <img src={image.url} alt={`Generated image`} />
                                    <div className="image-actions-small">
                                        <button 
                                            type="button"
                                            onClick={() => setAsPrimaryImage(image)}
                                            title="Set as primary"
                                        >
                                            ⭐
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => deleteImage(image.id)}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-gallery">
                            <p>No images generated yet</p>
                        </div>
                    )}
                </aside>
            </div>
        </BasePage>
    );
}