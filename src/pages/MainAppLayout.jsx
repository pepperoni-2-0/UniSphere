import React from 'react';
import { useAppContext } from '../context/AppContext';

const MainAppLayout = () => {
  const { currentUser, logout, activeWorkspace } = useAppContext();

  return (
    <div className="main-content flex-center" style={{ flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
      <h1>Welcome to UniSphere, {currentUser?.name}!</h1>
      <p>Active Workspace: {activeWorkspace?.name || 'Loading...'}</p>
      
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '12px', marginTop: '2rem' }}>
        <h2>Dashboard Content Coming Soon</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
          This is a placeholder for the main application layout.
        </p>
      </div>

      <button className="btn-primary" onClick={logout} style={{ marginTop: '2rem' }}>
        Log Out
      </button>
    </div>
  );
};

export default MainAppLayout;
