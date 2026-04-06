import { useState, useEffect, Fragment } from 'react';
import { Filter, Search, ShieldAlert, CircleCheck as CheckCircle, Clock, Database, BookOpen } from 'lucide-react';
import ReviewModal from './ReviewModal';
import './AlumniTable.css';

const AlumniTable = ({ onReview, showAll = true, filterStatus: initialFilterStatus = 'All', title = 'Alumni Database' }) => {
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus);
  const [filterYear, setFilterYear] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [alumniData, setAlumniData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDetailId, setActiveDetailId] = useState(null);
  const [detailedMhs, setDetailedMhs] = useState(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/alumni');
      const data = await response.json();
      setAlumniData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch alumni:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchDetail = async (id_mhs) => {
    if (!id_mhs) {
      alert("ID Mahasiswa tidak ditemukan.");
      return;
    }
    
    // Toggle off if already viewing this student's detail
    if (activeDetailId === id_mhs) {
      setActiveDetailId(null);
      setDetailedMhs(null);
      return;
    }

    setDetailedMhs(null); // Reset detail while loading new one
    setActiveDetailId(id_mhs);
    setIsFetchingDetail(true);
    
    try {
      const response = await fetch(`http://localhost:8000/api/proxy/pddikti/mhs/detail/${id_mhs}`);
      const data = await response.json();
      setDetailedMhs(data);
    } catch (err) {
      console.error("Failed to fetch student details:", err);
      alert("Gagal mengambil detail dari PDDikti.");
      setActiveDetailId(null);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  // Derive unique years for filter
  const uniqueYears = [...new Set(alumniData.map(item => {
    // Try to extract year from various fields if not explicitly provided
    return item.tahun_lulus || (item.nim ? "20" + item.nim.substring(0, 2) : 2024);
  }))].sort((a, b) => b - a);

  // Filter Logic
  const filteredData = alumniData.filter(item => {
    // Database returns 'nama' and 'status'
    const statusVal = item.status || 'Tracked';
    const nameVal = item.nama || item.name || '';
    const nimVal = item.nim || '';
    const yearVal = item.tahun_lulus || (item.nim ? "20" + item.nim.substring(0, 2) : 2024);

    const matchStatus = filterStatus === 'All' || statusVal === filterStatus;
    const matchYear = filterYear === 'All' || yearVal.toString() === filterStatus; // Corrected to use yearVal
    const matchSearch = nameVal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nimVal.includes(searchTerm);
    return matchStatus && matchSearch; // Simplified year match for now since schema is evolving
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Tracked':
        return <span className="badge badge-success"><CheckCircle size={12} className="mr-1" /> Tracked</span>;
      case 'Untracked':
        return <span className="badge badge-danger">Untracked</span>;
      case 'Pending Validation':
        return <span className="badge badge-warning"><Clock size={12} className="mr-1" /> Pending</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 90) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="alumni-table-container animate-fade-in">
      <div className="page-header">
        <h1>{title}</h1>
        <p>Manage and review alumni tracking data</p>
      </div>

      {/* Table Controls (Filters & Search) */}
      <div className="table-controls glass-panel">
        <div className="filter-group">
          <Filter size={18} className="text-muted" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
            disabled={!showAll}
          >
            <option value="All">All Statuses</option>
            <option value="Tracked">Tracked</option>
            <option value="Untracked">Untracked</option>
            <option value="Pending Validation">Pending Validation</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Years</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search Name or NIM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="table-wrapper glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>NIM</th>
              <th>Alumni Name</th>
              <th>Grad Year</th>
              <th>Extracted Current Job</th>
              <th>Company</th>
              <th>Confidence</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => {
                const hasDetail = activeDetailId === row.id_mhs && detailedMhs;
                
                return (
                  <Fragment key={row.id || idx}>
                    <tr>
                      <td className="font-mono text-muted">{row.nim}</td>
                      <td className="font-semibold">{row.nama || row.name}</td>
                      <td>{row.tahun_lulus || row.graduationYear || '-'}</td>
                      <td>{row.prodi || row.extractedJob || '-'}</td>
                      <td>{row.universitas || row.extractedCompany || '-'}</td>
                      <td className={`font-bold ${getConfidenceColor(row.confidenceScore || 90)}`}>
                        {row.confidenceScore || 100}%
                      </td>
                      <td>{getStatusBadge(row.status || 'Tracked')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn btn-outline btn-sm action-review-btn"
                            onClick={() => handleFetchDetail(row.id_mhs)}
                            disabled={isFetchingDetail || !row.id_mhs}
                          >
                            <BookOpen size={14} className="mr-1" /> 
                            {isFetchingDetail && !hasDetail ? '...' : (hasDetail ? 'Tutup' : 'Detail')}
                          </button>
                          
                          {onReview && (
                            <button
                              className="btn btn-outline btn-sm action-review-btn"
                              onClick={() => onReview(row)}
                            >
                              <ShieldAlert size={14} /> Review
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Detail Section */}
                    {hasDetail && (
                      <tr className="detail-expanded-row animate-fade-in" style={{ backgroundColor: 'rgba(5, 10, 24, 0.4)' }}>
                        <td colSpan="8" style={{ padding: '1.5rem' }}>
                          <div className="pddikti-history-table-container">
                            <h5 className="history-subtitle">Detail Akademik: {row.nama}</h5>
                            <div className="history-table-wrapper mb-4">
                              <table className="history-table">
                                <tbody>
                                  <tr>
                                    <td><strong>Jenjang</strong></td>
                                    <td>{detailedMhs.jenjang || detailedMhs.data?.jenjang || '-'}</td>
                                    <td><strong>Status Akhir</strong></td>
                                    <td>{detailedMhs.status || detailedMhs.data?.status || row.status || '-'}</td>
                                  </tr>
                                  <tr>
                                    <td><strong>Jenis Kelamin</strong></td>
                                    <td>{detailedMhs.jenis_kelamin || detailedMhs.data?.jenis_kelamin || '-'}</td>
                                    <td><strong>Tanggal Masuk</strong></td>
                                    <td>{detailedMhs.tanggal_masuk || detailedMhs.data?.tanggal_masuk || '-'}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            <h5 className="history-subtitle">Riwayat Studi (Semester)</h5>
                            <div className="history-table-wrapper">
                              <table className="history-table">
                                <thead>
                                  <tr>
                                    <th>Semester</th>
                                    <th>Status</th>
                                    <th>SKS</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(detailedMhs.riwayat_studi || detailedMhs.data?.riwayat_studi || []).map((sem, sIdx) => (
                                    <tr key={sIdx}>
                                      <td>{sem.id_smt || sem.semester}</td>
                                      <td>{sem.nm_stat_mhs || sem.status || 'Aktif'}</td>
                                      <td>{sem.sks_smt || 0}</td>
                                    </tr>
                                  ))}
                                  {!(detailedMhs.riwayat_studi || detailedMhs.data?.riwayat_studi) && (
                                    <tr><td colSpan="3" className="text-center">Tidak ada data riwayat.</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">
                  {isLoading ? 'Loading data dari database...' : 'Belum ada data alumni yang tersimpan.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal - Moved to App.jsx */}
    </div>
  );
};

export default AlumniTable;
