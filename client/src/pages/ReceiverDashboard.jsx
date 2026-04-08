import { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [reportData, setReportData] = useState({ reportType: 'food_quality', title: '', description: '', image: '' });
  const [reportResult, setReportResult] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMsg, setReportMsg] = useState('');

  const fetchListings = async () => {
    try {
      const res = await api.get('/food');
      setListings(res.data.listings);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await api.get('/requests/receiver');
      setMyRequests(res.data.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchMyRequests();
  }, []);

  const handleRequest = async (listingId) => {
    try {
      await api.post('/requests', { listingId, message: requestMessage });
      setFeedback('Request sent successfully!');
      setSelectedListing(null);
      setRequestMessage('');
      fetchMyRequests();
      fetchListings();
      setTimeout(() => setFeedback(''), 3000);
    } catch (err) {
      setFeedback(err.response?.data?.error || 'Failed to send request');
      setTimeout(() => setFeedback(''), 3000);
    }
  };

  const getStatusBadgeClass = (status) => {
    const map = { available: 'badge-available', claimed: 'badge-claimed', pending: 'badge-pending', accepted: 'badge-accepted', rejected: 'badge-rejected', completed: 'badge-completed' };
    return `status-badge ${map[status] || ''}`;
  };

  const requestedListingIds = myRequests
    .filter(r => ['pending', 'accepted'].includes(r.status))
    .map(r => r.listingId?._id);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🍽️ Receiver Dashboard</h1>
        <p>Welcome, <strong>{user.name}</strong>! Browse and request available food.</p>
      </div>

      {feedback && <div className="form-message">{feedback}</div>}

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => { setActiveTab('browse'); fetchListings(); }}>🔍 Browse Food ({listings.length})</button>
        <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => { setActiveTab('requests'); fetchMyRequests(); }}>📋 My Requests ({myRequests.length})</button>
        <button className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>📝 Report</button>
      </div>

      {activeTab === 'browse' && (
        <div className="dashboard-section">
          <h2>Available Food Listings</h2>
          {listings.length === 0 ? (
            <div className="empty-state">
              <p>📭 No food available right now. Check back later!</p>
            </div>
          ) : (
            <div className="cards-grid">
              {listings.map((listing) => (
                <div key={listing._id} className="listing-card">
                  <div className="card-header">
                    <h3>{listing.foodType}</h3>
                    <span className={getStatusBadgeClass(listing.status)}>{listing.status}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Quantity:</strong> {listing.quantity}</p>
                    {listing.description && <p><strong>Description:</strong> {listing.description}</p>}
                    <p><strong>📍 Location:</strong> {listing.location}</p>
                    <p><strong>⏰ Expiry:</strong> {new Date(listing.expiryTime).toLocaleString()}</p>
                    <p><strong>🕐 Pickup Window:</strong> {listing.pickupWindowStart} - {listing.pickupWindowEnd}</p>
                    <p><strong>👤 Donor:</strong> {listing.donorId?.name}</p>
                    <p><strong>📞 Contact:</strong> {listing.donorId?.phone || 'N/A'}</p>
                  </div>
                  <div className="card-actions">
                    {requestedListingIds.includes(listing._id) ? (
                      <button className="btn-disabled" disabled>Already Requested</button>
                    ) : selectedListing === listing._id ? (
                      <div className="request-form-inline">
                        <textarea
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          placeholder="Add a message (optional)..."
                          rows="2"
                        />
                        <div className="inline-actions">
                          <button className="btn-success" onClick={() => handleRequest(listing._id)}>Send Request</button>
                          <button className="btn-secondary" onClick={() => { setSelectedListing(null); setRequestMessage(''); }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn-primary" onClick={() => setSelectedListing(listing._id)}>🙋 Request This Food</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="dashboard-section">
          <h2>My Requests</h2>
          {myRequests.length === 0 ? (
            <div className="empty-state">
              <p>📭 No requests yet. Browse available food and send a request!</p>
            </div>
          ) : (
            <div className="cards-grid">
              {myRequests.map((req) => (
                <div key={req._id} className="request-card">
                  <div className="card-header">
                    <h3>{req.listingId?.foodType || 'Unknown'}</h3>
                    <span className={getStatusBadgeClass(req.status)}>{req.status}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Quantity:</strong> {req.listingId?.quantity}</p>
                    <p><strong>📍 Location:</strong> {req.listingId?.location}</p>
                    <p><strong>👤 Donor:</strong> {req.donorId?.name}</p>
                    <p><strong>📞 Donor Phone:</strong> {req.donorId?.phone || 'N/A'}</p>
                    {req.message && <p><strong>💬 Your Message:</strong> {req.message}</p>}
                    <p><strong>📅 Requested:</strong> {new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'report' && (
        <div className="dashboard-section">
          <h2>📝 Submit Image Verification Report</h2>
          {reportMsg && <div className="form-message">{reportMsg}</div>}
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!reportData.title || !reportData.image) { setReportMsg('Title and image are required.'); return; }
            setReportLoading(true); setReportResult(null); setReportMsg('');
            try {
              const res = await api.post('/reports', reportData);
              setReportResult(res.data.report);
              setReportMsg('Report submitted and verified!');
              setReportData({ reportType: 'food_quality', title: '', description: '', image: '' });
            } catch (err) { setReportMsg(err.response?.data?.error || 'Failed to submit report'); }
            finally { setReportLoading(false); }
          }} className="food-form report-form">
            <div className="form-row">
              <div className="form-group">
                <label>Report Type</label>
                <select value={reportData.reportType} onChange={e => setReportData(prev => ({ ...prev, reportType: e.target.value }))}>
                  <option value="food_quality">Food Quality</option>
                  <option value="suspicious_listing">Suspicious Listing</option>
                  <option value="delivery_issue">Delivery Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={reportData.title} onChange={e => setReportData(prev => ({ ...prev, title: e.target.value }))} placeholder="Brief report title" required />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={reportData.description} onChange={e => setReportData(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the issue in detail..." rows="3" />
            </div>
            <div className="form-group">
              <label>Upload Image for Verification</label>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setReportData(prev => ({ ...prev, image: reader.result }));
                reader.readAsDataURL(file);
              }} required />
              {reportData.image && (
                <img src={reportData.image} alt="Preview" style={{ maxWidth: 200, marginTop: 8, borderRadius: 8, border: '1px solid #ddd' }} />
              )}
            </div>
            <button type="submit" className="submit-btn" disabled={reportLoading}>
              {reportLoading ? '🔄 Analyzing Image...' : '🔍 Submit & Verify'}
            </button>
          </form>

          {reportResult && reportResult.imageVerification && (
            <div className="verification-result-inline">
              <h3>Verification Result</h3>
              <div className="result-header">
                <span className={`status-badge ${reportResult.imageVerification.overallVerdict === 'Verified' ? 'badge-verified' : reportResult.imageVerification.overallVerdict === 'Mismatch' ? 'badge-mismatch' : 'badge-fake'}`}>
                  {reportResult.imageVerification.overallVerdict}
                </span>
                <span className={`status-badge ${reportResult.status === 'Approved' ? 'badge-approved-report' : 'badge-not-valid'}`}>
                  {reportResult.status}
                </span>
              </div>
              <div className="confidence-display" style={{ marginTop: 12 }}>
                <span style={{ fontSize: 14, color: '#555', marginRight: 8 }}>Confidence:</span>
                <div className="confidence-bar" style={{ flex: 1 }}>
                  <div className="confidence-fill" style={{ width: `${reportResult.imageVerification.overallConfidence}%`, background: reportResult.imageVerification.overallConfidence >= 70 ? '#43a047' : reportResult.imageVerification.overallConfidence >= 40 ? '#f57f17' : '#e53935' }}></div>
                </div>
                <span className="confidence-text" style={{ color: reportResult.imageVerification.overallConfidence >= 70 ? '#43a047' : reportResult.imageVerification.overallConfidence >= 40 ? '#f57f17' : '#e53935', marginLeft: 8 }}>
                  {reportResult.imageVerification.overallConfidence}%
                </span>
              </div>
              <div className="detail-tags" style={{ marginTop: 12 }}>
                <span className={`detail-tag ${reportResult.imageVerification.isFood ? 'tag-good' : 'tag-bad'}`}>
                  {reportResult.imageVerification.isFood ? '✅ Food Detected' : '❌ Not Food'}
                </span>
                <span className={`detail-tag ${reportResult.imageVerification.contextMatch ? 'tag-good' : 'tag-bad'}`}>
                  {reportResult.imageVerification.contextMatch ? '✅ Context Match' : '❌ Context Mismatch'}
                </span>
              </div>
              {reportResult.imageVerification.details && (
                <p style={{ marginTop: 10, fontSize: 13, color: '#666' }}>{reportResult.imageVerification.details}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiverDashboard;
