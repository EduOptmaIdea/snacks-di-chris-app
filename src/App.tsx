import React from 'react'; // Adicione esta linha
import './App.css';
import { SnackList } from './components/SnackList';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Snack Menu</h1>
      </header>
      <main>
        <SnackList />
      </main>
    </div>
  );
}

export default App;