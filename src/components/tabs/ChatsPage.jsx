// ChatsPage renders the chat grid and new chat card.
import BasePage from './BasePage';
import CardGrid from '../panels/CardGrid';
import EntityCard from '../cards/EntityCard';

const sampleChats = [
    { id: '1', title: 'Murder Mystery', type: 'chat' },
    { id: '2', title: 'Dating Drama', type: 'chat' },
];

export default function ChatsPage() {
    return (
        <BasePage title="Chats" description="Manage your chat scenarios and launch conversations.">
            <CardGrid>
                <EntityCard isNew label="New Chat" />
                {sampleChats.map((chat) => (
                    <EntityCard key={chat.id} label={chat.title} />
                ))}
            </CardGrid>
        </BasePage>
    );
}
