# Drag-and-Drop Implementation for Kanban Board

## Overview

Complete drag-and-drop functionality for the maintenance requests Kanban board with workflow validation, API integration, and user feedback.

## Features

### ✅ Core Functionality
- **Drag and Drop**: Move cards between columns using mouse or touch
- **Status Updates**: Automatically updates request status via API
- **Workflow Validation**: Client-side validation before API call
- **Optimistic Updates**: Immediate UI feedback
- **Error Handling**: Rollback on failure with clear error messages

### ✅ User Experience
- **Success Notifications**: Toast notifications for successful moves
- **Error Notifications**: Clear error messages for invalid transitions
- **Visual Feedback**: Loading states during updates
- **Smooth Animations**: Transitions and hover effects

## Implementation Details

### 1. Workflow Validation

**File:** `frontend/src/utils/workflowValidation.js`

Client-side validation that matches backend logic:

**Allowed Transitions:**
- `New` → `In Progress` or `Scrap`
- `In Progress` → `Repaired`
- Terminal states (`Repaired`, `Scrap`) cannot be changed

**Validation Function:**
```javascript
validateStatusTransition(currentStatus, newStatus)
// Returns: { valid: boolean, error: string }
```

### 2. Drag-and-Drop Handler

**File:** `frontend/src/components/KanbanBoard.js`

**Flow:**
1. User drags card to new column
2. Check if dropped on valid target
3. Find request and current status
4. **Client-side validation** (prevents invalid API calls)
5. **Optimistic update** (immediate UI feedback)
6. **API call** to update status
7. **Reload data** to get latest state
8. **Show notification** (success or error)
9. **Rollback** on error

### 3. Notification System

**File:** `frontend/src/components/Notification.js`

Toast-style notifications with:
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)

Auto-dismisses after 3 seconds or manual close.

### 4. API Integration

**Endpoint:** `PATCH /api/requests/:id/status`

**Request Body:**
```json
{
  "status": "In Progress"
}
```

**Response:**
- Success: Updated request object
- Error: Error message with validation details

## Workflow Validation Rules

### Valid Transitions

| From | To | Valid |
|------|-----|-------|
| New | In Progress | ✅ |
| New | Scrap | ✅ |
| In Progress | Repaired | ✅ |
| Any | Same Status | ✅ (idempotent) |

### Invalid Transitions

| From | To | Reason |
|------|-----|--------|
| Repaired | Any | Terminal state |
| Scrap | Any | Terminal state |
| In Progress | New | Not in workflow |
| In Progress | Scrap | Only New can go to Scrap |
| Repaired | In Progress | Cannot go backwards |

## Error Messages

### Client-Side Validation
- `"Invalid status: X. Valid statuses are: New, In Progress, Repaired, Scrap"`
- `"Cannot change status from terminal state: Repaired"`
- `"Invalid transition: New → Repaired. Allowed transitions: In Progress, Scrap"`

### API Errors
- Backend validation errors (if client validation is bypassed)
- Network errors
- Server errors

## User Flow

1. **User drags card** from one column to another
2. **Validation check** - If invalid, show error notification, cancel drag
3. **Optimistic update** - Card moves immediately in UI
4. **API call** - Update status on backend
5. **Success** - Show success notification, reload data
6. **Error** - Revert card position, show error notification

## Code Structure

```
frontend/src/
├── components/
│   ├── KanbanBoard.js       # Main board with drag handler
│   ├── KanbanColumn.js      # Drop zones
│   ├── RequestCard.js       # Draggable cards
│   └── Notification.js      # Toast notifications
├── utils/
│   └── workflowValidation.js # Validation logic
└── services/
    └── api.js               # API calls
```

## Testing Scenarios

### ✅ Valid Moves
- New → In Progress
- New → Scrap
- In Progress → Repaired

### ❌ Invalid Moves (Blocked)
- Repaired → In Progress (shows error)
- Scrap → Repaired (shows error)
- In Progress → Scrap (shows error)
- In Progress → New (shows error)

### Edge Cases
- Dragging to same column (no action)
- Network failure (rollback + error)
- Backend validation failure (rollback + error)
- Missing request (error notification)

## Performance

- **Optimistic Updates**: Immediate UI feedback
- **Single API Call**: Only one request per drag
- **Efficient Reload**: Only reloads after successful update
- **State Management**: Minimal re-renders

## Accessibility

- Keyboard navigation support (via @dnd-kit)
- Screen reader friendly notifications
- Clear visual feedback
- Error messages are descriptive

## Future Enhancements

- Undo/Redo functionality
- Bulk status updates
- Drag multiple cards
- Keyboard shortcuts
- Animation improvements
- Real-time sync (WebSocket)

