import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  title: string;
  subtitle: string;
  announcement?: string;
  footerText?: string;
}

export default function Layout({ children, activeTab, setActiveTab, title, subtitle, announcement, footerText }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'houses', label: 'Houses', href: '#houses' },
    { id: 'matches', label: 'Matches', href: '#matches' },
    { id: 'schedule', label: 'Schedule', href: '#schedule' },
    { id: 'register', label: 'Register', href: '#register' },
    { id: 'gallery', label: 'Gallery', href: '#gallery' },
    { id: 'brochure', label: 'Brochure', href: '#brochure' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text selection:bg-maple selection:text-bg">
      {announcement && (
        <div className="bg-maple text-bg py-2 px-6 text-center font-ui text-[10px] font-bold uppercase tracking-widest z-[110] relative">
          {announcement}
        </div>
      )}
      {/* Navigation */}
      <nav className={cn(
        "fixed left-0 right-0 z-[100] flex items-center justify-between px-6 md:px-10 h-[62px] bg-bg/90 backdrop-blur-xl border-b border-border",
        announcement ? "top-[30px]" : "top-0"
      )}>
        <button 
          onClick={() => setActiveTab('home')}
          className="nav-logo"
        >
          UCSF <span>2026</span>
        </button>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {navItems.map((item, idx) => (
            <li key={idx}>
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
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute top-[62px] left-0 right-0 bg-bg border-b border-border p-6 flex flex-col gap-6 z-[101]"
          >
            {navItems.map((item, idx) => (
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
            ))}
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-[62px]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-bg border-t border-border py-12 px-6 md:px-10 text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
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
            <span>© 2026 Shalom Hills International School</span>
            <span>Built by <a href="#" className="text-maple hover:underline">Ean Kotadia</a> — Class 10E | UCSF Project</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
