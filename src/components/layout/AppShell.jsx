// AppShell is the top-level layout for the desktop app.
// It renders the sidebar, footer menu, and the selected page content.
import { useMemo } from 'react';
import Sidebar from './Sidebar';
import FooterMenu from './FooterMenu';
import ChatsPage from '../tabs/ChatsPage';
import CharactersPage from '../tabs/CharactersPage';
import ProfilesPage from '../tabs/ProfilesPage';
import ImageGenerationPage from '../tabs/ImageGenerationPage';
import SettingsPage from '../tabs/SettingsPage';

const pageComponents = {
    chats: ChatsPage,
    characters: CharactersPage,
    profiles: ProfilesPage,
    images: ImageGenerationPage,
    settings: SettingsPage,
};

export default function AppShell({ activePage, onChangePage }) {
    const ActivePage = useMemo(() => pageComponents[activePage] ?? ChatsPage, [activePage]);

    return (
        <div className="app-shell">
            <Sidebar activePage={activePage} onChangePage={onChangePage} />
            <main className="app-content">
                <ActivePage />
            </main>
            <FooterMenu activePage={activePage} onChangePage={onChangePage} />
        </div>
    );
}
