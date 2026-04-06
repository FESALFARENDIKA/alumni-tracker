import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Target, TriangleAlert as AlertTriangle, CircleCheckBig as CheckCircle2, Users } from 'lucide-react';
import { kpiStats, yearStats, alumniData } from '../data/mockData';
import './DashboardStats.css';

const DashboardStats = () => {
  const totalAlumni = alumniData.length;
  const tracked = alumniData.filter(a => a.status === 'Tracked').length;
  const untracked = alumniData.filter(a => a.status === 'Untracked').length;
  const pending = alumniData.filter(a => a.status === 'Pending Validation').length;

  return (
    <div className="dashboard-stats animate-fade-in">
      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--accent-primary)', background: 'rgba(59, 130, 246, 0.15)' }}>
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <h3>Total Database</h3>
            <div className="kpi-value">{totalAlumni}</div>
          </div>
        </div>
        
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.15)' }}>
            <Target size={24} />
          </div>
          <div className="kpi-content">
            <h3>Tracked Successfully</h3>
            <div className="kpi-value text-success">{tracked}</div>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.15)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-content">
            <h3>Untracked / Lost</h3>
            <div className="kpi-value text-danger">{untracked}</div>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.15)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-content">
            <h3>Pending Validation</h3>
            <div className="kpi-value text-warning">{pending}</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-panel">
          <h3 className="chart-title">Data Discovery Ratio</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kpiStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {kpiStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-panel">
          <h3 className="chart-title">Tracking Progress per Graduation Year</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearStats}>
                <XAxis dataKey="year" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)', borderRadius: '8px' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Legend iconType="circle" />
                <Bar dataKey="tracked" name="Tracked" fill="var(--success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="untracked" name="Untracked" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
