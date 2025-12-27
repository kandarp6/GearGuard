import React, { useState, useEffect } from 'react';
import { equipmentAPI, teamsAPI } from '../services/api';
import './EquipmentForm.css';

function EquipmentForm({ equipmentId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    serial_number: '',
    department: '',
    assigned_employee: '',
    purchase_date: '',
    warranty_expiry: '',
    location: '',
    default_maintenance_team: '',
    status: 'Active',
  });
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTeams();
    if (equipmentId) {
      loadEquipment();
    }
  }, [equipmentId]);

  const loadTeams = async () => {
    try {
      const response = await teamsAPI.getAll();
      setTeams(response.data);
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentAPI.getById(equipmentId);
      const data = response.data;
      setFormData({
        name: data.name || '',
        serial_number: data.serial_number || '',
        department: data.department || '',
        assigned_employee: data.assigned_employee || '',
        purchase_date: data.purchase_date || '',
        warranty_expiry: data.warranty_expiry || '',
        location: data.location || '',
        default_maintenance_team: data.default_maintenance_team || '',
        status: data.status || 'Active',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load equipment');
    } finally {
      setLoading(false);
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
      const data = {
        ...formData,
        default_maintenance_team: formData.default_maintenance_team || null,
      };

      if (equipmentId) {
        await equipmentAPI.update(equipmentId, data);
      } else {
        await equipmentAPI.create(data);
      }

      onSave();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save equipment');
    } finally {
      setLoading(false);
    }
  };

  if (loading && equipmentId) {
    return <div className="loading">Loading equipment...</div>;
  }

  return (
    <div className="equipment-form-container">
      <div className="equipment-form">
        <h2>{equipmentId ? 'Edit Equipment' : 'Add New Equipment'}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Equipment Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="serial_number">Serial Number</label>
              <input
                type="text"
                id="serial_number"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="assigned_employee">Assigned Employee</label>
              <input
                type="text"
                id="assigned_employee"
                name="assigned_employee"
                value={formData.assigned_employee}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchase_date">Purchase Date</label>
              <input
                type="date"
                id="purchase_date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="warranty_expiry">Warranty Expiry</label>
              <input
                type="date"
                id="warranty_expiry"
                name="warranty_expiry"
                value={formData.warranty_expiry}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="default_maintenance_team">Maintenance Team</label>
              <select
                id="default_maintenance_team"
                name="default_maintenance_team"
                value={formData.default_maintenance_team}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading || equipmentId}
              >
                <option value="Active">Active</option>
                <option value="Scrapped">Scrapped</option>
              </select>
              {equipmentId && (
                <small className="form-hint">
                  Use "Mark as Scrapped" button to change status
                </small>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
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
              {loading ? 'Saving...' : equipmentId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EquipmentForm;

