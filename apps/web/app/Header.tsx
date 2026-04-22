'use client';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    // Header - Mobile Only (hidden on md and above)
    <header className="md:hidden bg-gradient-to-r from-blue-700 via-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        
        {/* Hamburger Menu */}
        <button 
          onClick={onMenuClick}
          className="p-2 hover:bg-blue-600 rounded-lg transition text-2xl"
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Logo & Title */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          <div className="text-xl"></div>
          <div>
            <h1 className="text-base font-bold">AB Test Pro</h1>
            <p className="text-xs text-blue-100">Statistical Testing</p>
          </div>
        </div>

        {/* Spacer for alignment */}
        <div className="w-10"></div>
      </div>

      {/* Bottom Border/Accent */}
      <div className="h-1 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400"></div>
    </header>
  );
}
