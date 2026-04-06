import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardStats from './components/DashboardStats';
import AlumniTable from './components/AlumniTable';
import SearchAndTrack from './components/SearchAndTrack';
import ExcelTracker from './components/ExcelTracker';
import Login from './components/Login';
import Settings from './components/Settings';
import { CircleCheck as CheckCircle, CircleX as XCircle, Info } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [toasts, setToasts] = useState([]);

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    localStorage.setItem('isLoggedIn', 'true');
  };

  // Toast system
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
    showToast('🔴 Sesi telah berakhir. Logout berhasil.', 'info');
  };

  const getToastIcon = (type) => {
    if (type === 'success') return <CheckCircle size={18} />;
    if (type === 'danger') return <XCircle size={18} />;
    return <Info size={18} />;
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats onNavigate={setActiveTab} />;
      case 'alumni':
        return (
          <AlumniTable
            onTrack={(data) => {
              showToast(`🔍 Memulai tracking OSINT untuk ${data.name}...`, 'info');
            }}
            showAll={true}
          />
        );
      case 'search':
        return (
          <SearchAndTrack
            onSave={(msg, type) => showToast(msg, type)}
            onResult={(data) => {
              if (data && data.results_count > 0) {
                showToast(`🎯 Ditemukan ${data.results_count} kandidat untuk "${data.search_criteria?.nama}".`, 'success');
              }
            }}
          />
        );
      case 'excel':
        return <ExcelTracker onSave={(msg, type) => showToast(msg, type)} />;
      case 'settings':
        return <Settings onSave={() => showToast('⚙️ Pengaturan berhasil disimpan.', 'success')} />;
      default:
        return <DashboardStats onNavigate={setActiveTab} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              {getToastIcon(toast.type)}
              <span>{toast.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="app">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      <main className="main-content">
        <Topbar activeTab={activeTab} onNavigate={setActiveTab} />
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>

      {/* Toast Notification System */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {getToastIcon(toast.type)}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
