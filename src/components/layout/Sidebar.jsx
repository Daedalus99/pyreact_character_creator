// Sidebar renders the persistent left navigation icons for each main tab.
import IconButton from '../cards/IconButton';

const tabs = [
  { id: 'chats', label: 'Chats' },
  { id: 'characters', label: 'Characters' },
  { id: 'profiles', label: 'User' },
  { id: 'images', label: 'Images' },
  { id: 'settings', label: 'Settings' },
];

export default function Sidebar({ activePage, onChangePage }) {
  return (
    <aside className="sidebar">
      {tabs.map((tab) => (
        <IconButton
          key={tab.id}
          label={tab.label}
          active={activePage === tab.id}
          onClick={() => onChangePage(tab.id)}
        />
      ))}
    </aside>
  );
}
