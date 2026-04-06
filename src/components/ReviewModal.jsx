import { X, ExternalLink, ShieldAlert, Check, CircleX as XCircle, GraduationCap, Briefcase, Building, Star } from 'lucide-react';
import './ReviewModal.css';

const ReviewModal = ({ data, onClose, onAction }) => {
  if (!data) return null;

  const confidenceLevel = data.confidenceScore >= 80
    ? { label: 'Tinggi', color: 'var(--success)' }
    : data.confidenceScore >= 50
    ? { label: 'Sedang', color: 'var(--warning)' }
    : { label: 'Rendah', color: 'var(--danger)' };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-container glass-panel animate-scale-in">
        <div className="modal-header">
          <div className="modal-title">
            <ShieldAlert size={20} className="text-warning" />
            <h2>Manual Verification Required</h2>
          </div>
          <button className="close-btn" onClick={onClose} title="Tutup">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Profile Summary */}
          <div className="profile-summary">
            <div className="profile-avatar-lg">
              {data.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{data.name}</h3>
              <p className="text-muted">NIM: {data.nim} &nbsp;•&nbsp; Angkatan {data.graduationYear}</p>
            </div>
          </div>

          {/* Algorithm Extracted Data */}
          <div className="evidence-section">
            <h4>Data yang Diekstrak Algoritma</h4>
            <div className="data-grid">
              <div className="data-item">
                <span className="data-label">
                  <Briefcase size={13} /> Pekerjaan Saat Ini
                </span>
                <span className="data-value">{data.extractedJob || '-'}</span>
              </div>
              <div className="data-item">
                <span className="data-label">
                  <Building size={13} /> Perusahaan
                </span>
                <span className="data-value">{data.extractedCompany || '-'}</span>
              </div>
              <div className="data-item">
                <span className="data-label">
                  <Star size={13} /> Confidence Score
                </span>
                <span className="data-value confidence-value" style={{ color: confidenceLevel.color }}>
                  {data.confidenceScore}% — {confidenceLevel.label}
                </span>
              </div>
              <div className="data-item">
                <span className="data-label">
                  <GraduationCap size={13} /> Status Saat Ini
                </span>
                <span className="data-value">{data.status}</span>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="modal-confidence-bar-bg">
              <div
                className="modal-confidence-bar-fill"
                style={{ width: `${data.confidenceScore}%`, background: confidenceLevel.color }}
              />
            </div>
          </div>

          {/* Evidence Link */}
          {data.evidenceUrl && (
            <div className="evidence-section">
              <h4>Tautan Bukti Digital</h4>
              <a
                href={data.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="evidence-link"
              >
                <ExternalLink size={16} />
                Buka Profil Sumber → {data.evidenceUrl}
              </a>
            </div>
          )}

          {/* Action Required Notice */}
          <div className="action-notice">
            <ShieldAlert size={16} />
            <span>
              Tinjau data di atas dan konfirmasi apakah kecocokan ini valid atau merupakan false positive.
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Batalkan
          </button>

          <div className="action-buttons">
            <button
              className="btn btn-danger"
              onClick={() => onAction('Reject')}
            >
              <XCircle size={16} /> Tolak (False Positive)
            </button>
            <button
              className="btn btn-success"
              onClick={() => onAction('Approve')}
            >
              <Check size={16} /> Konfirmasi Valid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
