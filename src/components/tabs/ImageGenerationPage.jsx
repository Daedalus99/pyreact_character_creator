// ImageGenerationPage is the landing tab for image generation workflows.
import BasePage from './BasePage';
import CardGrid from '../panels/CardGrid';
import EntityCard from '../cards/EntityCard';

const sampleItems = [
  { id: 'img1', label: 'Astra portrait', subtitle: 'Character preview' },
];

export default function ImageGenerationPage() {
  return (
    <BasePage title="Image Generation" description="Generate portraits and thumbnails for your characters.">
      <CardGrid>
        <EntityCard isNew label="New Image" />
        {sampleItems.map((item) => (
          <EntityCard key={item.id} label={item.label} subtitle={item.subtitle} />
        ))}
      </CardGrid>
    </BasePage>
  );
}
