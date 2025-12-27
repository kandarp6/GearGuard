import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import './KanbanColumn.css';

function KanbanColumn({ id, title, color, count, children, isValidDrop = true }) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: !isValidDrop,
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'drag-over' : ''}`}
      style={{ borderTopColor: color }}
    >
      <div className="kanban-column-header" style={{ borderLeftColor: color }}>
        <h3>{title}</h3>
        <span className="column-count">{count}</span>
      </div>
      <div className="kanban-column-content">
        {children}
        {count === 0 && (
          <div className="empty-column">No requests</div>
        )}
      </div>
    </div>
  );
}

export default KanbanColumn;

