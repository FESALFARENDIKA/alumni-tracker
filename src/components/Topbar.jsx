import { useState } from 'react';
import { Bell, Search, User, X } from 'lucide-react';
import './Topbar.css';

const pageTitles = {
  dashboard: { title: 'Radar Board', subtitle: 'Ringkasan sistem pelacakan alumni secara real-time' },
  alumni: { title: 'Alumni Database', subtitle: 'Kelola dan verifikasi data pelacakan alumni' },
  search: { title: 'OSINT Search & Track', subtitle: 'Lacak alumni menggunakan sumber data publik' },
  settings: { title: 'Konfigurasi Sistem', subtitle: 'Kelola preferensi dan pengaturan sistem' },
};

const Topbar = ({ activeTab, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const page = pageTitles[activeTab] || pageTitles.dashboard;

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Navigate to alumni tab with search intent
      onNavigate('alumni');
      setSearchQuery('');
    }
  };

  const notifications = [
    { id: 1, text: '3 alumni baru memerlukan verifikasi manual.', time: '10 menit lalu', unread: true },
    { id: 2, text: 'Tracking OSINT selesai untuk batch angkatan 2022.', time: '1 jam lalu', unread: true },
    { id: 3, text: 'API PDDikti mengalami pembatasan sementara.', time: '2 jam lalu', unread: false },
  ];

  return (
    <header className="topbar">
      <div className="topbar-page-info">
        <h2 className="topbar-title">{page.title}</h2>
        <span className="topbar-subtitle">{page.subtitle}</span>
      </div>

      <div className="topbar-right">
        {/* Global Search */}
        <div className="topbar-search glass-panel">
          <Search size={16} className="search-icon-top" />
          <input
            type="text"
            placeholder="Cari alumni berdasarkan Nama atau NIM..."
            className="topbar-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="notif-wrapper">
          <button
            className={`action-btn ${notifOpen ? 'active' : ''}`}
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifikasi"
          >
            <Bell size={20} />
            <span className="notification-badge">{notifications.filter(n => n.unread).length}</span>
          </button>

          {notifOpen && (
            <div className="notif-dropdown glass-panel">
              <div className="notif-header">
                <span>Notifikasi</span>
                <button className="mark-all-read" onClick={() => setNotifOpen(false)}>Tutup</button>
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                  <p className="notif-text">{n.text}</p>
                  <span className="notif-time">{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="profile-container glass-panel">
          <div className="profile-info">
            <span className="profile-name">Admin Pusat</span>
            <span className="profile-role">Superuser</span>
          </div>
          <div className="profile-avatar">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
