'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { ExperimentForm } from './ExperimentForm';
import { ExperimentsList } from './ExperimentsList';
import { ExperimentDetail } from './ExperimentDetail';
import { Analytics } from './Analytics';

function HomePage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectExperiment = (id: string) => {
    setSelectedExperimentId(id);
    setCurrentPage('detail');
  };

  const handleBackFromDetail = () => {
    setCurrentPage('experiments');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header - Mobile Only */}
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto w-full">
          <div className="p-4 md:p-8">
            {currentPage === 'dashboard' && (
              <Dashboard 
                onNewExperiment={() => setCurrentPage('create')}
                onViewExperiments={() => setCurrentPage('experiments')}
                onSeeReports={() => setCurrentPage('analytics')}
                onSelectExperiment={handleSelectExperiment}
              />
            )}
            
            {currentPage === 'create' && <ExperimentForm />}
            
            {currentPage === 'experiments' && (
              <ExperimentsList onSelectExperiment={handleSelectExperiment} />
            )}
            
            {currentPage === 'detail' && selectedExperimentId && (
              <ExperimentDetail
                experimentId={selectedExperimentId}
                onBack={handleBackFromDetail}
              />
            )}
            
            {currentPage === 'analytics' && <Analytics />}

            {currentPage === 'settings' && (
              <div className="max-w-4xl">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Settings</h1>
                <div className="bg-white p-6 md:p-8 rounded-lg shadow border border-gray-200">
                  <p className="text-gray-600 text-lg">Settings page coming soon...</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default HomePage;
