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
    const [isGenerating, setIsGenerating] = useState(true);
    const [completedCount, setCompletedCount] = useState(0);
    const [currentEventSource, setCurrentEventSource] = useState(null);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        startGeneration();
        
        return () => {
            // Cleanup: close event source on component unmount
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    const startGeneration = async () => {
        // Prevent multiple simultaneous generations
        if (currentEventSource || isGenerating) {
            console.log('Generation already in progress, skipping...');
            return;
        }

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
                try {
                    for (let i = 0; i < batchSize; i++) {
                        setProgress(`Generating image ${i + 1} of ${batchSize}...`);
                        
                        // Update image status to generating
                        setImages(prevImages => 
                            prevImages.map((img, index) => 
                                index === i ? { ...img, status: 'generating', message: `Generating image ${i + 1}...` } : img
                            )
                        );
        
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
        
                        if (response.ok) {
                            const result = await response.json();
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
                        } else {
                            // Update failed image
                            setImages(prevImages => 
                                prevImages.map((img, index) => 
                                    index === i ? { 
                                        ...img, 
                                        status: 'error', 
                                        error: 'Generation failed',
                                        message: 'Error'
                                    } : img
                                )
                            );
                        }
                    }
                    
                    setProgress('Generation complete!');
                    setIsGenerating(false);
                } catch (error) {
                    console.error('Batch generation error:', error);
                    setProgress('Generation failed');
                    setIsGenerating(false);
                }
            };
        
            const handleProgressUpdate = (data) => {
                switch (data.type) {            case 'start':
                setProgress(data.message);
                break;
                
            case 'progress':
                setProgress(data.message);
                setImages(prev => prev.map((img, i) => 
                    i === data.imageIndex 
                        ? { ...img, status: 'generating', message: 'Generating...' }
                        : img
                ));
                break;
                
            case 'image_complete':
                setImages(prev => prev.map((img, i) => 
                    i === data.imageIndex 
                        ? { 
                            ...img, 
                            status: 'success', 
                            imageDataUrl: data.image.imageDataUrl,
                            imageId: data.image.imageId,
                            seed: data.image.seed,
                            width: data.image.width,
                            height: data.image.height,
                            message: 'Complete!'
                        }
                        : img
                ));
                setCompletedCount(prev => prev + 1);
                setProgress(data.message);
                break;
                
            case 'image_error':
                setImages(prev => prev.map((img, i) => 
                    i === data.imageIndex 
                        ? { 
                            ...img, 
                            status: 'error', 
                            error: data.error,
                            message: 'Failed'
                        }
                        : img
                ));
                setCompletedCount(prev => prev + 1);
                setProgress(data.message);
                break;
                
            case 'complete':
                setProgress(data.message);
                setIsGenerating(false);
                if (currentEventSource) {
                    currentEventSource.close();
                    setCurrentEventSource(null);
                }
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                }
                break;
                
            case 'error':
                setProgress(`Error: ${data.message}`);
                setIsGenerating(false);
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                }
                break;
        }
    };

    const fallbackToRegularAPI = async () => {
        // Fallback to the original batch API if SSE fails
        setProgress('Falling back to regular generation...');
        
        try {
            const response = await fetch('http://127.0.0.1:5000/api/image/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    artStyle,
                    shape,
                    batchSize
                })
            });

            const result = await response.json();

            if (result.success && result.images) {
                // Update images with results
                setImages(prev => prev.map((img, i) => {
                    const resultImg = result.images[i];
                    if (resultImg) {
                        return {
                            ...img,
                            status: 'success',
                            imageDataUrl: resultImg.imageDataUrl,
                            imageId: resultImg.imageId,
                            seed: resultImg.seed,
                            width: resultImg.width,
                            height: resultImg.height,
                            message: 'Complete!'
                        };
                    } else {
                        return {
                            ...img,
                            status: 'error',
                            error: 'Not generated',
                            message: 'Failed'
                        };
                    }
                }));
                
                setCompletedCount(result.images.length);
                setProgress(`Batch complete: ${result.images.length} of ${batchSize} images generated`);
            } else {
                setProgress(`Error: ${result.error || 'Generation failed'}`);
            }
        } catch (error) {
            setProgress(`Error: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const cancelGeneration = () => {
        if (currentEventSource) {
            currentEventSource.close();
            setCurrentEventSource(null);
        }
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        setIsGenerating(false);
        setProgress('Generation cancelled by user');
    };

    const retryFailedImages = () => {
        const failedImages = images.filter(img => img.status === 'error');
        if (failedImages.length > 0) {
            // Reset failed images to pending and restart generation for them
            setImages(prev => prev.map(img => 
                img.status === 'error' 
                    ? { ...img, status: 'pending', error: null, message: 'Retrying...' }
                    : img
            ));
            // Could implement selective retry logic here
        }
    };

    const saveImage = (image) => {
        if (onSaveImage && image.status === 'success') {
            const imageData = {
                id: crypto.randomUUID(),
                prompt,
                artStyle,
                url: image.imageDataUrl,
                createdAt: new Date().toISOString(),
                imageId: image.imageId,
                seed: image.seed,
                width: image.width,
                height: image.height,
                batchIndex: image.index + 1,
                batchTotal: batchSize
            };
            onSaveImage(imageData);
        }
    };

    return (
        <BasePage 
            title={`Batch Generation - ${entity.label}`} 
            description={`Generating ${batchSize} images...`}
        >
            <div className="batch-results">
                <div className="batch-header">
                    <div className="batch-progress">
                        <h3>{progress}</h3>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${(completedCount / batchSize) * 100}%` }}
                            ></div>
                        </div>
                        <p>{completedCount} of {batchSize} images completed</p>
                    </div>
                    
                    <div className="batch-controls">
                        {isGenerating ? (
                            <button 
                                className="cancel-button" 
                                onClick={cancelGeneration}
                            >
                                Cancel Generation
                            </button>
                        ) : (
                            <>
                                <button 
                                    className="retry-button" 
                                    onClick={() => startGeneration()}
                                >
                                    Regenerate All
                                </button>
                                <button 
                                    className="back-button" 
                                    onClick={onBack}
                                >
                                    Back to Settings
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="batch-grid">
                    {images.map((image) => (
                        <div key={image.id} className={`batch-card ${image.status}`}>
                            <div className="card-header">
                                <span className="image-number">Image {image.index + 1}</span>
                                <span className={`status-badge ${image.status}`}>
                                    {image.status === 'pending' && '⏳'}
                                    {image.status === 'generating' && '🔄'}
                                    {image.status === 'success' && '✅'}
                                    {image.status === 'error' && '❌'}
                                    {image.message}
                                </span>
                            </div>
                            
                            <div className="card-content">
                                {image.status === 'success' && image.imageDataUrl ? (
                                    <div className="image-container">
                                        <img 
                                            src={image.imageDataUrl} 
                                            alt={`Generated image ${image.index + 1}`}
                                            className="generated-image"
                                        />
                                        <div className="image-actions">
                                            <button 
                                                className="save-button"
                                                onClick={() => saveImage(image)}
                                            >
                                                Save Image
                                            </button>
                                        </div>
                                    </div>
                                ) : image.status === 'error' ? (
                                    <div className="error-placeholder">
                                        <div className="error-icon">💥</div>
                                        <p className="error-message">{image.error}</p>
                                        <button 
                                            className="retry-single-button"
                                            onClick={retryFailedImages}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : (
                                    <div className="loading-placeholder">
                                        <div className="loading-spinner"></div>
                                        <p>{image.message}</p>
                                    </div>
                                )}
                            </div>
                            
                            {image.status === 'success' && (
                                <div className="card-footer">
                                    <small>Seed: {image.seed}</small>
                                    <small>Size: {image.width}×{image.height}</small>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </BasePage>
    );
}