import { useState } from "react";
import AppShell from "./components/layout/AppShell";
import Titlebar from "./components/layout/Titlebar";
import "./styles/app.css";

function App() {
  const [activePage, setActivePage] = useState("chats");
  const [chats, setChats] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [userPersonas, setUserPersonas] = useState([]);

  return (
    <>
      <Titlebar />
      <AppShell
        activePage={activePage}
        onChangePage={setActivePage}
        characters={characters}
        onCreateCharacter={(character) => {
          setCharacters((previousCharacters) => [
            ...previousCharacters,
            character,
          ]);
        }}
        chats={chats}
        setChats={setChats}
        userPersonas={userPersonas}
        setUserPersonas={setUserPersonas}
      />
    </>
  );
}

export default App;
