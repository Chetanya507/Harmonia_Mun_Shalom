import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
  subtitle: string;
  announcement?: string;
  footerText?: string;
  schoolLogoUrl?: string;
  profile?: any;
}

export default function Layout({ children, activeTab, setActiveTab, title, subtitle, announcement, footerText, schoolLogoUrl, profile }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'events', label: 'Events', href: '#events' },
    { id: 'schedule', label: 'Schedule', href: '#schedule' },
    { id: 'leaderboards', label: 'Leaderboards', href: '#leaderboards' },
    { id: 'spreadsheet', label: 'Spreadsheet', href: '#spreadsheet' },
    { id: 'notices', label: 'Notices', href: '#notices' },
    { id: 'gallery', label: 'Gallery', href: '#gallery' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-maple selection:text-bg">
      <header className="fixed top-0 left-0 right-0 z-[110]">
        {announcement && (
          <div className="bg-maple text-bg py-2 px-6 text-center font-ui text-[10px] font-bold uppercase tracking-widest relative">
            {announcement}
          </div>
        )}
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 md:px-10 h-[62px] bg-bg/90 backdrop-blur-xl border-b border-border">
          <button 
            onClick={() => setActiveTab('home')}
            className="nav-logo flex items-center"
          >
            <img 
              src={schoolLogoUrl || "https://www.shalomhills.com/images/logo.png"} 
              alt="School Logo" 
              className="h-10 md:h-12 object-contain"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-8 list-none">
            {navItems.map((item, idx) => (
              <li key={idx}>
                {item.id === 'admin' ? (
                  <a
                    href="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "font-ui text-[13px] font-bold uppercase tracking-[1.5px] transition-colors",
                      activeTab === item.id ? "text-maple" : "text-muted hover:text-text"
                    )}
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.href.startsWith('#') && item.id === activeTab) {
                        const el = document.getElementById(item.href.substring(1));
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className={cn(
                      "font-ui text-[13px] font-bold uppercase tracking-[1.5px] transition-colors",
                      activeTab === item.id ? "text-maple" : "text-muted hover:text-text"
                    )}
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-text"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Nav */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden absolute top-full left-0 right-0 bg-bg border-b border-border p-6 flex flex-col gap-6 z-[101] shadow-2xl"
              >
                {navItems.map((item, idx) => (
                  item.id === 'admin' ? (
                    <a
                      key={idx}
                      href="/admin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "font-display text-4xl text-left tracking-wider uppercase",
                        activeTab === item.id ? "text-maple" : "text-muted"
                      )}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMenuOpen(false);
                        if (item.href.startsWith('#')) {
                          setTimeout(() => {
                            const el = document.getElementById(item.href.substring(1));
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                      className={cn(
                        "font-display text-4xl text-left tracking-wider uppercase",
                        activeTab === item.id ? "text-maple" : "text-muted"
                      )}
                    >
                      {item.label}
                    </button>
                  )
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Spacer for fixed header */}
        <div className={cn(
          announcement ? "h-[92px]" : "h-[62px]"
        )} />
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-bg border-t border-border py-12 px-6 md:px-10 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
          <img 
            src={schoolLogoUrl || "https://www.shalomhills.com/images/logo.png"} 
            alt="School Logo" 
            className="h-16 md:h-20 object-contain mb-4 opacity-80 hover:opacity-100 transition-opacity"
            referrerPolicy="no-referrer"
          />
          <div className="font-display text-3xl tracking-[4px] uppercase">
            {title.split(' ')[0]} <span>{title.split(' ')[1] || ''}</span>
          </div>
          <p className="font-ui text-[11px] font-bold uppercase tracking-[3px] text-muted">
            {subtitle}
          </p>
          <p className="font-ui text-[10px] font-bold uppercase tracking-widest text-muted/50 mt-4">
            {footerText || `© 2026 ${title}. All rights reserved.`}
          </p>
          
          <div className="w-full h-px bg-border my-4" />

          <div className="flex flex-col md:flex-row justify-between w-full gap-4 font-sans text-[12px] text-subtle">
            <span>© 2026 Shalom Hills International School | Made by Ean Kotadia, Hardik Batra and Tanush Kansal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
