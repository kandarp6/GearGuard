import React, { useState, useEffect } from 'react';
import { requestsAPI, equipmentAPI, techniciansAPI } from '../services/api';
import { determinePriority } from '../utils/priorityHelper';
import Notification from './Notification';
import './RequestFormModal.css';

function RequestFormModal({ initialDate, onClose, onSave, initialType = 'Preventive' }) {
  const [formData, setFormData] = useState({
    subject: '',
    type: initialType,
    equipment_id: '',
    scheduled_date: initialDate ? initialDate.toISOString().split('T')[0] : '',
    duration: '',
    priority: 'Medium',
    assigned_technician: '',
  });
  const [equipment, setEquipment] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const response = await equipmentAPI.getAll();
      // Filter out scrapped equipment
      const activeEquipment = response.data.filter(eq => eq.status === 'Active');
      setEquipment(activeEquipment);
    } catch (err) {
      console.error('Failed to load equipment:', err);
    }
  };

  const handleEquipmentChange = async (equipmentId) => {
    if (!equipmentId) {
      // Reset auto-filled fields when equipment is cleared
      setFormData(prev => ({
        ...prev,
        equipment_id: '',
        priority: 'Medium',
        assigned_technician: '',
      }));
      setSelectedEquipment(null);
      setTechnicians([]);
      setAutoFilled(false);
      return;
    }

    try {
      // Fetch equipment details
      const equipmentResponse = await equipmentAPI.getById(equipmentId);
      const selectedEq = equipmentResponse.data;
      setSelectedEquipment(selectedEq);

      // Auto-fill maintenance team (from equipment's default_maintenance_team)
      let teamId = selectedEq.default_maintenance_team;
      let teamSpecialization = null;

      // Auto-set priority based on equipment type
      const autoPriority = determinePriority(selectedEq.name, selectedEq.team_name || '');
      
      // Fetch technicians for the team
      let availableTechnicians = [];
      let defaultTechnician = null;

      if (teamId) {
        try {
          const techResponse = await techniciansAPI.getByTeam(teamId);
          availableTechnicians = techResponse.data;
          // Auto-select first technician if available
          if (availableTechnicians.length > 0) {
            defaultTechnician = availableTechnicians[0].id;
          }
        } catch (err) {
          console.warn('Failed to load technicians:', err);
        }
      }

      // Update form with auto-filled values
      setFormData(prev => ({
        ...prev,
        equipment_id: equipmentId,
        priority: autoPriority,
        assigned_technician: defaultTechnician || '',
      }));

      setTechnicians(availableTechnicians);
      setAutoFilled(true);

      // Show notification about auto-fill
      if (autoPriority !== 'Medium' || defaultTechnician) {
        let message = `Auto-filled: Priority set to ${autoPriority}`;
        if (defaultTechnician) {
          message += `, Technician: ${availableTechnicians[0].name}`;
        }
        setNotification({ 
          message, 
          type: 'info',
          duration: 2000 
        });
      }
    } catch (err) {
      console.error('Failed to load equipment details:', err);
      setNotification({ 
        message: 'Failed to load equipment details', 
        type: 'error' 
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle equipment change separately for auto-fill
    if (name === 'equipment_id') {
      handleEquipmentChange(value);
      return;
    }

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
      const requestData = {
        ...formData,
        equipment_id: formData.equipment_id ? parseInt(formData.equipment_id) : null,
        assigned_technician: formData.assigned_technician ? parseInt(formData.assigned_technician) : null,
        duration: formData.duration ? parseInt(formData.duration) : null,
      };

      await requestsAPI.create(requestData);
      setNotification({ 
        message: `${formData.type} maintenance request created successfully!`, 
        type: 'success' 
      });
      
      setTimeout(() => {
        onSave();
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create maintenance request';
      setError(errorMessage);
      setNotification({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create {formData.type} Maintenance Request</h3>
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

        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="e.g., Monthly vehicle inspection"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="equipment_id">Equipment</label>
              <select
                id="equipment_id"
                name="equipment_id"
                value={formData.equipment_id}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Equipment</option>
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} {eq.serial_number ? `(${eq.serial_number})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">
                Priority
                {autoFilled && <span className="auto-fill-badge">Auto-filled</span>}
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {selectedEquipment && selectedEquipment.team_name && (
            <div className="form-group auto-fill-info">
              <label>Maintenance Team (Auto-assigned)</label>
              <div className="auto-fill-value">{selectedEquipment.team_name}</div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="assigned_technician">
              Assigned Technician
              {autoFilled && formData.assigned_technician && (
                <span className="auto-fill-badge">Auto-selected</span>
              )}
            </label>
            <select
              id="assigned_technician"
              name="assigned_technician"
              value={formData.assigned_technician}
              onChange={handleChange}
              disabled={loading || !selectedEquipment}
            >
              <option value="">Select Technician</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} {tech.email ? `(${tech.email})` : ''}
                </option>
              ))}
            </select>
            {selectedEquipment && technicians.length === 0 && (
              <small className="form-hint">No technicians available for this equipment's team</small>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Request Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="Corrective">Corrective</option>
                <option value="Preventive">Preventive</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="scheduled_date">
                Scheduled Date
                {formData.type === 'Preventive' && <span className="required">*</span>}
              </label>
              <input
                type="date"
                id="scheduled_date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                required={formData.type === 'Preventive'}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g., 60"
                min="1"
                disabled={loading}
              />
            </div>
          </div>

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
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestFormModal;

