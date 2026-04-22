import React from 'react';
import { Radar, Users, Search, LogOut, Database } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'excel', icon: Database, label: 'Alumni Tracker' },
    { id: 'search', icon: Search, label: 'Track Pendidikan (PDDIKTI)' },
    { id: 'dashboard', icon: Radar, label: 'Radar Board' },
    { id: 'alumni', icon: Users, label: 'Hasil Tracking' }
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <div className="logo-icon">
          <Radar size={24} color="var(--accent-primary)" />
        </div>
        <div className="logo-text">
          <span className="bold">Alumni</span> Tracker
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
              {isActive && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item text-danger" onClick={onLogout}>
          <LogOut size={20} className="nav-icon" />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
