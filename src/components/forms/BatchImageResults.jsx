import React, { useState, useEffect, useRef } from 'react';
import BasePage from '../tabs/BasePage';
import '../../styles/batchResults.css';

export default function BatchImageResults({ 
    entity, 
    prompt, 
    artStyle, 
    shape, 
    batchSize, 
    onBack, 
    onRetry,
    onSaveImage 
}) {
    const [images, setImages] = useState([]);
    const [progress, setProgress] = useState('Starting...');
    const [isGenerating, setIsGenerating] = useState(false);
    const [completedCount, setCompletedCount] = useState(0);
    const isGeneratingRef = useRef(false);

    useEffect(() => {
        startGeneration();
    }, []);

    const startGeneration = async () => {
        // Prevent multiple simultaneous generations using ref for immediate tracking
        if (isGeneratingRef.current) {
            console.log('Generation already in progress, skipping...');
            return;
        }
        
        // Set ref immediately to prevent race conditions
        isGeneratingRef.current = true;

        // Initialize placeholder images
        const placeholders = Array.from({ length: batchSize }, (_, index) => ({
            id: `placeholder-${index}`,
            index,
            status: 'pending', // pending, generating, success, error
            imageDataUrl: null,
            error: null,
            message: 'Waiting...'
        }));
        
        setImages(placeholders);
        setProgress('Starting generation...');
        setIsGenerating(true);
        setCompletedCount(0);

        // Use sequential batch generation
        generateBatch();
    };

    const generateBatch = async () => {
        console.log('Starting batch generation for', batchSize, 'images');
        try {
            for (let i = 0; i < batchSize; i++) {
                console.log(`Starting generation of image ${i + 1}/${batchSize}`);
                setProgress(`Generating image ${i + 1} of ${batchSize}...`);
                
                // Update image status to generating
                setImages(prevImages => 
                    prevImages.map((img, index) => 
                        index === i ? { ...img, status: 'generating', message: `Generating image ${i + 1}...` } : img
                    )
                );

                console.log('Making fetch request to /api/image/generate with:', { prompt: prompt.substring(0, 100) + '...', artStyle, shape });
                const response = await fetch('http://127.0.0.1:5000/api/image/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt,
                        artStyle,
                        shape
                    })
                });

                console.log('Fetch request completed, status:', response.status);
                if (response.ok) {
                    console.log('Response is OK, parsing JSON...');
                    const result = await response.json();
                    console.log('JSON parsed successfully, updating image state');
                    // Update completed image
                    setImages(prevImages => 
                        prevImages.map((img, index) => 
                            index === i ? { 
                                ...img, 
                                status: 'success', 
                                imageDataUrl: result.image_data_url,
                                message: 'Complete!'
                            } : img
                        )
                    );
                    setCompletedCount(i + 1);
                    console.log(`Image ${i + 1} generated successfully`);
                } else {
                    console.error(`Image ${i + 1} generation failed with status:`, response.status);
                    
                    // Try to get the actual error message from the response
                    let errorMessage = 'Generation failed';
                    let errorDetails = '';
                    
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.error || errorMessage;
                        // Handle details that might be an array or string
                        if (Array.isArray(errorData.details)) {
                            errorDetails = errorData.details.join('; ');
                        } else {
                            errorDetails = errorData.details || '';
                        }
                        console.log('Error response data:', errorData);
                    } catch (jsonError) {
                        console.warn('Could not parse error response:', jsonError);
                    }
                    
                    // Update failed image with detailed error info
                    setImages(prevImages => 
                        prevImages.map((img, index) => 
                            index === i ? { 
                                ...img, 
                                status: 'error', 
                                error: errorMessage,
                                details: errorDetails,
                                message: errorMessage
                            } : img
                        )
                    );
                }
                console.log(`Completed processing image ${i + 1}/${batchSize}`);
            }
            
            console.log('All images processed, completing batch generation');
            setProgress('Generation complete!');
            setIsGenerating(false);
            isGeneratingRef.current = false;
        } catch (error) {
            console.error('Batch generation error:', error);
            setProgress('Generation failed');
            setIsGenerating(false);
            isGeneratingRef.current = false;
        }
    };

    const handleCancel = () => {
        setIsGenerating(false);
        isGeneratingRef.current = false;
        onBack();
    };

    const handleSave = (imageDataUrl) => {
        onSaveImage(imageDataUrl);
    };

    return (
        <BasePage title="Batch Image Generation" onBack={onBack}>
            <div className="batch-results-container">
                <div className="batch-header">
                    <div className="progress-info">
                        <h3>{progress}</h3>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{width: `${(completedCount / batchSize) * 100}%`}}
                            />
                        </div>
                        <span className="progress-text">{completedCount} of {batchSize} images completed</span>
                    </div>
                    
                    {isGenerating && (
                        <button className="cancel-btn" onClick={handleCancel}>
                            Cancel Generation
                        </button>
                    )}
                </div>

                <div className="batch-grid">
                    {images.map((image, index) => (
                        <div key={image.id} className={`batch-item status-${image.status}`}>
                            <div className="image-placeholder">
                                {image.status === 'success' && image.imageDataUrl ? (
                                    <img src={image.imageDataUrl} alt={`Generated ${index + 1}`} />
                                ) : (
                                    <div className="placeholder-content">
                                        {image.status === 'generating' && (
                                            <div className="loading-spinner"></div>
                                        )}
                                        {image.status === 'error' && (
                                            <div className="error-icon">❌</div>
                                        )}
                                        {image.status === 'pending' && (
                                            <div className="pending-icon">⏳</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div className="image-info">
                                <span className="image-number">Image {index + 1}</span>
                                <span className="image-status">{image.message}</span>
                                {image.status === 'error' && image.details && (
                                    <div className="error-details" title={typeof image.details === 'string' ? image.details : Array.isArray(image.details) ? image.details.join('; ') : ''}>
                                        <small>
                                            {typeof image.details === 'string' 
                                                ? (image.details.length > 60 ? image.details.substring(0, 60) + '...' : image.details)
                                                : Array.isArray(image.details) 
                                                    ? (image.details.join('; ').length > 60 ? image.details.join('; ').substring(0, 60) + '...' : image.details.join('; '))
                                                    : 'Error details unavailable'
                                            }
                                        </small>
                                    </div>
                                )}
                                {image.status === 'success' && (
                                    <button 
                                        className="save-btn"
                                        onClick={() => handleSave(image.imageDataUrl)}
                                    >
                                        Save
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {!isGenerating && (
                    <div className="batch-actions">
                        <button className="retry-btn" onClick={() => startGeneration()}>
                            Generate Again
                        </button>
                        <button className="back-btn" onClick={onBack}>
                            Back to Settings
                        </button>
                    </div>
                )}
            </div>
        </BasePage>
    );
}