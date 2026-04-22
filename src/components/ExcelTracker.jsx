import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Database, Globe, Loader2, ChevronLeft, ChevronRight, User, Briefcase, Eye, Mail, Phone, MapPin, Building } from 'lucide-react';
import './ExcelTracker.css';

const ExcelTracker = ({ onSave }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10); // SET TO 10 ROWS
  const [jumpPage, setJumpPage] = useState('1');

  const fetchResults = useCallback(async (searchQuery = query, pageNum = page) => {
    setIsLoading(true);
    try {
      let supabaseQuery = supabase
        .from('alumni')
        .select('*', { count: 'exact' });

      if (searchQuery && searchQuery.trim().length >= 3) {
        supabaseQuery = supabaseQuery.ilike('Nama Lulusan', `%${searchQuery.trim()}%`);
      }

      const from = (pageNum - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await supabaseQuery
        .range(from, to)
        .order('id', { ascending: true });

      if (error) throw error;

      const mappedResults = (data || []).map(row => ({
        id: row.id,
        nama: row['Nama Lulusan'],
        nim: row['NIM'],
        fakultas: row['Fakultas'],
        prodi: row['Program Studi'],
        tahun_lulus: row['Tanggal Lulus'] || row['Tahun Masuk'] || '-',
        linkedin: row.linkedin || '',
        instagram: row.instagram || '',
        facebook: row.facebook || '',
        tiktok: row.tiktok || '',
        email: row.email || '',
        no_hp: row.no_hp || '',
        tempat_kerja: row.tempat_kerja || '',
        alamat_kerja: row.alamat_kerja || '',
        posisi: row.posisi || '',
        jenis_pekerjaan: row.jenis_pekerjaan || '',
        sosmed_perusahaan: row.sosmed_perusahaan || '',
        akurasi: row.akurasi || 0,
        tracked: row.status === 'Tracked'
      }));

      setResults(mappedResults);
      if (count !== null) setTotal(count);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [query, page, limit]);

  useEffect(() => { fetchResults('', 1); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setJumpPage('1');
    fetchResults(query, 1);
  };

  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(total / limit);
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    setJumpPage(newPage.toString());
    fetchResults(query, newPage);
  };

  const handleJumpPage = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric
    setJumpPage(val);
    const num = parseInt(val);
    const totalPages = Math.ceil(total / limit);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      setPage(num);
      fetchResults(query, num);
    }
  };

  const handleTrackClick = async (item, index) => {
    setTrackingId(index);
    const isLocal = window.location.hostname === 'localhost';
    try {
      const url = isLocal ? 'http://localhost:8000/api/v1/track/serpapi' : '/proxy.php?action=track';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: item.nama })
      });
      
      const osintData = await response.json();
      const updatePayload = {
        linkedin: osintData.linkedin || null,
        instagram: osintData.instagram || null,
        facebook: osintData.facebook || null,
        tiktok: osintData.tiktok || null,
        email: osintData.email || null,
        no_hp: osintData.no_hp || null,
        tempat_kerja: osintData.tempat_kerja || null,
        alamat_kerja: osintData.alamat_kerja || null,
        posisi: osintData.posisi || null,
        jenis_pekerjaan: osintData.jenis_pekerjaan || null,
        sosmed_perusahaan: osintData.sosmed_perusahaan || null,
        akurasi: osintData.akurasi || 0,
        status: 'Tracked',
        last_tracked_at: new Date().toISOString()
      };

      await supabase.from('alumni').update(updatePayload).eq('id', item.id);
      
      const newResults = [...results];
      newResults[index] = { ...newResults[index], ...updatePayload, tracked: true };
      setResults(newResults);
    } catch (err) {
      console.error("Tracking failed:", err);
    } finally {
      setTrackingId(null);
    }
  };

  const getAccuracyColor = (score) => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#f59e0b';
    if (score > 0) return '#ef4444';
    return '#64748b';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="excel-tracker-container animate-fade-in">
      <div className="search-section glass-panel">
        <div className="section-header">
          <Database size={24} className="text-accent" />
          <div>
            <h2>Alumni Tracker</h2>
            <p>Sistem Pelacakan Alumni — 142.1K data</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-input-wrapper">
          <div className="main-search">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Cari nama lulusan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              Cari Data
            </button>
          </div>
        </form>
      </div>

      <div className="results-section glass-panel">
        <table className="excel-table">
          <thead>
            <tr>
              <th>id</th>
              <th>Nama Lulusan</th>
              <th>NIM</th>
              <th>Program Studi</th>
              <th>Fakultas</th>
              <th>Akurasi</th>
              <th>Pekerjaan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {results.map((item, index) => (
              <React.Fragment key={item.id}>
                <tr>
                  <td className="text-muted">{ (page - 1) * limit + index + 1 }</td>
                  <td><div className="alumni-name-cell"><span className="name">{item.nama}</span></div></td>
                  <td><span className="text-muted">{item.nim}</span></td>
                  <td>{item.prodi}</td>
                  <td>{item.fakultas}</td>
                  <td>
                    <div className="accuracy-cell">
                      <span className="accuracy-text" style={{ color: getAccuracyColor(item.akurasi) }}>{item.akurasi}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-muted">{item.posisi || '—'}</span>
                  </td>
                  <td>
                    {!item.tracked ? (
                      <button className="btn btn-sm btn-primary track-btn" onClick={() => handleTrackClick(item, index)} disabled={trackingId === index}>
                        {trackingId === index ? (<><Loader2 size={14} className="spinner-icon" /> Melacak...</>) : 'Lacak'}
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-outline" onClick={() => setExpandedRow(expandedRow === index ? null : index)}>
                        <Eye size={14} /> Detail
                      </button>
                    )}
                  </td>
                </tr>
                {expandedRow === index && (
                  <tr className="detail-row">
                    <td colSpan="8">
                      <div className="detail-grid animate-slide-down">
                        <div className="detail-section">
                          <h4><User size={14} /> Sosial Media</h4>
                          <div className="social-links-row">
                            {item.linkedin ? <a href={item.linkedin} target="_blank" rel="noreferrer" className="social-icon l">in</a> : <span className="text-muted" style={{fontSize:'0.8rem'}}>—</span>}
                            {item.instagram && <a href={item.instagram} target="_blank" rel="noreferrer" className="social-icon i">ig</a>}
                            {item.facebook && <a href={item.facebook} target="_blank" rel="noreferrer" className="social-icon f">fb</a>}
                            {item.tiktok && <a href={item.tiktok} target="_blank" rel="noreferrer" className="social-icon t">tt</a>}
                          </div>
                          <div className="detail-item" style={{marginTop:12}}><Mail size={13} /> <span className="detail-label">Email</span> <span className="detail-value">{item.email || '-'}</span></div>
                          <div className="detail-item"><Phone size={13} /> <span className="detail-label">No HP</span> <span className="detail-value">{item.no_hp || '-'}</span></div>
                        </div>
                        <div className="detail-section">
                          <h4><Briefcase size={14} /> Karir & Pekerjaan</h4>
                          <div className="detail-item"><span className="detail-label">Posisi</span> <span className="detail-value">{item.posisi || '-'}</span></div>
                          <div className="detail-item"><span className="detail-label">Tempat Kerja</span> <span className="detail-value">{item.tempat_kerja || '-'}</span></div>
                          <div className="detail-item"><MapPin size={13} /> <span className="detail-label">Alamat Kerja</span> <span className="detail-value">{item.alamat_kerja || '-'}</span></div>
                          <div className="detail-item"><span className="detail-label">Jenis</span> <span className={`job-badge badge-${(item.jenis_pekerjaan || 'swasta').toLowerCase()}`}>{item.jenis_pekerjaan || '-'}</span></div>
                        </div>
                        <div className="detail-section">
                          <h4><Building size={14} /> Info Perusahaan</h4>
                          <div className="detail-item"><span className="detail-label">Sosmed Perusahaan</span> <span className="detail-value">{item.sosmed_perusahaan || '-'}</span></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <div className="pagination-controls">
          <div className="pagination-info">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="pagination-buttons">
            <button className="page-btn" onClick={() => handlePageChange(page - 1)} disabled={page === 1}><ChevronLeft size={16} /></button>
            <div className="page-jump">
              Halaman <input type="text" value={jumpPage} onChange={handleJumpPage} />
            </div>
            <button className="page-btn" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelTracker;
