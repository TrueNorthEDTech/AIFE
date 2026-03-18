import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Compass, MessageSquareText, FileText, Home } from 'lucide-react';
import Overview from './pages/Overview';
import ChatFlow from './pages/ChatFlow';
import Report from './pages/Report';
import { ChatErrorBoundary } from './components/ChatErrorBoundary';

function App() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: Home },
    { path: '/chat', label: 'Glowie Chat', icon: MessageSquareText },
    { path: '/report', label: 'My Report', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-xl truncate">
            <Compass className="w-6 h-6 text-tn-core" />
            <span className="hidden sm:inline-block">True North | AIFE Prototype</span>
            <span className="sm:hidden">TN | AIFE</span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-tn-primary/10 text-tn-primary ring-1 ring-tn-primary/30 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline-block">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100/50 -z-10" />
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/chat" element={<ChatErrorBoundary><ChatFlow /></ChatErrorBoundary>} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
