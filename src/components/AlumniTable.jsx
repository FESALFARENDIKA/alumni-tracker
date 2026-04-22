import { supabase } from '../supabaseClient';
import { useState, useEffect, Fragment } from 'react';
import { Filter, Search, CheckCircle, Database, Eye, User, Briefcase, Mail, Phone, MapPin, Building, ChevronLeft, ChevronRight } from 'lucide-react';
import './AlumniTable.css';

const AlumniTable = ({ onTrack, showAll = true, title = 'Hasil Tracking' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [alumniData, setAlumniData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => { fetchTracked('', 1); }, []);

  const fetchTracked = async (search = '', pageNum = 1) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('alumni')
        .select('*', { count: 'exact' })
        .eq('status', 'Tracked');

      if (search && search.trim().length >= 2) {
        query = query.ilike('Nama Lulusan', `%${search.trim()}%`);
      }

      const from = (pageNum - 1) * limit;
      const { data, count, error } = await query
        .range(from, from + limit - 1)
        .order('last_tracked_at', { ascending: false });

      if (error) throw error;

      setAlumniData((data || []).map(row => ({
        id: row.id,
        nama: row['Nama Lulusan'],
        nim: row['NIM'],
        prodi: row['Program Studi'],
        fakultas: row['Fakultas'],
        tahun_lulus: row['Tanggal Lulus'] || '-',
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
        last_tracked_at: row.last_tracked_at || ''
      })));
      if (count !== null) setTotal(count);
    } catch (err) {
      console.error("Fetch tracked alumni failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTracked(searchTerm, 1);
  };

  const handlePageChange = (newPage) => {
    const totalPages = Math.ceil(total / limit);
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    fetchTracked(searchTerm, newPage);
  };

  const getAccuracyColor = (score) => {
    if (score >= 70) return '#22c55e';
    if (score >= 40) return '#f59e0b';
    if (score > 0) return '#ef4444';
    return '#64748b';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="alumni-table-container animate-fade-in">
      <div className="page-header">
        <h1>{title}</h1>
        <p>Menampilkan {total} alumni yang sudah berhasil dilacak</p>
      </div>

      <div className="table-controls glass-panel">
        <form onSubmit={handleSearch} className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Cari nama alumni yang sudah dilacak..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-sm btn-primary">Cari</button>
        </form>
      </div>

      <div className="table-wrapper glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama Lulusan</th>
              <th>NIM</th>
              <th>Prodi</th>
              <th>Akurasi</th>
              <th>Posisi/Pekerjaan</th>
              <th>Sosmed</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="8" className="empty-state">Memuat data...</td></tr>
            ) : alumniData.length === 0 ? (
              <tr><td colSpan="8" className="empty-state">Belum ada alumni yang dilacak. Gunakan Alumni Tracker untuk mulai melacak.</td></tr>
            ) : (
              alumniData.map((row, idx) => (
                <Fragment key={row.id}>
                  <tr>
                    <td className="text-muted">{(page - 1) * limit + idx + 1}</td>
                    <td className="font-semibold">{row.nama}</td>
                    <td className="font-mono text-muted">{row.nim}</td>
                    <td>{row.prodi}</td>
                    <td>
                      <span className="font-bold" style={{ color: getAccuracyColor(row.akurasi) }}>
                        {row.akurasi}%
                      </span>
                    </td>
                    <td>{row.posisi || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {row.linkedin && <span className="mini-badge li">in</span>}
                        {row.instagram && <span className="mini-badge ig">ig</span>}
                        {row.facebook && <span className="mini-badge fb">fb</span>}
                        {row.tiktok && <span className="mini-badge tt">tt</span>}
                        {!row.linkedin && !row.instagram && !row.facebook && !row.tiktok && <span className="text-muted">—</span>}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                      >
                        <Eye size={14} /> {expandedRow === idx ? 'Tutup' : 'Detail'}
                      </button>
                    </td>
                  </tr>

                  {expandedRow === idx && (
                    <tr className="detail-expanded-row" style={{ backgroundColor: 'rgba(5, 10, 24, 0.4)' }}>
                      <td colSpan="8" style={{ padding: '1.5rem' }}>
                        <div className="tracked-detail-grid">
                          <div className="tracked-detail-section">
                            <h5><User size={14} /> Sosial Media & Kontak</h5>
                            <div className="social-links-row" style={{ marginBottom: 12 }}>
                              {row.linkedin ? <a href={row.linkedin} target="_blank" rel="noreferrer" className="social-icon l">in</a> : null}
                              {row.instagram ? <a href={row.instagram} target="_blank" rel="noreferrer" className="social-icon i">ig</a> : null}
                              {row.facebook ? <a href={row.facebook} target="_blank" rel="noreferrer" className="social-icon f">fb</a> : null}
                              {row.tiktok ? <a href={row.tiktok} target="_blank" rel="noreferrer" className="social-icon t">tt</a> : null}
                            </div>
                            <div className="detail-field"><Mail size={13} /> <span>Email:</span> <strong>{row.email || '-'}</strong></div>
                            <div className="detail-field"><Phone size={13} /> <span>No HP:</span> <strong>{row.no_hp || '-'}</strong></div>
                          </div>
                          <div className="tracked-detail-section">
                            <h5><Briefcase size={14} /> Karir & Pekerjaan</h5>
                            <div className="detail-field"><span>Posisi:</span> <strong>{row.posisi || '-'}</strong></div>
                            <div className="detail-field"><span>Tempat Kerja:</span> <strong>{row.tempat_kerja || '-'}</strong></div>
                            <div className="detail-field"><MapPin size={13} /> <span>Alamat:</span> <strong>{row.alamat_kerja || '-'}</strong></div>
                            <div className="detail-field"><span>Jenis:</span> <span className={`job-badge badge-${(row.jenis_pekerjaan || 'swasta').toLowerCase()}`}>{row.jenis_pekerjaan || '-'}</span></div>
                          </div>
                          <div className="tracked-detail-section">
                            <h5><Building size={14} /> Info Perusahaan</h5>
                            <div className="detail-field"><span>Sosmed Perusahaan:</span> <strong>{row.sosmed_perusahaan || '-'}</strong></div>
                            <div className="detail-field"><span>Dilacak pada:</span> <strong>{row.last_tracked_at ? new Date(row.last_tracked_at).toLocaleString('id-ID') : '-'}</strong></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination-controls">
            <div className="pagination-info">
              Halaman <strong>{page}</strong> dari <strong>{totalPages}</strong> ({total} alumni)
            </div>
            <div className="pagination-buttons">
              <button className="page-btn" onClick={() => handlePageChange(page - 1)} disabled={page === 1}><ChevronLeft size={16} /></button>
              <button className="page-btn" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlumniTable;
