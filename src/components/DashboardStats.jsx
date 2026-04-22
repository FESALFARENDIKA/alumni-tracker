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
      
      // 1. Fetch exact Excel stats from local server
      let totalExcel = 142100;
      let excelYears = {};
      
      try {
        const res = await fetch('http://localhost:8000/api/v1/excel/stats');
        if (res.ok) {
          const statsData = await res.json();
          totalExcel = statsData.total || 142100;
          excelYears = statsData.years || {};
        }
      } catch (err) {
        console.log("Failed to fetch exact excel stats, using estimates", err);
      }
      
      // 2. Fetch Tracked & Pending counts from Supabase accurately
      const { count: trackedCount, error: err1 } = await supabase
        .from('alumni')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Tracked');
        
      const { count: pendingCount, error: err2 } = await supabase
        .from('alumni')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending Validation');
        
      if (err1) console.error("Tracked count err:", err1);
      if (err2) console.error("Pending count err:", err2);

      const tracked = trackedCount || 0;
      const pending = pendingCount || 0;
      const untracked = totalExcel - tracked - pending;
      
      setStats({
        totalAlumni: totalExcel,
        tracked: tracked,
        untracked: untracked,
        pending: pending
      });
      
      const newKpiData = [
        { name: 'Pending', value: pending, color: '#f59e0b' },
        { name: 'Tracked', value: tracked, color: '#10b981' },
        { name: 'Untracked', value: untracked, color: '#ef4444' }
      ].filter(item => item.value > 0);
      
      setKpiData(newKpiData.length > 0 ? newKpiData : [{ name: 'No Data', value: 1, color: '#334155' }]);
      
      // 3. Fetch tracked/pending rows to group them by year
      const { data: supabaseData, error: err3 } = await supabase
        .from('alumni')
        .select('"Tanggal Lulus", "Tahun Masuk", status')
        .in('status', ['Tracked', 'Pending Validation']);
        
      const supabaseYears = {};
      
      if (supabaseData) {
        supabaseData.forEach(alumni => {
          let year = alumni['Tanggal Lulus'] || alumni['Tahun Masuk'] || 'Unknown';
          if (year && typeof year === 'string' && year.length >= 4) {
            const match = year.match(/\b(19|20)\d{2}\b/);
            if (match) year = match[0];
          }
          
          if (year && year !== '-' && year !== 'Unknown') {
            if (!supabaseYears[year]) supabaseYears[year] = { tracked: 0, pending: 0 };
            if (alumni.status === 'Tracked') supabaseYears[year].tracked++;
            else if (alumni.status === 'Pending Validation') supabaseYears[year].pending++;
          }
        });
      }
      
      // 4. Combine Excel Years with Supabase Years to get exact Untracked per year
      const combinedYears = {};
      
      Object.keys(excelYears).forEach(y => {
        combinedYears[y] = {
          year: y,
          total: excelYears[y],
          tracked: 0,
          pending: 0,
          untracked: excelYears[y]
        };
      });
      
      Object.keys(supabaseYears).forEach(y => {
        if (!combinedYears[y]) {
          combinedYears[y] = { year: y, total: 0, tracked: 0, pending: 0, untracked: 0 };
        }
        const t = supabaseYears[y].tracked;
        const p = supabaseYears[y].pending;
        combinedYears[y].tracked += t;
        combinedYears[y].pending += p;
        combinedYears[y].untracked = Math.max(0, combinedYears[y].total - combinedYears[y].tracked - combinedYears[y].pending);
      });
      
      const yearArray = Object.values(combinedYears)
        .sort((a, b) => parseInt(a.year) - parseInt(b.year))
        .filter(y => y.year >= '2000');
        
      // Limit to the most recent 15 years so the chart is readable
      setYearData(yearArray.slice(-15));
      
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
            <div className="kpi-value">{stats.totalAlumni.toLocaleString('id-ID')}</div>
          </div>
        </div>
        
        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.15)' }}>
            <Target size={24} />
          </div>
          <div className="kpi-content">
            <h3>Tracked Successfully</h3>
            <div className="kpi-value text-success">{stats.tracked.toLocaleString('id-ID')}</div>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.15)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="kpi-content">
            <h3>Untracked / Lost</h3>
            <div className="kpi-value text-danger">{stats.untracked.toLocaleString('id-ID')}</div>
          </div>
        </div>

        <div className="kpi-card glass-panel">
          <div className="kpi-icon-wrapper" style={{ color: 'var(--warning)', background: 'rgba(245, 158, 11, 0.15)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-content">
            <h3>Pending Validation</h3>
            <div className="kpi-value text-warning">{stats.pending.toLocaleString('id-ID')}</div>
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
                  <Bar dataKey="tracked" name="Tracked" fill="var(--success)" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="untracked" name="Untracked" fill="var(--danger)" radius={[4, 4, 0, 0]} stackId="a" />
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
