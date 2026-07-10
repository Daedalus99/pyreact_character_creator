// AppShell is the top-level layout for the desktop app.
// It renders the sidebar, footer menu, and the selected page content.
import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import FooterMenu from "./FooterMenu";
import ChatsPage from "../tabs/ChatsPage";
import CharactersPage from "../tabs/CharactersPage";
import ProfilesPage from "../tabs/ProfilesPage";
import ImageGenerationPage from "../tabs/ImageGenerationPage";
import SettingsPage from "../tabs/SettingsPage";
import CharacterWizard from "../forms/CharacterWizard";

const pageComponents = {
  chats: ChatsPage,
  characters: CharactersPage,
  profiles: ProfilesPage,
  images: ImageGenerationPage,
  settings: SettingsPage,
  "character-wizard": CharacterWizard,
};

export default function AppShell() {
  const [activePage, setActivePage] = useState("chats");

  const ActivePage = useMemo(
    () => pageComponents[activePage] ?? ChatsPage,
    [activePage],
  );

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onChangePage={setActivePage} />

      <main className="app-content">
        <ActivePage activePage={activePage} onChangePage={setActivePage} />
      </main>

      <FooterMenu activePage={activePage} onChangePage={setActivePage} />
    </div>
  );
}
