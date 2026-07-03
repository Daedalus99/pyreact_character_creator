import { useState } from 'react';
import AppShell from './components/layout/AppShell';
import Titlebar from './components/layout/Titlebar';
import './styles/app.css';

function App() {
  const [activePage, setActivePage] = useState('chats');

  return (
    <>
      <Titlebar />
      <AppShell activePage={activePage} onChangePage={setActivePage} />
    </>
  );
}

export default App;
