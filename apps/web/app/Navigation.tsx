'use client';

import { useState } from 'react';

export function Navigation({ currentPage, setCurrentPage }: {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}) {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold">A/B Testing Dashboard</h1>
          
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                currentPage === 'home'
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-500'
              }`}
            >
              Home
            </button>
            
            <button
              onClick={() => setCurrentPage('experiments')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                currentPage === 'experiments'
                  ? 'bg-blue-800 text-white'
                  : 'text-blue-100 hover:bg-blue-500'
              }`}
            >
              All Experiments
            </button>
          </div>
        </div>

        <div className="text-sm text-blue-100">
          👤 User Dashboard
        </div>
      </div>
    </nav>
  );
}