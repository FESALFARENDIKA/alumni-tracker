import { useState } from 'react';
import { Filter, Search, ShieldAlert, CircleCheck as CheckCircle, Clock } from 'lucide-react';
import { alumniData } from '../data/mockData';
import ReviewModal from './ReviewModal';
import './AlumniTable.css';

const AlumniTable = ({ onReview, showAll = true, filterStatus: initialFilterStatus = 'All', title = 'Alumni Database' }) => {
  const [filterStatus, setFilterStatus] = useState(initialFilterStatus);
  const [filterYear, setFilterYear] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Derive unique years for filter
  const uniqueYears = [...new Set(alumniData.map(item => item.graduationYear))].sort((a, b) => b - a);

  // Filter Logic
  const filteredData = alumniData.filter(item => {
    const matchStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchYear = filterYear === 'All' || item.graduationYear === parseInt(filterYear);
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nim.includes(searchTerm);
    return matchStatus && matchYear && matchSearch;
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
              filteredData.map((row) => (
                <tr key={row.id}>
                  <td className="font-mono text-muted">{row.nim}</td>
                  <td className="font-semibold">{row.name}</td>
                  <td>{row.graduationYear}</td>
                  <td>{row.extractedJob}</td>
                  <td>{row.extractedCompany}</td>
                  <td className={`font-bold ${getConfidenceColor(row.confidenceScore)}`}>
                    {row.confidenceScore}%
                  </td>
                  <td>{getStatusBadge(row.status)}</td>
                  <td>
                    {row.status !== 'Untracked' && (
                      <button
                        className="btn btn-outline btn-sm action-review-btn"
                        onClick={() => onReview(row)}
                      >
                        <ShieldAlert size={14} /> Review
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">No matching alumni records found.</td>
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
