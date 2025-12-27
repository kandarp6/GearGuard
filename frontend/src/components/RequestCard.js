import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getTeamIcon, getTeamColor } from '../utils/teamIcons';
import './RequestCard.css';

function RequestCard({ request, isOverdue, isUpdating }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Low': '#6c757d',
      'Medium': '#ffc107',
      'High': '#fd7e14',
      'Urgent': '#dc3545',
    };
    return colors[priority] || colors.Medium;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`request-card ${isOverdue ? 'overdue' : ''} ${isUpdating ? 'updating' : ''}`}
    >
      <div className="card-header">
        <h4 className="card-title">{request.subject}</h4>
        <span
          className="priority-badge"
          style={{ backgroundColor: getPriorityColor(request.priority) }}
        >
          {request.priority}
        </span>
      </div>

      <div className="card-body">
        {request.equipment_name && (
          <div className="card-info">
            <span className="card-label">Equipment:</span>
            <span className="card-value">{request.equipment_name}</span>
          </div>
        )}

        {request.type && (
          <div className="card-info">
            <span className="card-label">Type:</span>
            <span className={`card-value type-badge ${request.type.toLowerCase()}`}>
              {request.type}
            </span>
          </div>
        )}

        {request.scheduled_date && (
          <div className="card-info">
            <span className="card-label">Scheduled:</span>
            <span className={`card-value ${isOverdue ? 'overdue-text' : ''}`}>
              {formatDate(request.scheduled_date)}
            </span>
          </div>
        )}

        {request.team_name && (
          <div className="card-info">
            <span className="card-label">Team:</span>
            <span className="card-value team-badge">
              <span className="team-icon">{getTeamIcon(request.team_name, request.team_specialization)}</span>
              <span>{request.team_name}</span>
            </span>
          </div>
        )}
      </div>

      <div className="card-footer">
        {request.technician_name ? (
          <div className="technician-info">
            <div
              className="technician-avatar"
              title={request.technician_name}
            >
              {getInitials(request.technician_name)}
            </div>
            <span className="technician-name">{request.technician_name}</span>
          </div>
        ) : (
          <div className="no-technician">Unassigned</div>
        )}
      </div>

      {isOverdue && (
        <div className="overdue-indicator" title="Overdue">
          ⚠️
        </div>
      )}
    </div>
  );
}

export default RequestCard;

