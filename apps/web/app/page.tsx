'use client';

import { useState } from 'react';
import { Navigation } from './Navigation';
import { ExperimentForm } from './ExperimentForm';
import { ExperimentsList } from './ExperimentsList';
import { ExperimentDetail } from './ExperimentDetail';

function HomePageContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null);

  const handleSelectExperiment = (id: string) => {
    setSelectedExperimentId(id);
    setCurrentPage('detail');
  };

  const handleBackFromDetail = () => {
    setCurrentPage('experiments');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Content */}
      <main className="py-12 px-8">
        {currentPage === 'home' && (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold text-gray-900 mb-4">
                Create & Manage A/B Tests
              </h2>
              <p className="text-xl text-gray-600">
                Run experiments with statistical rigor
              </p>
            </div>
            <ExperimentForm />
          </div>
        )}

        {currentPage === 'experiments' && (
          <div className="bg-white min-h-screen p-8 rounded-lg">
            <ExperimentsList onSelectExperiment={handleSelectExperiment} />
          </div>
        )}

        {currentPage === 'detail' && selectedExperimentId && (
          <div className="bg-white min-h-screen p-8 rounded-lg">
            <ExperimentDetail
              experimentId={selectedExperimentId}
              onBack={handleBackFromDetail}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePageContent;