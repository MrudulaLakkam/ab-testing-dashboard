'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { ExperimentsList } from './ExperimentsList';
import { ExperimentForm } from './ExperimentForm';
import { ExperimentDetail } from './ExperimentDetail';
import { Analytics } from './Analytics';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);

  const handleNewExperiment = () => {
    setCurrentPage('create');
  };

  const handleViewExperiments = () => {
    setCurrentPage('experiments');
  };

  const handleSeeReports = () => {
    setCurrentPage('analytics');
  };

  const handleSelectExperiment = (id: string) => {
    setSelectedExperimentId(id);
    setCurrentPage('detail');
  };

  const handleBackFromDetail = () => {
    setSelectedExperimentId(null);
    setCurrentPage('experiments');
  };

  const handleCreateExperiment = () => {
    setCurrentPage('experiments');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with Navigation */}
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Mobile Menu Dropdown */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {currentPage === 'dashboard' && (
          <Dashboard
            onNewExperiment={handleNewExperiment}
            onViewExperiments={handleViewExperiments}
            onSeeReports={handleSeeReports}
            onSelectExperiment={handleSelectExperiment}
          />
        )}

        {currentPage === 'experiments' && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <ExperimentsList onSelectExperiment={handleSelectExperiment} />
          </div>
        )}

        {currentPage === 'create' && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <ExperimentForm />
          </div>
        )}

        {currentPage === 'detail' && selectedExperimentId && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <ExperimentDetail experimentId={selectedExperimentId} onBack={handleBackFromDetail} />
          </div>
        )}

        {currentPage === 'analytics' && (
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            <Analytics />
          </div>
        )}
      </main>
    </div>
  );
}
