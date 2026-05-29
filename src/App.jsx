import React from 'react';
import { useAppContext } from './context/AppContext';
import AuthScreen from './pages/AuthScreen';
import MainAppLayout from './pages/MainAppLayout';

function App() {
  const { currentUser } = useAppContext();

  return (
    <div className="app-container">
      {currentUser ? <MainAppLayout /> : <AuthScreen />}
    </div>
  );
}

export default App;
