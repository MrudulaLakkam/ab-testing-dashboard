'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { ExperimentForm } from './ExperimentForm';
import { ExperimentsList } from './ExperimentsList';
import { ExperimentDetail } from './ExperimentDetail';
import { Analytics } from './Analytics';

function HomePage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);

  const handleSelectExperiment = (id: string) => {
    setSelectedExperimentId(id);
    setCurrentPage('detail');
  };

  const handleBackFromDetail = () => {
    setCurrentPage('experiments');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content */}
      <main className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          {currentPage === 'dashboard' && <Dashboard />}
          
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
              <h1 className="text-4xl font-bold text-gray-900 mb-6">Settings</h1>
              <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
                <p className="text-gray-600 text-lg">Settings page coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default HomePage;