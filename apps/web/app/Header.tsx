'use client';

import { Menu } from 'lucide-react';
import { LayoutDashboard, FlaskConical, Plus, BarChart3, Settings } from 'lucide-react';
import Image from 'next/image';

interface HeaderProps {
  onMenuClick: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function Header({ onMenuClick, currentPage, setCurrentPage }: HeaderProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'experiments', label: 'Experiments', icon: FlaskConical },
    { id: 'create', label: 'New Experiment', icon: Plus },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogoClick = () => {
    setCurrentPage('dashboard');
  };

  return (
    <header className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-6">
        {/* App Name - Clickable */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">AB</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AB Test Pro</h1>
          </div>
        </button>

        {/* Navigation Tabs - Desktop Only */}
        <div className="hidden md:flex items-center gap-1 flex-1 overflow-x-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
}
