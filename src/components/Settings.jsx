import { useState } from 'react';
import { Settings, Shield, Database, Bell, Palette, Globe, Save, RotateCcw } from 'lucide-react';
import './Settings.css';

const defaultSettingsValues = {
  twoFactor: false,
  sessionTimeout: 30,
  dataRetention: 365,
  autoSync: true,
  batchSize: 100,
  dataBackup: true,
  emailNotif: true,
  pushNotif: true,
  weeklyReport: false,
  darkMode: true,
  compactView: false,
  animations: true,
  linkedinAPI: true,
  googleSync: false,
  slackNotif: false,
};

const SystemSettings = ({ onSave }) => {
  const [settings, setSettings] = useState({ ...defaultSettingsValues });
  const [saved, setSaved] = useState(false);

  const setVal = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setSaved(true);
    if (onSave) onSave();
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setSettings({ ...defaultSettingsValues });
  };

  const Toggle = ({ keyName }) => (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={settings[keyName]}
        onChange={(e) => setVal(keyName, e.target.checked)}
      />
      <span className="toggle-slider"></span>
    </label>
  );

  const NumberInput = ({ keyName, min = 1, max = 9999 }) => (
    <input
      type="number"
      value={settings[keyName]}
      onChange={(e) => setVal(keyName, Number(e.target.value))}
      className="setting-input"
      min={min}
      max={max}
    />
  );

  const settingsSections = [
    {
      id: 'system', icon: Shield,
      title: 'System Configuration',
      description: 'Keamanan dan preferensi sistem',
      items: [
        { label: 'Two-Factor Authentication', control: <Toggle keyName="twoFactor" /> },
        { label: 'Session Timeout (menit)', control: <NumberInput keyName="sessionTimeout" /> },
        { label: 'Data Retention Period (hari)', control: <NumberInput keyName="dataRetention" max={3650} /> },
      ]
    },
    {
      id: 'data', icon: Database,
      title: 'Data Management',
      description: 'Pengaturan database dan pemrosesan data',
      items: [
        { label: 'Auto-sync dengan sumber eksternal', control: <Toggle keyName="autoSync" /> },
        { label: 'Ukuran batch processing', control: <NumberInput keyName="batchSize" max={1000} /> },
        { label: 'Aktifkan backup data', control: <Toggle keyName="dataBackup" /> },
      ]
    },
    {
      id: 'notifications', icon: Bell,
      title: 'Notifications',
      description: 'Preferensi notifikasi dan peringatan',
      items: [
        { label: 'Notifikasi email untuk alumni baru', control: <Toggle keyName="emailNotif" /> },
        { label: 'Push notification review pending', control: <Toggle keyName="pushNotif" /> },
        { label: 'Laporan ringkasan mingguan', control: <Toggle keyName="weeklyReport" /> },
      ]
    },
    {
      id: 'appearance', icon: Palette,
      title: 'Appearance',
      description: 'Tema dan tampilan antarmuka',
      items: [
        { label: 'Dark Mode', control: <Toggle keyName="darkMode" /> },
        { label: 'Tampilan Ringkas (Compact View)', control: <Toggle keyName="compactView" /> },
        { label: 'Efek Animasi', control: <Toggle keyName="animations" /> },
      ]
    },
    {
      id: 'integration', icon: Globe,
      title: 'External Integrations',
      description: 'Koneksi layanan pihak ketiga',
      items: [
        { label: 'LinkedIn API Integration', control: <Toggle keyName="linkedinAPI" /> },
        { label: 'Google Workspace Sync', control: <Toggle keyName="googleSync" /> },
        { label: 'Slack Notifications', control: <Toggle keyName="slackNotif" /> },
      ]
    }
  ];

  return (
    <div className="settings-container animate-fade-in">
      <div className="settings-header">
        <Settings size={32} className="text-primary mb-2" />
        <h1>System Configuration</h1>
        <p>Kelola preferensi dan pengaturan sistem Alumni Tracker</p>
      </div>

      <div className="settings-grid">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="settings-section glass-panel">
              <div className="section-header">
                <div className="section-icon-wrap">
                  <Icon size={20} className="section-icon" />
                </div>
                <div>
                  <h3>{section.title}</h3>
                  <p className="text-muted">{section.description}</p>
                </div>
              </div>

              <div className="settings-items">
                {section.items.map((item, index) => (
                  <div key={index} className="setting-item">
                    <label className="setting-label">{item.label}</label>
                    <div className="setting-control">
                      {item.control}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="settings-actions">
        <button className="btn btn-outline" onClick={handleReset}>
          <RotateCcw size={16} /> Reset ke Default
        </button>
        <button className={`btn btn-primary ${saved ? 'btn-saved' : ''}`} onClick={handleSave}>
          <Save size={16} />
          {saved ? 'Tersimpan ✓' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;