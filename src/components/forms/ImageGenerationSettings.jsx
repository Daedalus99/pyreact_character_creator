import React, { useState, useEffect } from 'react';
import BasePage from '../tabs/BasePage';
import BatchImageResults from './BatchImageResults';

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

const ART_STYLE_OPTIONS = [
    { id: 'anime', label: 'Anime' },
    { id: 'realistic', label: 'Realistic' },
    { id: 'cartoon', label: 'Cartoon' },
    { id: 'digital_art', label: 'Digital Art' },
    { id: 'oil_painting', label: 'Oil Painting' },
    { id: 'watercolor', label: 'Watercolor' },
    { id: 'sketch', label: 'Sketch' },
    { id: 'pixel_art', label: 'Pixel Art' }
];

export default function ImageGenerationSettings({ entity, entityType, onBack }) {
    const [settings, setSettings] = useState({
        pose: '',
        expression: '',
        outfit: '',
        scenery: '',
        artStyle: 'anime', // Default to anime
        shape: 'portrait', // Default to portrait for character images
        batchSize: 2, // Default batch size
        customPrompt: ''
    });
    const [generatedImages, setGeneratedImages] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    
    // Prompt enhancement state
    const [enhancedPrompt, setEnhancedPrompt] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [enhancementType, setEnhancementType] = useState('normal');
    const [useEnhancedPrompt, setUseEnhancedPrompt] = useState(false);
    const [showBatchResults, setShowBatchResults] = useState(false);

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
        
        // Extract comprehensive character visual data
        const draft = entity.draft || {};
        const selectedOptions = draft.selectedOptionIdsByGroup || {};
        
        // Build character description focusing on visual traits
        const visualParts = [];
        
        // Combine age and gender into natural phrases (no character name)
        const age = draft.age;
        const gender = selectedOptions.gender;
        
        if (age && gender) {
            let cleanGender = gender.replace(/gender_/g, '').replace(/_/g, ' ');
            // Handle special cases for better grammar
            if (cleanGender === 'androgynous') {
                cleanGender = 'androgynous person';
            }
            visualParts.push(`${age} year old ${cleanGender}`);
        } else if (age) {
            visualParts.push(`${age} years old`);
        } else if (gender) {
            let cleanGender = gender.replace(/gender_/g, '').replace(/_/g, ' ');
            if (cleanGender === 'androgynous') {
                cleanGender = 'androgynous person';
            }
            visualParts.push(cleanGender);
        }
        
        // Physical appearance traits (excluding gender since it's handled above)
        // Use the actual key names from the character data
        const visualTraits = {
            race: selectedOptions.race,
            eyes: selectedOptions.eyes,
            hair_color: selectedOptions.hair_color,
            hair_style: selectedOptions.hair_style,
            body_type: selectedOptions.body_type,
            breast_size: selectedOptions.breast_size,
            cock_size: selectedOptions.cock_size,
            butt_size: selectedOptions.butt_size,
            notable_features: selectedOptions.notable_features
        };
        
        // Clean and format visual traits
        Object.entries(visualTraits).forEach(([trait, value]) => {
            if (value) {
                let cleanValue;
                if (Array.isArray(value)) {
                    cleanValue = value.map(v => {
                        // Remove common prefixes and clean up
                        return v.replace(new RegExp(`${trait}_`, 'g'), '')
                                .replace(/^(haircolor_|bodytype_|buttsize_|breast_size_|cock_size_|butt_size_|hair_color_|hair_style_|body_type_|notable_features_|eyes_|race_)/g, '')
                                .replace(/_/g, ' ');
                    }).join(', ');
                } else {
                    // Remove common prefixes and clean up
                    cleanValue = value.replace(new RegExp(`${trait}_`, 'g'), '')
                                     .replace(/^(haircolor_|bodytype_|buttsize_|breast_size_|cock_size_|butt_size_|hair_color_|hair_style_|body_type_|notable_features_|eyes_|race_)/g, '')
                                     .replace(/_/g, ' ');
                }
                
                // Format for image prompts
                let formattedValue;
                switch(trait) {
                    case 'eyes':
                        formattedValue = `${cleanValue} eyes`;
                        break;
                    case 'hair_color':
                        formattedValue = `${cleanValue} hair`;
                        break;
                    case 'hair_style':
                        formattedValue = `${cleanValue} hairstyle`;
                        break;
                    case 'body_type':
                        formattedValue = `${cleanValue} build`;
                        break;
                    case 'breast_size':
                        formattedValue = `${cleanValue} breasts`;
                        break;
                    case 'cock_size':
                        formattedValue = `${cleanValue} cock`;
                        break;
                    case 'butt_size':
                        formattedValue = `${cleanValue} butt`;
                        break;
                    case 'notable_features':
                        formattedValue = cleanValue;
                        break;
                    default:
                        formattedValue = cleanValue;
                }
                
                visualParts.push(formattedValue);
            }
        });
        
        // Add default outfit from character data if no override
        // Check both possible key names for outfit
        const outfitKey = selectedOptions.typical_outfit || selectedOptions.outfit || selectedOptions.typicalOutfit;
        if (!settings.outfit && outfitKey) {
            const outfit = outfitKey.replace(/typical_outfit_|outfit_|typicalOutfit_/g, '').replace(/_/g, ' ');
            visualParts.push(`wearing ${outfit}`);
        }
        
        // Build main character description
        if (visualParts.length > 0) {
            parts.push(visualParts.join(', '));
        }
        
        // Add pose/expression/outfit overrides from generation settings
        if (settings.pose) {
            const pose = POSE_OPTIONS.find(p => p.id === settings.pose);
            if (pose) parts.push(pose.label.toLowerCase());
        }

        if (settings.expression) {
            const expression = EXPRESSION_OPTIONS.find(e => e.id === settings.expression);
            if (expression) parts.push(`${expression.label.toLowerCase()} expression`);
        }

        if (settings.outfit) {
            const outfit = OUTFIT_OPTIONS.find(o => o.id === settings.outfit);
            if (outfit && outfit.id !== 'none') {
                parts.push(`wearing ${outfit.label.toLowerCase()}`);
            } else if (outfit && outfit.id === 'none') {
                parts.push('nude');
            }
        }

        if (settings.scenery && settings.scenery !== 'none') {
            const scenery = SCENERY_OPTIONS.find(s => s.id === settings.scenery);
            if (scenery) {
                parts.push(`${scenery.label.toLowerCase()} background`);
            }
        }

        // Add custom prompt
        if (settings.customPrompt.trim()) {
            parts.push(settings.customPrompt.trim());
        }
        
        // Add quality and style modifiers
        parts.push('high quality', 'detailed', 'masterpiece');

        return parts.join(', ');
    }

    function getArtStyle() {
        // Return the selected art style from settings
        return settings.artStyle || 'anime';
    }

    async function enhancePrompt() {
        const currentPrompt = buildImagePrompt();
        if (!currentPrompt.trim() || isEnhancing) {
            return;
        }

        setIsEnhancing(true);
        
        try {
            console.log('Enhancing prompt:', currentPrompt);
            console.log('Enhancement type:', enhancementType);
            
            const response = await fetch('http://127.0.0.1:5000/api/prompt/enhance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: currentPrompt,
                    type: enhancementType
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to enhance prompt');
            }

            if (result.success && result.enhancedPrompt) {
                setEnhancedPrompt(result.enhancedPrompt);
                setUseEnhancedPrompt(true); // Automatically enable the enhanced prompt
                console.log('Prompt enhanced successfully:', result.enhancedPrompt);
                
                if (result.isMock) {
                    console.log('Note: This is a mock enhancement as the actual API was unavailable');
                }
            } else {
                throw new Error('No enhanced prompt received');
            }
        } catch (error) {
            console.error('Prompt enhancement failed:', error);
            alert(`Failed to enhance prompt: ${error.message}`);
        } finally {
            setIsEnhancing(false);
        }
    }
    async function generateImage() {
        if (isGenerating) return;

        setIsGenerating(true);
        setCurrentImage(null);
        
        // Immediately switch to batch results page for real-time progress
        setShowBatchResults(true);
        
        // The actual generation will be handled by BatchImageResults component
        // This function now just triggers the switch to batch results page
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

    // Helper functions for BatchImageResults
    const handleBackFromBatch = () => {
        setShowBatchResults(false);
        setIsGenerating(false);
    };

    const handleSaveImageFromBatch = (imageData) => {
        // Add the image to our generated images list
        const newImages = [...generatedImages, imageData];
        setGeneratedImages(newImages);
        
        // Save to localStorage
        try {
            localStorage.setItem(`images:${entity.id}`, JSON.stringify(newImages));
        } catch (error) {
            console.warn('Failed to save images to localStorage:', error);
        }
    };

    // Show batch results page during generation
    if (showBatchResults) {
        const prompt = useEnhancedPrompt && enhancedPrompt ? enhancedPrompt : buildImagePrompt();
        const artStyle = getArtStyle();
        
        return (
            <BatchImageResults
                entity={entity}
                prompt={prompt}
                artStyle={artStyle}
                shape={settings.shape}
                batchSize={settings.batchSize}
                onBack={handleBackFromBatch}
                onRetry={() => setShowBatchResults(true)}
                onSaveImage={handleSaveImageFromBatch}
            />
        );
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

                            <div className="option-group">
                                <label htmlFor="artStyle">Art Style:</label>
                                <select 
                                    id="artStyle"
                                    value={settings.artStyle}
                                    onChange={(e) => updateSetting('artStyle', e.target.value)}
                                >
                                    {ART_STYLE_OPTIONS.map(option => (
                                        <option key={option.id} value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="option-group">
                                <label htmlFor="shape">Image Shape:</label>
                                <select 
                                    id="shape"
                                    value={settings.shape}
                                    onChange={(e) => updateSetting('shape', e.target.value)}
                                >
                                    <option value="portrait">Portrait (512×768)</option>
                                    <option value="square">Square (768×768)</option>
                                    <option value="landscape">Landscape (768×512)</option>
                                </select>
                            </div>

                            <div className="option-group">
                                <label htmlFor="batchSize">Batch Size:</label>
                                <select 
                                    id="batchSize"
                                    value={settings.batchSize}
                                    onChange={(e) => updateSetting('batchSize', parseInt(e.target.value))}
                                >
                                    <option value={1}>1 image</option>
                                    <option value={2}>2 images</option>
                                    <option value={3}>3 images</option>
                                    <option value={4}>4 images</option>
                                    <option value={5}>5 images</option>
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
                            <div className="prompt-content">
                                <div className="prompt-text">
                                    <strong>Prompt:</strong>
                                    <p>{buildImagePrompt() || 'Select options to see prompt preview...'}</p>
                                </div>
                                                               
                                <div className="prompt-enhancement">
                                    <div className="enhancement-header">
                                        <strong>🧠 Prompt Enhancement (Optional):</strong>
                                        <div className="enhancement-controls">
                                            <select 
                                                value={enhancementType}
                                                onChange={(e) => setEnhancementType(e.target.value)}
                                                disabled={isEnhancing}
                                            >
                                                <option value="normal">Normal prompt</option>
                                                <option value="random">Prompt with {'{Random|Curly}'} blocks</option>
                                            </select>
                                            <button 
                                                type="button"
                                                className="enhance-button"
                                                onClick={enhancePrompt}
                                                disabled={isEnhancing || !buildImagePrompt().trim()}
                                            >
                                                {isEnhancing ? 'Enhancing...' : '🧠 Enhance'}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {enhancedPrompt && (
                                        <div className="enhanced-prompt-section">
                                            <div className="enhanced-prompt-header">
                                                <label>
                                                    <input 
                                                        type="checkbox"
                                                        checked={useEnhancedPrompt}
                                                        onChange={(e) => setUseEnhancedPrompt(e.target.checked)}
                                                    />
                                                    Use Enhanced Prompt
                                                </label>
                                                <button 
                                                    type="button"
                                                    className="clear-enhanced-button"
                                                    onClick={() => {
                                                        setEnhancedPrompt('');
                                                        setUseEnhancedPrompt(false);
                                                    }}
                                                    title="Clear enhanced prompt"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                            <div className="enhanced-prompt-text">
                                                <strong>Enhanced Prompt:</strong>
                                                <p className={useEnhancedPrompt ? 'active-prompt' : 'inactive-prompt'}>
                                                    {enhancedPrompt}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="enhancement-info">
                                        <small>
                                            💡 {enhancedPrompt ? 
                                                (useEnhancedPrompt ? 'Enhanced prompt will be used for generation.' : 'Original prompt will be used.') :
                                                'Click "Enhance" to improve your prompt with Perchance\'s AI enhancement tool.'}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="generation-actions">
                        <button 
                            type="button" 
                            className="primary-button generate-button"
                            onClick={generateImage}
                            disabled={isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 
                             settings.batchSize > 1 ? `Generate ${settings.batchSize} Images` : 'Generate Image'}
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