'use client';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ currentPage, setCurrentPage, isOpen = false, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'experiments', label: 'Experiments', icon: '🧪' },
    { id: 'create', label: 'New Experiment', icon: '➕' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    onClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 md:hidden z-30 top-16"
          aria-label="Close menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-16 md:top-0 h-[calc(100vh-4rem)] md:h-full w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white p-6 transform transition-transform md:translate-x-0 z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Desktop Logo - Only shows on desktop */}
        <div className="hidden md:block mb-8">
          <h1 className="text-2xl font-bold">AB Test Pro</h1>
          <p className="text-blue-200 text-sm">Statistical Testing</p>
        </div>

        {/* Menu Items */}
        <nav className="space-y-2 mb-24 md:mb-0">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-colors text-sm md:text-base ${
                currentPage === item.id
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-100 hover:bg-blue-600'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Pro Tip */}
        <div className="absolute bottom-6 left-6 right-6 bg-blue-600 rounded-lg p-4">
          <p className="text-sm font-semibold mb-2">💡 Pro Tip</p>
          <p className="text-xs text-blue-100">
            Run experiments with at least 100 samples per variant for reliable results.
          </p>
        </div>
      </aside>
    </>
  );
}
