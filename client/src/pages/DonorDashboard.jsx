import { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [reportData, setReportData] = useState({ reportType: 'food_quality', title: '', description: '', image: '' });
  const [reportResult, setReportResult] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMsg, setReportMsg] = useState('');
  const [formData, setFormData] = useState({
    foodType: '',
    quantity: '',
    description: '',
    expiryTime: '',
    location: '',
    pickupWindowStart: '',
    pickupWindowEnd: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchListings = async () => {
    try {
      const res = await api.get('/food/donor');
      setListings(res.data.listings);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/donor');
      setRequests(res.data.requests);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  useEffect(() => {
    fetchListings();
    fetchRequests();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/food', formData);
      setMessage('Food listing added successfully!');
      setFormData({ foodType: '', quantity: '', description: '', expiryTime: '', location: '', pickupWindowStart: '', pickupWindowEnd: '' });
      fetchListings();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add listing');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    try {
      await api.put(`/requests/${requestId}`, { status });
      fetchRequests();
      fetchListings();
    } catch (err) {
      console.error('Failed to update request:', err);
    }
  };

  const handleComplete = async (requestId) => {
    try {
      await api.put(`/requests/${requestId}/complete`);
      fetchRequests();
    } catch (err) {
      console.error('Failed to complete request:', err);
    }
  };

  const handleDelete = async (listingId) => {
    try {
      await api.delete(`/food/${listingId}`);
      fetchListings();
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  };

  const getStatusBadgeClass = (status) => {
    const map = { available: 'badge-available', claimed: 'badge-claimed', expired: 'badge-expired', pending: 'badge-pending', accepted: 'badge-accepted', rejected: 'badge-rejected', completed: 'badge-completed' };
    return `status-badge ${map[status] || ''}`;
  };

  const handleReportImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReportData(prev => ({ ...prev, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportData.title || !reportData.image) {
      setReportMsg('Title and image are required.');
      return;
    }
    setReportLoading(true);
    setReportResult(null);
    setReportMsg('');
    try {
      const res = await api.post('/reports', reportData);
      setReportResult(res.data.report);
      setReportMsg('Report submitted and verified!');
      setReportData({ reportType: 'food_quality', title: '', description: '', image: '' });
    } catch (err) {
      setReportMsg(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setReportLoading(false);
    }
  };

  const getConfidenceColor = (c) => c >= 70 ? '#43a047' : c >= 40 ? '#f57f17' : '#e53935';

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🍽️ Donor Dashboard</h1>
        <p>Welcome, <strong>{user.name}</strong>! Manage your food donations here.</p>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`} onClick={() => setActiveTab('add')}>➕ Add Food</button>
        <button className={`tab-btn ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => { setActiveTab('listings'); fetchListings(); }}>📋 My Listings ({listings.length})</button>
        <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => { setActiveTab('requests'); fetchRequests(); }}>📩 Requests ({requests.length})</button>
        <button className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>📝 Report</button>
      </div>

      {activeTab === 'add' && (
        <div className="dashboard-section">
          <h2>Add Surplus Food</h2>
          {message && <div className="form-message">{message}</div>}
          <form onSubmit={handleSubmit} className="food-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="foodType">Food Type</label>
                <select id="foodType" name="foodType" value={formData.foodType} onChange={handleChange} required>
                  <option value="">Select type</option>
                  <option value="Cooked Meal">Cooked Meal</option>
                  <option value="Raw Ingredients">Raw Ingredients</option>
                  <option value="Packaged Food">Packaged Food</option>
                  <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                  <option value="Bakery Items">Bakery Items</option>
                  <option value="Dairy Products">Dairy Products</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input id="quantity" name="quantity" type="text" value={formData.quantity} onChange={handleChange} placeholder="e.g., 10 plates, 5 kg" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe the food items..." rows="3" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryTime">Expiry Time</label>
                <input id="expiryTime" name="expiryTime" type="datetime-local" value={formData.expiryTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="location">Pickup Location</label>
                <input id="location" name="location" type="text" value={formData.location} onChange={handleChange} placeholder="Enter pickup address" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pickupWindowStart">Pickup Window Start</label>
                <input id="pickupWindowStart" name="pickupWindowStart" type="time" value={formData.pickupWindowStart} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="pickupWindowEnd">Pickup Window End</label>
                <input id="pickupWindowEnd" name="pickupWindowEnd" type="time" value={formData.pickupWindowEnd} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Adding...' : '🍲 Add Food Listing'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="dashboard-section">
          <h2>My Food Listings</h2>
          {listings.length === 0 ? (
            <div className="empty-state">
              <p>📭 No listings yet. Start by adding surplus food!</p>
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
                  </div>
                  <div className="card-actions">
                    <button className="btn-danger" onClick={() => handleDelete(listing._id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="dashboard-section">
          <h2>Incoming Requests</h2>
          {requests.length === 0 ? (
            <div className="empty-state">
              <p>📭 No requests yet.</p>
            </div>
          ) : (
            <div className="cards-grid">
              {requests.map((req) => (
                <div key={req._id} className="request-card">
                  <div className="card-header">
                    <h3>{req.listingId?.foodType || 'Unknown'}</h3>
                    <span className={getStatusBadgeClass(req.status)}>{req.status}</span>
                  </div>
                  <div className="card-body">
                    <p><strong>Requested by:</strong> {req.receiverId?.name || 'Unknown'}</p>
                    <p><strong>📧 Email:</strong> {req.receiverId?.email}</p>
                    <p><strong>📞 Phone:</strong> {req.receiverId?.phone || 'N/A'}</p>
                    <p><strong>📍 Address:</strong> {req.receiverId?.address || 'N/A'}</p>
                    {req.message && <p><strong>💬 Message:</strong> {req.message}</p>}
                    <p><strong>📅 Requested:</strong> {new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="card-actions">
                    {req.status === 'pending' && (
                      <>
                        <button className="btn-success" onClick={() => handleRequestAction(req._id, 'accepted')}>✅ Accept</button>
                        <button className="btn-danger" onClick={() => handleRequestAction(req._id, 'rejected')}>❌ Reject</button>
                      </>
                    )}
                    {req.status === 'accepted' && (
                      <button className="btn-primary" onClick={() => handleComplete(req._id)}>✔️ Mark Completed</button>
                    )}
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
          <form onSubmit={handleReportSubmit} className="food-form report-form">
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
              <input type="file" accept="image/*" onChange={handleReportImageUpload} required />
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
                  <div className="confidence-fill" style={{ width: `${reportResult.imageVerification.overallConfidence}%`, background: getConfidenceColor(reportResult.imageVerification.overallConfidence) }}></div>
                </div>
                <span className="confidence-text" style={{ color: getConfidenceColor(reportResult.imageVerification.overallConfidence), marginLeft: 8 }}>
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

export default DonorDashboard;

