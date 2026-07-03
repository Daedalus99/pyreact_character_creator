// CharactersPage shows the character collection and new character action.
import BasePage from './BasePage';
import CardGrid from '../panels/CardGrid';
import EntityCard from '../cards/EntityCard';

const sampleCharacters = [
  { id: 'c1', label: 'Astra', subtitle: 'Space Bard' },
  { id: 'c2', label: 'Nyx', subtitle: 'Shadow Duelist' },
];

export default function CharactersPage() {
  return (
    <BasePage title="Characters" description="Create and edit character personas for roleplay.">
      <CardGrid>
        <EntityCard isNew label="New Character" />
        {sampleCharacters.map((character) => (
          <EntityCard key={character.id} label={character.label} subtitle={character.subtitle} />
        ))}
      </CardGrid>
    </BasePage>
  );
}
