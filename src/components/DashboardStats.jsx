import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Target, TriangleAlert as AlertTriangle, CircleCheckBig as CheckCircle2, Users } from 'lucide-react';
import './DashboardStats.css';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalAlumni: 0,
    tracked: 0,
    untracked: 0,
    pending: 0
  });
  
  const [kpiData, setKpiData] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('alumni')
        .select('id, status, "Tanggal Lulus", "Tahun Masuk"');

      if (error) throw error;
      
      const alumniList = data || [];
      
      let trackedCount = 0;
      let untrackedCount = 0;
      let pendingCount = 0;
      
      const yearMap = {};
      
      alumniList.forEach(alumni => {
        const stat = alumni.status || 'Untracked';
        if (stat === 'Tracked') trackedCount++;
        else if (stat === 'Pending Validation') pendingCount++;
        else untrackedCount++;
        
        let year = alumni['Tanggal Lulus'] || alumni['Tahun Masuk'] || 'Unknown';
        if (year && typeof year === 'string' && year.length >= 4) {
          const match = year.match(/\b(19|20)\d{2}\b/);
          if (match) {
            year = match[0];
          }
        }
        
        if (year && year !== '-' && year !== 'Unknown') {
          if (!yearMap[year]) yearMap[year] = { year, tracked: 0, untracked: 0 };
          if (stat === 'Tracked') yearMap[year].tracked++;
          else yearMap[year].untracked++;
        }
      });
      
      setStats({
        totalAlumni: alumniList.length,
        tracked: trackedCount,
        untracked: untrackedCount,
        pending: pendingCount
      });
      
      const newKpiData = [
        { name: 'Pending', value: pendingCount, color: '#f59e0b' },
        { name: 'Tracked', value: trackedCount, color: '#10b981' },
        { name: 'Untracked', value: untrackedCount, color: '#ef4444' }
      ].filter(item => item.value > 0);
      
      setKpiData(newKpiData.length > 0 ? newKpiData : [{ name: 'No Data', value: 1, color: '#334155' }]);
      
      const yearArray = Object.values(yearMap).sort((a, b) => parseInt(a.year) - parseInt(b.year));
      setYearData(yearArray.slice(-10));
      
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Memuat ringkasan data alumni...</div>;
  }

  return (
    <div className="dashboard-stats animate-fade-in">
      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--accent-primary)', background: 'rgba(59, 130, 246, 0.15)' }}>
            <Users size={24} />
          </div>
          <div className="kpi-content">
            <h3>Total Database</h3>
            <div className="kpi-value">{stats.totalAlumni}</div>
          </div>
        </div>
        
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.15)' }}>
            <Target size={24} />
          </div>
          <div className="kpi-content">
            <h3>Tracked Successfully</h3>
            <div className="kpi-value text-success">{stats.tracked}</div>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.15)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-content">
            <h3>Untracked / Lost</h3>
            <div className="kpi-value text-danger">{stats.untracked}</div>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.15)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-content">
            <h3>Pending Validation</h3>
            <div className="kpi-value text-warning">{stats.pending}</div>
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
                  data={kpiData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {kpiData.map((entry, index) => (
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
            {yearData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearData}>
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
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                Belum ada data tahun kelulusan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
