import { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reports, setReports] = useState([]);
  const [expandedReport, setExpandedReport] = useState(null);
  const [reverifying, setReverifying] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchListings = async () => {
    try {
      const res = await api.get('/admin/listings');
      setListings(res.data.listings);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/requests');
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports/admin');
      setReports(res.data.reports);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  const handleReverify = async (reportId) => {
    setReverifying(reportId);
    try {
      const res = await api.post(`/reports/${reportId}/reverify`);
      setReports(prev => prev.map(r => r._id === reportId ? res.data.report : r));
    } catch (err) {
      console.error('Re-verify failed:', err);
    } finally {
      setReverifying(null);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (userId === user._id) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleDeleteListing = async (listingId) => {
    try {
      await api.delete(`/admin/listings/${listingId}`);
      fetchListings();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  };

  const getStatusBadgeClass = (status) => {
    const map = { available: 'badge-available', claimed: 'badge-claimed', expired: 'badge-expired', pending: 'badge-pending', accepted: 'badge-accepted', rejected: 'badge-rejected', completed: 'badge-completed', donor: 'badge-donor', receiver: 'badge-receiver', admin: 'badge-admin' };
    return `status-badge ${map[status] || ''}`;
  };

  const getVerdictBadgeClass = (verdict) => {
    if (verdict === 'Verified') return 'status-badge badge-verified';
    if (verdict === 'Fake / Suspicious') return 'status-badge badge-fake';
    if (verdict === 'Mismatch') return 'status-badge badge-mismatch';
    return 'status-badge badge-pending';
  };

  const getReportStatusBadgeClass = (status) => {
    if (status === 'Approved') return 'status-badge badge-approved-report';
    if (status === 'Not Valid') return 'status-badge badge-not-valid';
    return 'status-badge badge-pending';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return '#43a047';
    if (confidence >= 40) return '#f57f17';
    return '#e53935';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🛡️ Admin Panel</h1>
        <p>Welcome, <strong>{user.name}</strong>! Manage the platform from here.</p>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => { setActiveTab('stats'); fetchStats(); }}>📊 Analytics</button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => { setActiveTab('users'); fetchUsers(); }}>👥 Users</button>
        <button className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => { setActiveTab('listings'); fetchListings(); }}>🍲 Listings</button>
        <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => { setActiveTab('requests'); fetchRequests(); }}>📩 Requests</button>
        <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => { setActiveTab('reports'); fetchReports(); }}>🔍 Reports</button>
      </div>

      {activeTab === 'stats' && stats && (
        <div className="dashboard-section">
          <h2>Platform Analytics</h2>
          <div className="stats-grid">
            <div className="stat-card stat-blue">
              <div className="stat-number">{stats.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card stat-green">
              <div className="stat-number">{stats.totalDonors}</div>
              <div className="stat-label">Donors</div>
            </div>
            <div className="stat-card stat-purple">
              <div className="stat-number">{stats.totalReceivers}</div>
              <div className="stat-label">Receivers</div>
            </div>
            <div className="stat-card stat-orange">
              <div className="stat-number">{stats.totalListings}</div>
              <div className="stat-label">Total Listings</div>
            </div>
            <div className="stat-card stat-teal">
              <div className="stat-number">{stats.availableListings}</div>
              <div className="stat-label">Available</div>
            </div>
            <div className="stat-card stat-red">
              <div className="stat-number">{stats.claimedListings}</div>
              <div className="stat-label">Claimed</div>
            </div>
            <div className="stat-card stat-yellow">
              <div className="stat-number">{stats.totalRequests}</div>
              <div className="stat-label">Total Requests</div>
            </div>
            <div className="stat-card stat-pink">
              <div className="stat-number">{stats.pendingRequests}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card stat-emerald">
              <div className="stat-number">{stats.completedRequests}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="dashboard-section">
          <h2>All Users</h2>
          {users.length === 0 ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={getStatusBadgeClass(u.role)}>{u.role}</span></td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        {u._id !== user._id && (
                          <button className="btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>🗑️</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="dashboard-section">
          <h2>All Food Listings</h2>
          {listings.length === 0 ? (
            <div className="empty-state"><p>No listings found.</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Food Type</th>
                    <th>Quantity</th>
                    <th>Donor</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <tr key={l._id}>
                      <td>{l.foodType}</td>
                      <td>{l.quantity}</td>
                      <td>{l.donorId?.name || 'Unknown'}</td>
                      <td>{l.location}</td>
                      <td><span className={getStatusBadgeClass(l.status)}>{l.status}</span></td>
                      <td>{new Date(l.expiryTime).toLocaleString()}</td>
                      <td>
                        <button className="btn-danger btn-sm" onClick={() => handleDeleteListing(l._id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="dashboard-section">
          <h2>All Requests</h2>
          {requests.length === 0 ? (
            <div className="empty-state"><p>No requests found.</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Food</th>
                    <th>Receiver</th>
                    <th>Donor</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r._id}>
                      <td>{r.listingId?.foodType || 'Unknown'}</td>
                      <td>{r.receiverId?.name || 'Unknown'}</td>
                      <td>{r.donorId?.name || 'Unknown'}</td>
                      <td><span className={getStatusBadgeClass(r.status)}>{r.status}</span></td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="dashboard-section">
          <h2>🔍 Image Verification Reports</h2>
          {reports.length === 0 ? (
            <div className="empty-state"><p>No reports submitted yet.</p></div>
          ) : (
            <div className="reports-list">
              {reports.map((report) => {
                const v = report.imageVerification || {};
                const isExpanded = expandedReport === report._id;
                return (
                  <div key={report._id} className="report-card-admin">
                    <div className="report-card-main" onClick={() => setExpandedReport(isExpanded ? null : report._id)}>
                      <div className="report-image-col">
                        {report.image ? (
                          <img src={report.image} alt="Report" className="report-image-preview" />
                        ) : (
                          <div className="report-image-placeholder">No Image</div>
                        )}
                      </div>
                      <div className="report-info-col">
                        <div className="report-info-row">
                          <strong>{report.title}</strong>
                          <span className={getReportStatusBadgeClass(report.status)}>{report.status}</span>
                        </div>
                        <p className="report-meta">
                          👤 {report.reporterId?.name || 'Unknown'} ({report.reporterId?.role}) &nbsp;|&nbsp;
                          📁 {report.reportType.replace('_', ' ')} &nbsp;|&nbsp;
                          📅 {new Date(report.createdAt).toLocaleString()}
                        </p>
                        {report.description && <p className="report-desc">{report.description}</p>}
                      </div>
                      <div className="report-verdict-col">
                        <span className={getVerdictBadgeClass(v.overallVerdict)}>{v.overallVerdict || 'Pending'}</span>
                        <div className="confidence-display">
                          <div className="confidence-bar">
                            <div className="confidence-fill" style={{ width: `${v.overallConfidence || 0}%`, background: getConfidenceColor(v.overallConfidence || 0) }}></div>
                          </div>
                          <span className="confidence-text" style={{ color: getConfidenceColor(v.overallConfidence || 0) }}>
                            {v.overallConfidence || 0}%
                          </span>
                        </div>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={(e) => { e.stopPropagation(); handleReverify(report._id); }}
                          disabled={reverifying === report._id}
                        >
                          {reverifying === report._id ? '⏳ Analyzing...' : '🔄 Re-verify'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && v.overallVerdict && v.overallVerdict !== 'Pending' && (
                      <div className="verification-details">
                        <h4>Verification Breakdown</h4>
                        <div className="score-grid">
                          <div className="score-item">
                            <span className="score-label">🔬 ELA (Manipulation)</span>
                            <div className="confidence-bar"><div className="confidence-fill" style={{ width: `${v.elaScore || 0}%`, background: getConfidenceColor(v.elaScore || 0) }}></div></div>
                            <span className="score-value">{v.elaScore || 0}%</span>
                          </div>
                          <div className="score-item">
                            <span className="score-label">🏷️ Classification</span>
                            <div className="confidence-bar"><div className="confidence-fill" style={{ width: `${v.classificationConfidence || 0}%`, background: getConfidenceColor(v.classificationConfidence || 0) }}></div></div>
                            <span className="score-value">{v.classificationConfidence || 0}%</span>
                          </div>
                          <div className="score-item">
                            <span className="score-label">📷 Quality</span>
                            <div className="confidence-bar"><div className="confidence-fill" style={{ width: `${v.qualityScore || 0}%`, background: getConfidenceColor(v.qualityScore || 0) }}></div></div>
                            <span className="score-value">{v.qualityScore || 0}%</span>
                          </div>
                          <div className="score-item">
                            <span className="score-label">📋 EXIF Metadata</span>
                            <div className="confidence-bar"><div className="confidence-fill" style={{ width: `${v.exifScore || 0}%`, background: getConfidenceColor(v.exifScore || 0) }}></div></div>
                            <span className="score-value">{v.exifScore || 0}%</span>
                          </div>
                          <div className="score-item">
                            <span className="score-label">📊 Statistics</span>
                            <div className="confidence-bar"><div className="confidence-fill" style={{ width: `${v.statsScore || 0}%`, background: getConfidenceColor(v.statsScore || 0) }}></div></div>
                            <span className="score-value">{v.statsScore || 0}%</span>
                          </div>
                        </div>

                        <div className="detail-tags">
                          <span className={`detail-tag ${v.isFood ? 'tag-good' : 'tag-bad'}`}>
                            {v.isFood ? '✅ Food Detected' : '❌ Not Food'}
                          </span>
                          <span className={`detail-tag ${v.contextMatch ? 'tag-good' : 'tag-bad'}`}>
                            {v.contextMatch ? '✅ Context Match' : '❌ Context Mismatch'}
                          </span>
                          <span className={`detail-tag ${v.exifPresent ? 'tag-good' : 'tag-warn'}`}>
                            {v.exifPresent ? '✅ EXIF Present' : '⚠️ No EXIF'}
                          </span>
                          {v.imageResolution && <span className="detail-tag tag-neutral">📐 {v.imageResolution}</span>}
                        </div>

                        {v.classificationLabels && v.classificationLabels.length > 0 && (
                          <div className="detail-section">
                            <strong>Detected Labels:</strong> {v.classificationLabels.join(', ')}
                          </div>
                        )}
                        {v.qualityIssues && v.qualityIssues.length > 0 && (
                          <div className="detail-section">
                            <strong>Quality Issues:</strong> {v.qualityIssues.join(', ')}
                          </div>
                        )}
                        {v.details && (
                          <div className="detail-section">
                            <strong>AI Summary:</strong> {v.details}
                          </div>
                        )}
                        {v.analyzedAt && (
                          <div className="detail-section detail-time">
                            Analyzed: {new Date(v.analyzedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
