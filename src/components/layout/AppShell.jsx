// AppShell is the top-level layout for the desktop app.
// It renders the sidebar, footer menu, and the selected page content.
import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import FooterMenu from "./FooterMenu";
import ChatsPage from "../tabs/ChatsPage";
import ChatSettingsForm from "../forms/ChatSettingsForm";
import ChatViewPage from "../tabs/ChatViewPage";
import CharactersPage from "../tabs/CharactersPage";
import UserPage from "../tabs/UserPage";
import ImageGenerationPage from "../tabs/ImageGenerationPage";
import SettingsPage from "../tabs/SettingsPage";
import PersonaWizard, {
  characterWizardConfig,
  userPersonaWizardConfig,
} from "../forms/PersonaWizard";
import { useConfirmDialog } from "../../state/ConfirmDialogContext";

const pageComponents = {
  chats: ChatsPage,
  characters: CharactersPage,
  user: UserPage,
  images: ImageGenerationPage,
  settings: SettingsPage,
};

export default function AppShell() {
  const [activePage, setActivePage] = useState("chats");
  const [navigationBlocker, setNavigationBlocker] = useState(null);
  const [chatSettingsReturnPage, setChatSettingsReturnPage] = useState("chats");
  const confirm = useConfirmDialog();

  const ActivePage = useMemo(
    () => pageComponents[activePage] ?? ChatsPage,
    [activePage],
  );

  async function requestPageChange(nextPage, options = {}) {
    if (nextPage === activePage) {
      return;
    }

    if (!options.force && navigationBlocker?.shouldBlock?.()) {
      const shouldLeave = await confirm({
        title: "Leave this page?",
        message:
          navigationBlocker.message ??
          "You have unsaved changes. Leave without saving?",
        confirmLabel: "Leave",
        cancelLabel: "Stay",
        variant: "danger",
      });

      if (!shouldLeave) {
        return;
      }
    }

    if (nextPage === "chat-settings") {
      setChatSettingsReturnPage(options.returnPage ?? "chats");
    }
    setNavigationBlocker(null);
    setActivePage(nextPage);
  }

  function renderActivePage() {
    if (activePage === "character-persona-wizard") {
      return (
        <PersonaWizard
          activePage={activePage}
          onChangePage={requestPageChange}
          setNavigationBlocker={setNavigationBlocker}
          config={characterWizardConfig}
        />
      );
    }

    if (activePage === "user-persona-wizard") {
      return (
        <PersonaWizard
          activePage={activePage}
          onChangePage={requestPageChange}
          setNavigationBlocker={setNavigationBlocker}
          config={userPersonaWizardConfig}
        />
      );
    }

    if (activePage === "chat-settings") {
      return (
        <ChatSettingsForm
          activePage={activePage}
          onChangePage={requestPageChange}
          setNavigationBlocker={setNavigationBlocker}
          returnPage={chatSettingsReturnPage}
        />
      );
    }

    if (activePage === "chat-view") {
      return (
        <ChatViewPage
          activePage={activePage}
          onChangePage={requestPageChange}
        />
      );
    }

    const ActivePage = pageComponents[activePage] ?? ChatsPage;

    return (
      <ActivePage activePage={activePage} onChangePage={requestPageChange} />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onChangePage={requestPageChange} />

      <main className="app-content">{renderActivePage()}</main>

      <FooterMenu activePage={activePage} onChangePage={requestPageChange} />
    </div>
  );
}
