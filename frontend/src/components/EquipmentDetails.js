import React, { useState, useEffect } from 'react';
import { equipmentAPI, requestsAPI } from '../services/api';
import { getTeamIcon } from '../utils/teamIcons';
import './EquipmentDetails.css';

function EquipmentDetails({ equipmentId, onBack, onEdit }) {
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrapping, setScrapping] = useState(false);
  const [openRequestsCount, setOpenRequestsCount] = useState(0);
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    loadEquipment();
    loadOpenRequestsCount();
  }, [equipmentId]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentAPI.getById(equipmentId);
      setEquipment(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load equipment details');
    } finally {
      setLoading(false);
    }
  };

  const loadOpenRequestsCount = async () => {
    try {
      const response = await requestsAPI.getAll({ equipment_id: equipmentId });
      const openRequests = response.data.filter(
        r => r.status !== 'Repaired' && r.status !== 'Scrap'
      );
      setOpenRequestsCount(openRequests.length);
    } catch (err) {
      console.error('Failed to load requests count:', err);
    }
  };

  const handleShowRequests = async () => {
    if (showRequests) {
      setShowRequests(false);
      return;
    }

    try {
      setLoadingRequests(true);
      const response = await requestsAPI.getAll({ equipment_id: equipmentId });
      setRequests(response.data);
      setShowRequests(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load maintenance requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleScrap = async () => {
    if (!window.confirm(`Are you sure you want to mark "${equipment.name}" as scrapped? This action cannot be undone.`)) {
      return;
    }

    try {
      setScrapping(true);
      await equipmentAPI.scrap(equipmentId);
      await loadEquipment();
      alert('Equipment marked as scrapped successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark equipment as scrapped');
    } finally {
      setScrapping(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading equipment details...</div>;
  }

  if (error) {
    return (
      <div className="equipment-details">
        <div className="error-message">{error}</div>
        <button onClick={onBack} className="btn btn-secondary">Back</button>
      </div>
    );
  }

  if (!equipment) {
    return null;
  }

  return (
    <div className="equipment-details">
      <div className="equipment-details-header">
        <button onClick={onBack} className="btn btn-secondary">← Back</button>
        <div className="header-actions">
          <button
            onClick={handleShowRequests}
            className="btn btn-maintenance"
          >
            Maintenance
            {openRequestsCount > 0 && (
              <span className="request-count-badge">{openRequestsCount}</span>
            )}
          </button>
          {equipment.status !== 'Scrapped' && (
            <>
              <button onClick={onEdit} className="btn btn-primary">Edit</button>
              <button
                onClick={handleScrap}
                className="btn btn-danger"
                disabled={scrapping}
              >
                {scrapping ? 'Marking...' : 'Mark as Scrapped'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={`equipment-details-card ${equipment.status === 'Scrapped' ? 'scrapped' : ''}`}>
        <div className="equipment-details-title">
          <h2>{equipment.name}</h2>
          <span className={`status-badge ${equipment.status.toLowerCase()}`}>
            {equipment.status}
          </span>
        </div>

        <div className="equipment-details-grid">
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-item">
              <span className="detail-label">Serial Number:</span>
              <span className="detail-value">{equipment.serial_number || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Department:</span>
              <span className="detail-value">{equipment.department || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Assigned Employee:</span>
              <span className="detail-value">{equipment.assigned_employee || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{equipment.location || 'N/A'}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Maintenance</h3>
            <div className="detail-item">
              <span className="detail-label">Maintenance Team:</span>
              <span className="detail-value">
                {equipment.team_name ? (
                  <span className="team-display">
                    <span className="team-icon">{getTeamIcon(equipment.team_name, equipment.team_specialization)}</span>
                    <span>{equipment.team_name}</span>
                  </span>
                ) : (
                  'Unassigned'
                )}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <h3>Dates</h3>
            <div className="detail-item">
              <span className="detail-label">Purchase Date:</span>
              <span className="detail-value">
                {equipment.purchase_date 
                  ? new Date(equipment.purchase_date).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Warranty Expiry:</span>
              <span className="detail-value">
                {equipment.warranty_expiry 
                  ? new Date(equipment.warranty_expiry).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Created:</span>
              <span className="detail-value">
                {equipment.created_at 
                  ? new Date(equipment.created_at).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Updated:</span>
              <span className="detail-value">
                {equipment.updated_at 
                  ? new Date(equipment.updated_at).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showRequests && (
        <div className="equipment-requests-section">
          <div className="requests-section-header">
            <h3>Maintenance Requests for {equipment.name}</h3>
            <button
              onClick={() => setShowRequests(false)}
              className="btn btn-secondary btn-sm"
            >
              Close
            </button>
          </div>
          {loadingRequests ? (
            <div className="loading">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="no-requests">No maintenance requests found for this equipment.</div>
          ) : (
            <div className="requests-list">
              {requests.map(request => (
                <div
                  key={request.id}
                  className={`request-item ${request.status.toLowerCase().replace(' ', '-')} ${
                    request.is_overdue ? 'overdue' : ''
                  }`}
                >
                  <div className="request-header">
                    <div className="request-subject">
                      <strong>#{request.id}</strong> - {request.subject}
                    </div>
                    <div className="request-badges">
                      <span className={`status-badge status-${request.status.toLowerCase().replace(' ', '-')}`}>
                        {request.status}
                      </span>
                      {request.is_overdue && (
                        <span className="overdue-badge">⚠ Overdue</span>
                      )}
                    </div>
                  </div>
                  <div className="request-details">
                    <div className="request-detail-item">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">{request.type}</span>
                    </div>
                    <div className="request-detail-item">
                      <span className="detail-label">Priority:</span>
                      <span className={`detail-value priority-${request.priority.toLowerCase()}`}>
                        {request.priority}
                      </span>
                    </div>
                    {request.scheduled_date && (
                      <div className="request-detail-item">
                        <span className="detail-label">Scheduled:</span>
                        <span className={`detail-value ${request.is_overdue ? 'overdue-text' : ''}`}>
                          {new Date(request.scheduled_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {request.team_name && (
                      <div className="request-detail-item">
                        <span className="detail-label">Team:</span>
                        <span className="detail-value">{request.team_name}</span>
                      </div>
                    )}
                    {request.technician_name && (
                      <div className="request-detail-item">
                        <span className="detail-label">Technician:</span>
                        <span className="detail-value">{request.technician_name}</span>
                      </div>
                    )}
                    <div className="request-detail-item">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EquipmentDetails;

