import React, { useState, useEffect } from 'react';
import { equipmentAPI } from '../services/api';
import { getTeamIcon } from '../utils/teamIcons';
import './EquipmentList.css';

function EquipmentList({ onSelectEquipment, onCreateNew }) {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, scrapped

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentAPI.getAll();
      setEquipment(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleScrap = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to mark "${name}" as scrapped?`)) {
      return;
    }

    try {
      await equipmentAPI.scrap(id);
      await loadEquipment();
      alert('Equipment marked as scrapped successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark equipment as scrapped');
    }
  };

  const filteredEquipment = equipment.filter(item => {
    if (filter === 'active') return item.status === 'Active';
    if (filter === 'scrapped') return item.status === 'Scrapped';
    return true;
  });

  if (loading) {
    return <div className="loading">Loading equipment...</div>;
  }

  return (
    <div className="equipment-list">
      <div className="equipment-list-header">
        <h2>Equipment Management</h2>
        <div className="equipment-list-actions">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Equipment</option>
            <option value="active">Active</option>
            <option value="scrapped">Scrapped</option>
          </select>
          <button onClick={onCreateNew} className="btn btn-primary">
            + Add Equipment
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="equipment-grid">
        {filteredEquipment.length === 0 ? (
          <div className="empty-state">No equipment found</div>
        ) : (
          filteredEquipment.map((item) => (
            <div
              key={item.id}
              className={`equipment-card ${item.status === 'Scrapped' ? 'scrapped' : ''}`}
              onClick={() => onSelectEquipment(item.id)}
            >
              <div className="equipment-card-header">
                <h3>{item.name}</h3>
                <span className={`status-badge ${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
              <div className="equipment-card-body">
                <p><strong>Serial:</strong> {item.serial_number || 'N/A'}</p>
                <p><strong>Department:</strong> {item.department || 'N/A'}</p>
                <p><strong>Location:</strong> {item.location || 'N/A'}</p>
                <p><strong>Team:</strong> 
                  {item.team_name ? (
                    <span className="team-display">
                      <span className="team-icon">{getTeamIcon(item.team_name, item.team_specialization)}</span>
                      <span>{item.team_name}</span>
                    </span>
                  ) : (
                    'Unassigned'
                  )}
                </p>
              </div>
              <div className="equipment-card-actions">
                {item.status !== 'Scrapped' && (
                  <button
                    onClick={(e) => handleScrap(item.id, item.name, e)}
                    className="btn btn-danger btn-sm"
                  >
                    Mark as Scrapped
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default EquipmentList;

