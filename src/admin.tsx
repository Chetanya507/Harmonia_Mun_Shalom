import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminPanel from './components/AdminPanel';
import './index.css';
import { useUCSFData } from './hooks/useUCSFData';

const AdminWrapper = () => {
  const { houses, matches, schedule, settings, categories, notices, gallery, culturalResults, stagedChanges, profile, refresh, loading, isRefreshing } = useUCSFData();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-maple/20 border-t-maple animate-spin" />
        <p className="font-ui text-xs font-bold uppercase tracking-widest text-maple">Loading Admin Data...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isRefreshing && (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-bg-dark/80 backdrop-blur-md border border-maple/20 px-4 py-2 rounded-full shadow-lg">
          <div className="w-3 h-3 border-2 border-maple/20 border-t-maple rounded-full animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-maple">Updating...</span>
        </div>
      )}
      <AdminPanel 
        matches={matches} 
        houses={houses} 
        schedule={schedule}
        categories={categories}
        notices={notices}
        gallery={gallery}
        culturalResults={culturalResults}
        stagedChanges={stagedChanges}
        profile={profile}
        settings={settings}
        refresh={refresh} 
      />
    </div>
  );
};

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

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <AdminPage />
    </React.StrictMode>
  );
}
