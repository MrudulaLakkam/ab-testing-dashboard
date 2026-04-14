'use client';

import { useState } from 'react';

export function Sidebar({ currentPage, setCurrentPage }: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    { id: 'experiments', label: '🧪 Experiments', icon: '🧪' },
    { id: 'create', label: '➕ New Experiment', icon: '➕' },
    { id: 'analytics', label: '📈 Analytics', icon: '📈' },
    { id: 'settings', label: '⚙️ Settings', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-blue-900 text-white h-screen fixed left-0 top-0 shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold">AB Test Pro</h1>
        <p className="text-sm text-blue-300 mt-1">Statistical Testing</p>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors ${
              currentPage === item.id
                ? 'bg-blue-600 text-white'
                : 'text-blue-100 hover:bg-blue-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 w-full border-t border-blue-700 p-4">
        <div className="bg-blue-800 p-4 rounded-lg">
          <p className="text-sm font-semibold mb-2">Pro Tip 💡</p>
          <p className="text-xs text-blue-200">
            Run experiments with at least 100 samples per variant for reliable results.
          </p>
        </div>
      </div>
    </aside>
  );
}