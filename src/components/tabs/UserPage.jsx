// ProfilesPage is the user persona tab, same layout as character management.
import BasePage from './BasePage';
import CardGrid from '../panels/CardGrid';
import EntityCard from '../cards/EntityCard';

const sampleProfiles = [
    { id: 'u1', label: 'Alex', subtitle: 'Player Persona' },
];

export default function ProfilesPage() {
    return (
        <BasePage title="User Persona" description="Manage your own persona for chats.">
            <CardGrid>
                <EntityCard isNew label="New Persona" />
                {sampleProfiles.map((profile) => (
                    <EntityCard key={profile.id} label={profile.label} subtitle={profile.subtitle} />
                ))}
            </CardGrid>
        </BasePage>
    );
}
