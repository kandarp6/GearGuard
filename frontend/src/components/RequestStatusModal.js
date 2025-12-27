import React, { useState, useEffect } from 'react';
import { requestsAPI, techniciansAPI } from '../services/api';
import Notification from './Notification';
import './RequestStatusModal.css';

function RequestStatusModal({ request, onClose, onSave }) {
  const [formData, setFormData] = useState({
    status: request.status,
    assigned_technician: request.assigned_technician || '',
    duration: request.duration || '',
  });
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (request.team_id) {
      loadTechnicians();
    }
  }, [request.team_id]);

  const loadTechnicians = async () => {
    try {
      const response = await techniciansAPI.getByTeam(request.team_id);
      setTechnicians(response.data);
    } catch (err) {
      console.error('Failed to load technicians:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const updateData = {
        status: formData.status,
      };

      // Include technician if moving to In Progress
      if (formData.status === 'In Progress' && formData.assigned_technician) {
        updateData.assigned_technician = parseInt(formData.assigned_technician);
      }

      // Include duration if moving to Repaired
      if (formData.status === 'Repaired' && formData.duration) {
        updateData.duration = parseInt(formData.duration);
      }

      await requestsAPI.updateStatus(request.id, formData.status, updateData);
      setNotification({ 
        message: 'Request status updated successfully!', 
        type: 'success' 
      });
      
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update request status';
      setError(errorMessage);
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const requiresTechnician = formData.status === 'In Progress' && request.status !== 'In Progress';
  const requiresDuration = formData.status === 'Repaired' && request.status !== 'Repaired';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Update Request Status</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
            duration={3000}
          />
        )}

        <form onSubmit={handleSubmit} className="status-form">
          <div className="form-group">
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Repaired">Repaired</option>
              <option value="Scrap">Scrap</option>
            </select>
          </div>

          {requiresTechnician && (
            <div className="form-group required-field">
              <label htmlFor="assigned_technician">
                Technician * <span className="required-hint">(Required for In Progress)</span>
              </label>
              <select
                id="assigned_technician"
                name="assigned_technician"
                value={formData.assigned_technician}
                onChange={handleChange}
                required={requiresTechnician}
                disabled={loading || technicians.length === 0}
              >
                <option value="">Select Technician</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} {tech.email ? `(${tech.email})` : ''}
                  </option>
                ))}
              </select>
              {technicians.length === 0 && (
                <small className="form-hint">No technicians available for this team</small>
              )}
            </div>
          )}

          {requiresDuration && (
            <div className="form-group required-field">
              <label htmlFor="duration">
                Duration (minutes) * <span className="required-hint">(Required for Repaired)</span>
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required={requiresDuration}
                min="1"
                placeholder="e.g., 60"
                disabled={loading}
              />
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestStatusModal;

