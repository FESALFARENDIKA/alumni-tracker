import React, { useState } from 'react';
import { Radar, Lock, User, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // User-provided credentials
  const VALID_USER = "ffarenadmin229#";
  const VALID_PASS = "isaladmin992@";

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate auth check
    setTimeout(() => {
      if (username === VALID_USER && password === VALID_PASS) {
        onLogin(true);
      } else {
        setError('Kredensial tidak valid. Silakan periksa kembali.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="login-container">
      <div className="login-glass-panel">
        <div className="login-header">
          <div className="logo-glow">
            <Radar size={48} className="radar-icon" />
          </div>
          <h1>Alumni Tracker <span>v2.0</span></h1>
          <p>OSINT & Digital Discovery Environment</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label><User size={16} /> Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
            />
          </div>

          <div className="input-group">
            <label><Lock size={16} /> Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="login-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Mengautentikasi...' : 'Masuk Ke Sistem'}
          </button>
        </form>

        <div className="login-footer">
          <p className="disclaimer">
            <strong>DISCLAIMER:</strong> Pengumpulan data ini hanya untuk kepentingan pembelajaran. 
            Dilarang menyebarkan data untuk kepentingan apapun.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
