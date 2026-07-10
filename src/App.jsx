import Titlebar from "./components/layout/Titlebar";
import AppShell from "./components/layout/AppShell";
import { AppDataProvider } from "./state/AppDataContext";
import "./styles/app.css";
import { ConfirmDialogProvider } from "./state/ConfirmDialogContext";

export default function App() {
  return (
    <AppDataProvider>
      <ConfirmDialogProvider>
        <Titlebar />
        <AppShell />
      </ConfirmDialogProvider>
    </AppDataProvider>
  );
}
