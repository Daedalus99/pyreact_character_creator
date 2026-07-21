import { useState } from 'react';
import BasePage from './BasePage';
import CardGrid from '../panels/CardGrid';
import EntityCard from '../cards/EntityCard';
import ImageGenerationSettings from '../forms/ImageGenerationSettings';
import { useAppData } from '../../state/AppDataContext';

export default function ImageGenerationPage() {
    const { characters, chats, userPersonas } = useAppData();
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [selectedEntityType, setSelectedEntityType] = useState(null);

    if (selectedEntity) {
        return (
            <ImageGenerationSettings
                entity={selectedEntity}
                entityType={selectedEntityType}
                onBack={() => {
                    setSelectedEntity(null);
                    setSelectedEntityType(null);
                }}
            />
        );
    }

    function selectEntity(entity, type) {
        setSelectedEntity(entity);
        setSelectedEntityType(type);
    }

    return (
        <BasePage title="Image Generation" description="Select a character, chat, or user persona to generate images for.">
            <div className="image-generation-sections">
                <section className="entity-section">
                    <h2>Characters</h2>
                    <CardGrid>
                        {characters.entities.map((character) => (
                            <EntityCard
                                key={character.id}
                                label={character.label}
                                subtitle={character.subtitle || "Character"}
                                onClick={() => selectEntity(character, 'character')}
                                imageUrl={character.imageUrl}
                            />
                        ))}
                        {characters.entities.length === 0 && (
                            <div className="empty-message">
                                <p>No characters available. Create characters first to generate images for them.</p>
                            </div>
                        )}
                    </CardGrid>
                </section>

                <section className="entity-section">
                    <h2>User Personas</h2>
                    <CardGrid>
                        {userPersonas.entities.map((persona) => (
                            <EntityCard
                                key={persona.id}
                                label={persona.label}
                                subtitle={persona.subtitle || "User Persona"}
                                onClick={() => selectEntity(persona, 'userPersona')}
                                imageUrl={persona.imageUrl}
                            />
                        ))}
                        {userPersonas.entities.length === 0 && (
                            <div className="empty-message">
                                <p>No user personas available. Create user personas first to generate images for them.</p>
                            </div>
                        )}
                    </CardGrid>
                </section>

                <section className="entity-section">
                    <h2>Chats</h2>
                    <CardGrid>
                        {chats.entities.map((chat) => (
                            <EntityCard
                                key={chat.id}
                                label={chat.label}
                                subtitle={chat.subtitle || "Chat"}
                                onClick={() => selectEntity(chat, 'chat')}
                                imageUrl={chat.imageUrl}
                            />
                        ))}
                        {chats.entities.length === 0 && (
                            <div className="empty-message">
                                <p>No chats available. Create chats first to generate thumbnails for them.</p>
                            </div>
                        )}
                    </CardGrid>
                </section>
            </div>
        </BasePage>
    );
}
