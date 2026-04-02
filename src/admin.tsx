import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminPanel from './components/AdminPanel';
import './index.css';

// Standalone Admin Page
const AdminPage = () => {
  return (
    <div className="min-h-screen py-8 md:py-12 px-4 selection:bg-maple selection:text-bg">
      <div className="max-w-[1600px] mx-auto">
        <AdminWrapper />
      </div>
    </div>
  );
};

import { useUCSFData } from './hooks/useUCSFData';

const AdminWrapper = () => {
  const { houses, matches, schedule, settings, categories, refresh, loading, error } = useUCSFData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-maple/20 border-t-maple animate-spin" />
        <p className="font-ui text-xs font-bold uppercase tracking-widest text-maple">Loading Admin Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-glass p-12 text-center border-danger/20">
        <h2 className="text-2xl text-text mb-4">Database Connection Error</h2>
        <p className="text-muted mb-6 font-ui text-sm uppercase tracking-widest">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <AdminPanel 
      matches={matches} 
      houses={houses} 
      schedule={schedule}
      categories={categories}
      settings={settings}
      refresh={refresh} 
    />
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AdminPage />
  </React.StrictMode>
);
