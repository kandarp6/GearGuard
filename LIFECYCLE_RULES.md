# Request Lifecycle Rules Implementation

## Overview

Comprehensive lifecycle validation for maintenance requests with enforced rules at each status transition.

## Status Flow

```
New → In Progress → Repaired
New → Scrap
```

## Lifecycle Rules

### ✅ Rule 1: Technician Required for "In Progress"
**Condition:** When moving request to "In Progress" status
**Requirement:** `assigned_technician` must be set
**Validation:** Enforced in both frontend and backend
**Error Message:** "Technician is required when moving request to 'In Progress' status"

### ✅ Rule 2: Duration Required for "Repaired"
**Condition:** When moving request to "Repaired" status
**Requirement:** `duration` must be set and > 0
**Validation:** Enforced in both frontend and backend
**Error Message:** "Duration is required when moving request to 'Repaired' status"

### ✅ Rule 3: Equipment Scrapped on "Scrap"
**Condition:** When moving request to "Scrap" status
**Action:** Equipment status automatically set to "Scrapped"
**System Note:** Logged on both equipment and request

### ✅ Rule 4: Technician Self-Assignment
**Feature:** Technicians can assign themselves to requests
**Endpoint:** `PATCH /api/requests/:id/assign`
**Validation:** Technician must be from request's team

## Implementation

### Backend Validation

**File:** `backend/routes/requests.js`

**Function:** `validateLifecycleRules(request, newStatus, updateData)`

**Validations:**
1. Checks technician when moving to "In Progress"
2. Checks duration when moving to "Repaired"
3. Returns clear error messages

**Applied in:**
- `PATCH /api/requests/:id/status` - Status update endpoint
- `PUT /api/requests/:id` - Full update endpoint

### Frontend Validation

**File:** `frontend/src/utils/workflowValidation.js`

**Function:** `validateLifecycleRules(request, newStatus, updateData)`

**Matches backend logic** for consistent validation

**Applied in:**
- KanbanBoard drag-and-drop
- RequestStatusModal form

### Technician Self-Assignment

**Endpoint:** `PATCH /api/requests/:id/assign`

**Request Body:**
```json
{
  "technician_id": 1
}
```

**Validation:**
- Technician must exist
- Technician must be from request's team (if team is assigned)
- Creates system note for audit trail

**Response:**
```json
{
  "id": 1,
  "subject": "Laptop repair",
  "status": "New",
  "technician": {
    "id": 1,
    "name": "Alice Williams",
    "email": "alice.williams@company.com"
  },
  "message": "Technician assigned successfully"
}
```

## API Endpoints

### Update Status with Validation
```
PATCH /api/requests/:id/status
```

**Request Body:**
```json
{
  "status": "In Progress",
  "assigned_technician": 1
}
```

or

```json
{
  "status": "Repaired",
  "duration": 60
}
```

**Validation Errors:**
- Missing technician when moving to "In Progress"
- Missing duration when moving to "Repaired"
- Invalid status transition

### Assign Technician
```
PATCH /api/requests/:id/assign
```

**Request Body:**
```json
{
  "technician_id": 1
}
```

## Error Messages

### Missing Technician
```json
{
  "error": "Technician is required when moving request to 'In Progress' status",
  "current_status": "New",
  "requested_status": "In Progress"
}
```

### Missing Duration
```json
{
  "error": "Duration is required when moving request to 'Repaired' status",
  "current_status": "In Progress",
  "requested_status": "Repaired"
}
```

### Invalid Team Assignment
```json
{
  "error": "Technician must be from the same team as the maintenance request",
  "request_team_id": 1,
  "technician_team_id": 2
}
```

## Usage Examples

### Move to In Progress (with technician)
```bash
PATCH /api/requests/1/status
{
  "status": "In Progress",
  "assigned_technician": 1
}
```

### Move to Repaired (with duration)
```bash
PATCH /api/requests/1/status
{
  "status": "Repaired",
  "duration": 120
}
```

### Self-Assign Technician
```bash
PATCH /api/requests/1/assign
{
  "technician_id": 1
}
```

### Invalid: Move to In Progress without technician
```bash
PATCH /api/requests/1/status
{
  "status": "In Progress"
}
# Error: Technician is required when moving request to "In Progress" status
```

## Frontend Components

### RequestStatusModal
**New component** for updating request status with:
- Status dropdown
- Conditional technician field (required for In Progress)
- Conditional duration field (required for Repaired)
- Form validation
- Clear error messages

### KanbanBoard
**Enhanced** with lifecycle validation:
- Checks rules before allowing drag-and-drop
- Shows error notifications for missing requirements
- Prevents invalid transitions

## Status Behavior

### New
- No special requirements
- Can move to "In Progress" or "Scrap"

### In Progress
- **Requires:** Technician must be assigned
- Can move to "Repaired"
- Cannot move back to "New"

### Repaired
- **Requires:** Duration must be set
- Terminal state (cannot change)
- Equipment remains active

### Scrap
- **Action:** Equipment automatically scrapped
- Terminal state (cannot change)
- System notes created

## Validation Flow

1. **Status Transition Check** - Validates allowed transitions
2. **Lifecycle Rules Check** - Validates required fields
3. **Update Request** - Updates status and related fields
4. **Side Effects** - Handles scrap logic, system notes
5. **Response** - Returns updated request with all data

## Benefits

1. **Data Integrity:** Ensures required information is captured
2. **Workflow Enforcement:** Prevents incomplete status transitions
3. **User Guidance:** Clear error messages guide users
4. **Audit Trail:** System notes track all changes
5. **Consistency:** Same rules in frontend and backend

## Future Enhancements

- Bulk status updates with validation
- Workflow templates
- Automated notifications for missing requirements
- Dashboard showing requests needing attention

