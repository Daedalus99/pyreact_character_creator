import Titlebar from "./components/layout/Titlebar";
import AppShell from "./components/layout/AppShell";
import { AppDataProvider } from "./state/AppDataContext";
import "./styles/app.css";

export default function App() {
  return (
    <AppDataProvider>
      <Titlebar />
      <AppShell />
    </AppDataProvider>
  );
}
