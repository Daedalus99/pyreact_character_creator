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
  const [navigationBlocker, setNavigationBlocker] = useState(null);

  const ActivePage = useMemo(
    () => pageComponents[activePage] ?? ChatsPage,
    [activePage],
  );

  function requestPageChange(nextPage, options = {}) {
    if (nextPage === activePage) {
      return;
    }

    if (!options.force && navigationBlocker?.shouldBlock?.()) {
      const shouldLeave = window.confirm(
        navigationBlocker.message ?? "You have unsaved changes. Leave anyway?",
      );

      if (!shouldLeave) {
        return;
      }
    }

    setNavigationBlocker(null);
    setActivePage(nextPage);
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onChangePage={requestPageChange} />

      <main className="app-content">
        <ActivePage
          activePage={activePage}
          onChangePage={requestPageChange}
          setNavigationBlocker={setNavigationBlocker}
        />{" "}
      </main>

      <FooterMenu activePage={activePage} onChangePage={requestPageChange} />
    </div>
  );
}
