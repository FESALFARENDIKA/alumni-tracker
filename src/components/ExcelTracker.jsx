import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Database, Globe as Linkedin, Camera as Instagram, Share2 as Facebook, Share2 as Tiktok, Globe, ExternalLink, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import './ExcelTracker.css';

const ExcelTracker = ({ onSave }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10); // Reduced for speed

  const fetchResults = useCallback(async (searchQuery = query, pageNum = page) => {
    // Only search if query is long enough or empty (initial load)
    const isInitialLoad = !searchQuery;
    const isSearchValid = searchQuery && searchQuery.trim().length >= 3;

    if (!isInitialLoad && !isSearchValid) {
       return;
    }

    setIsLoading(true);
    try {
      // BASE QUERY: Only select necessary columns
      let supabaseQuery = supabase
        .from('alumni')
        .select('id, "Nama Lulusan", "NIM", "Fakultas", "Program Studi", "Tanggal Lulus", "Tahun Masuk", linkedin, instagram, facebook, tiktok', 
          { count: searchQuery.trim() ? 'planned' : null });

      // PERFORMANCE: Skip ILIKE if no search term (Direct range is 100x faster)
      if (searchQuery && searchQuery.trim().length >= 3) {
        supabaseQuery = supabaseQuery.ilike('Nama Lulusan', `%${searchQuery.trim()}%`);
      }

      const from = (pageNum - 1) * limit;
      const to = from + limit - 1;

      const { data, count, error } = await supabaseQuery
        .range(from, to)
        .order('id', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // MAP DATA back to UI keys
      const mappedResults = (data || []).map(row => ({
        nama: row['Nama Lulusan'],
        nim: row['NIM'],
        fakultas: row['Fakultas'],
        prodi: row['Program Studi'],
        tahun_lulus: row['Tanggal Lulus'] || row['Tahun Masuk'] || '-',
        osint: {
          linkedin: row.linkedin,
          instagram: row.instagram,
          facebook: row.facebook,
          tiktok: row.tiktok
        },
        tracked: !!(row.linkedin || row.instagram || row.facebook || row.tiktok)
      }));

      setResults(mappedResults);
      if (count !== null) setTotal(count);
    } catch (err) {
      console.error("Supabase Fetch failed:", err);
      onSave("Gagal mengambil data dari Supabase online", 'danger');
    } finally {
      setIsLoading(false);
    }
  }, [query, page, limit, onSave]);

  // Initial Load
  useEffect(() => {
    fetchResults('', 1);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResults(query, 1);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(total / limit)) return;
    setPage(newPage);
    fetchResults(query, newPage);
  };

  const handleTrack = async (item, index) => {
    setTrackingId(index);
    const API_BASE = '/proxy.php';
    
    try {
      const response = await fetch(`${API_BASE}?action=track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: item.nama,
          prodi: item.prodi,
          fakultas: item.fakultas
        })
      });
      
      if (!response.ok) throw new Error("Proxy error");
      const osintData = await response.json();

      // OPTIMIZATION: Save findings back to Supabase permanently
      if (osintData.results_found) {
        await supabase
          .from('alumni')
          .update({
            linkedin: osintData.linkedin,
            instagram: osintData.instagram,
            facebook: osintData.facebook,
            tiktok: osintData.tiktok,
            status: 'Tracked'
          })
          .eq('NIM', item.nim);
      }
      
      // Update local state to reflect results
      const newResults = [...results];
      newResults[index] = { ...newResults[index], osint: osintData, tracked: true };
      setResults(newResults);
      
      if (osintData.results_found) {
        onSave(`🎯 Data permanen disimpan untuk ${item.nama}`, 'success');
      } else {
        onSave(`⚠️ Tidak ditemukan profil baru untuk ${item.nama}`, 'info');
      }
    } catch (err) {
      console.error("Tracking via Proxy failed:", err);
      onSave("Gagal melacak OSINT (Masalah koneksi ke Proxy)", 'danger');
    } finally {
      setTrackingId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="excel-tracker-container animate-fade-in">
      <div className="search-section glass-panel">
        <div className="section-header">
          <Database size={24} className="text-accent" />
          <div>
            <h2>Excel Alumni Lookup</h2>
            <p>Telusuri basis data 142.000+ alumni (Source: Alumni 2000-2025.xlsx)</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="search-input-wrapper">
          <div className="main-search">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              placeholder="Masukkan nama alumni untuk mencari..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Cari Data'}
            </button>
          </div>
        </form>
      </div>

      <div className="results-section glass-panel animate-fade-in">
        {results.length > 0 ? (
          <>
            <table className="excel-table">
              <thead>
                <tr>
                  <th>Nama Alumni (Excel)</th>
                  <th>Prodi & Fakultas</th>
                  <th>Tanggal Lulus</th>
                  <th>Social Media Discovery</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="alumni-name-cell">
                        <span className="name">{item.nama}</span>
                        <span className="nim">{item.nim}</span>
                      </div>
                    </td>
                    <td>
                      <div className="prodi-cell">
                        <strong>{item.prodi}</strong>
                        <span>{item.fakultas}</span>
                      </div>
                    </td>
                    <td><span className="year-badge">{item.tahun_lulus}</span></td>
                    <td>
                      {item.tracked ? (
                        <div className="social-links-row">
                          {item.osint?.linkedin && (
                            <a href={item.osint.linkedin} target="_blank" rel="noreferrer" className="social-icon l" title="LinkedIn">
                              <Linkedin size={16} />
                            </a>
                          )}
                          {item.osint?.instagram && (
                            <a href={item.osint.instagram} target="_blank" rel="noreferrer" className="social-icon i" title="Instagram">
                              <Instagram size={16} />
                            </a>
                          )}
                          {item.osint?.facebook && (
                            <a href={item.osint.facebook} target="_blank" rel="noreferrer" className="social-icon f" title="Facebook">
                              <Facebook size={16} />
                            </a>
                          )}
                          {item.osint?.tiktok && (
                            <a href={item.osint.tiktok} target="_blank" rel="noreferrer" className="social-icon t" title="TikTok">
                              <Tiktok size={16} />
                            </a>
                          )}
                          {!item.osint?.results_found && <span className="no-data">Tidak ditemukan</span>}
                        </div>
                      ) : (
                        <span className="pending-discovery">Klik Track untuk mencari...</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className={`btn btn-sm ${item.tracked ? 'btn-outline' : 'btn-success'}`}
                        onClick={() => handleTrack(item, index)}
                        disabled={trackingId === index}
                      >
                        {trackingId === index ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <><Globe size={14} /> {item.tracked ? 'Cari Ulang' : 'Track'}</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination-controls">
              <div className="pagination-info">
                Menampilkan <strong>{(page - 1) * limit + 1} - {Math.min(page * limit, total)}</strong> dari <strong>{total.toLocaleString()}</strong> alumni
              </div>
              <div className="pagination-buttons">
                <button 
                  className="page-btn" 
                  onClick={() => handlePageChange(page - 1)} 
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <div className="page-indicator">
                  Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong>
                </div>
                <button 
                  className="page-btn" 
                  onClick={() => handlePageChange(page + 1)} 
                  disabled={page === totalPages || isLoading}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-results">
            {isLoading ? (
              <div className="loading-state">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p>Mengambil data alumni...</p>
              </div>
            ) : (
              <>
                <Database size={40} className="text-muted mb-2" />
                <p>Tidak ada hasil untuk "<strong>{query}</strong>" di database Excel.</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="collection-disclaimer">
         <p>🔍 <strong>Disclaimer OSINT:</strong> Pencarian dilakukan menggunakan SerpAPI berdasarkan data Excel. Hasil bervariasi tergantung ketersediaan profil publik.</p>
      </div>
    </div>
  );
};

export default ExcelTracker;
