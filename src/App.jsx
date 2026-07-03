import { useState } from 'react';
import AppShell from './components/layout/AppShell';
import './styles/app.css';

function App() {
  const [activePage, setActivePage] = useState('chats');

  return (
    <AppShell activePage={activePage} onChangePage={setActivePage} />
  );
}

export default App;
