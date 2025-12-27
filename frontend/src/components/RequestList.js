import React, { useState, useEffect } from 'react';
import { requestsAPI } from '../services/api';
import { isOverdue, getOverdueCount } from '../utils/overdueHelper';
import { getTeamIcon } from '../utils/teamIcons';
import './RequestList.css';

function RequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, overdue, corrective, preventive

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await requestsAPI.getAll();
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRequests = () => {
    let filtered = requests;

    if (filter === 'overdue') {
      filtered = filtered.filter(r => isOverdue(r));
    } else if (filter === 'corrective') {
      filtered = filtered.filter(r => r.type === 'Corrective');
    } else if (filter === 'preventive') {
      filtered = filtered.filter(r => r.type === 'Preventive');
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': '#6c757d',
      'In Progress': '#007bff',
      'Repaired': '#28a745',
      'Scrap': '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': '#6c757d',
      'Medium': '#ffc107',
      'High': '#fd7e14',
      'Urgent': '#dc3545',
    };
    return colors[priority] || '#6c757d';
  };

  if (loading) {
    return <div className="request-list-loading">Loading maintenance requests...</div>;
  }

  const filteredRequests = getFilteredRequests();
  const overdueCount = getOverdueCount(requests);

  return (
    <div className="request-list">
      <div className="request-list-header">
        <h2>Maintenance Requests</h2>
        <div className="request-list-actions">
          {overdueCount > 0 && (
            <div className="overdue-badge-large">
              <span className="overdue-count">{overdueCount}</span>
              <span>Overdue</span>
            </div>
          )}
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Requests</option>
            <option value="overdue">Overdue ({overdueCount})</option>
            <option value="corrective">Corrective</option>
            <option value="preventive">Preventive</option>
          </select>
          <button onClick={loadRequests} className="btn btn-secondary btn-sm">
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="request-list-error">{error}</div>}

      <div className="request-table-container">
        <table className="request-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Type</th>
              <th>Equipment</th>
              <th>Scheduled Date</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Team</th>
              <th>Technician</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-state">
                  No maintenance requests found
                </td>
              </tr>
            ) : (
              filteredRequests.map((request) => {
                const overdue = isOverdue(request);
                return (
                  <tr 
                    key={request.id} 
                    className={overdue ? 'overdue-row' : ''}
                  >
                    <td>
                      <div className="request-subject">
                        {request.subject}
                        {overdue && <span className="overdue-badge">⚠ Overdue</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`type-badge ${request.type.toLowerCase()}`}>
                        {request.type}
                      </span>
                    </td>
                    <td>{request.equipment_name || 'N/A'}</td>
                    <td>
                      <span className={overdue ? 'overdue-date' : ''}>
                        {formatDate(request.scheduled_date)}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(request.priority) }}
                      >
                        {request.priority}
                      </span>
                    </td>
                    <td>
                      {request.team_name ? (
                        <span className="team-cell">
                          <span className="team-icon">{getTeamIcon(request.team_name, request.team_specialization)}</span>
                          <span>{request.team_name}</span>
                        </span>
                      ) : (
                        'Unassigned'
                      )}
                    </td>
                    <td>{request.technician_name || 'Unassigned'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RequestList;

