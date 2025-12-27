import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { requestsAPI } from '../services/api';
import { validateStatusTransition, validateLifecycleRules } from '../utils/workflowValidation';
import { isOverdue } from '../utils/overdueHelper';
import RequestCard from './RequestCard';
import KanbanColumn from './KanbanColumn';
import Notification from './Notification';
import './KanbanBoard.css';

const COLUMNS = [
  { id: 'New', title: 'New', color: '#6c757d' },
  { id: 'In Progress', title: 'In Progress', color: '#007bff' },
  { id: 'Repaired', title: 'Repaired', color: '#28a745' },
  { id: 'Scrap', title: 'Scrap', color: '#dc3545' },
];

function KanbanBoard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [notification, setNotification] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    // Check if dropped on a valid target
    if (!over) {
      return;
    }

    const requestId = active.id;
    const newStatus = over.id;

    // Find the request (handle both string and number IDs)
    const request = requests.find(r => r.id == requestId || String(r.id) === String(requestId));
    if (!request) {
      showNotification('Request not found', 'error');
      return;
    }

    const currentStatus = request.status;

    // If dropped in the same column, do nothing
    if (currentStatus === newStatus) {
      return;
    }

    // Client-side workflow validation
    const transitionValidation = validateStatusTransition(currentStatus, newStatus);
    if (!transitionValidation.valid) {
      showNotification(transitionValidation.error, 'error');
      return;
    }

    // Validate lifecycle rules (technician for In Progress, duration for Repaired)
    const lifecycleValidation = validateLifecycleRules(request, newStatus);
    if (!lifecycleValidation.valid) {
      showNotification(
        `${lifecycleValidation.error}. Please update the request with required information first.`,
        'error'
      );
      return;
    }

    // Store original state for potential rollback
    const originalRequests = [...requests];

    // Optimistic update - immediately update UI
    const updatedRequests = requests.map(r =>
      r.id === requestId ? { ...r, status: newStatus } : r
    );
    setRequests(updatedRequests);
    setUpdating(prev => ({ ...prev, [requestId]: true }));

    try {
      // Prepare update data with required fields
      const updateData = {};
      
      // Include technician if moving to In Progress and request has one
      if (newStatus === 'In Progress' && request.assigned_technician) {
        updateData.assigned_technician = request.assigned_technician;
      }
      
      // Include duration if moving to Repaired and request has one
      if (newStatus === 'Repaired' && request.duration) {
        updateData.duration = request.duration;
      }

      // Update status via API
      await requestsAPI.updateStatus(requestId, newStatus, updateData);
      
      // Reload to get latest data (includes any backend-side effects like equipment scrapping)
      await loadRequests();
      
      // Show success message
      showNotification(
        `Request "${request.subject}" moved from ${currentStatus} to ${newStatus}`,
        'success'
      );
    } catch (err) {
      // Revert optimistic update on error
      setRequests(originalRequests);
      
      // Show error message
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          'Failed to update request status';
      showNotification(errorMessage, 'error');
    } finally {
      // Clear updating state
      setUpdating(prev => {
        const newState = { ...prev };
        delete newState[requestId];
        return newState;
      });
    }
  };

  const getRequestsByStatus = (status) => {
    return requests.filter(r => r.status === status);
  };

  if (loading) {
    return <div className="kanban-loading">Loading maintenance requests...</div>;
  }

  return (
    <div className="kanban-board">
      <div className="kanban-header">
        <h2>Maintenance Requests Kanban Board</h2>
        <button onClick={loadRequests} className="btn btn-secondary btn-sm">
          Refresh
        </button>
      </div>

      {error && <div className="kanban-error">{error}</div>}

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-columns">
          {COLUMNS.map((column) => {
            const columnRequests = getRequestsByStatus(column.id);
            return (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                count={columnRequests.length}
              >
                <SortableContext
                  items={columnRequests.map(r => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columnRequests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      isOverdue={isOverdue(request)}
                      isUpdating={updating[request.id]}
                    />
                  ))}
                </SortableContext>
              </KanbanColumn>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}

export default KanbanBoard;

