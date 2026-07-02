import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('Loading message...');
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/hello')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Backend unavailable.'));
  }, []);

  return (
    <main className="app-shell">
      <h1>Character Creator</h1>
      <p>{message}</p>
      <img src="/sample-image.svg" alt="Sample illustration" className="hero-image" />
      <button onClick={() => setCount((value) => value + 1)}>
        Clicked {count} times
      </button>
    </main>
  );
}

export default App;
