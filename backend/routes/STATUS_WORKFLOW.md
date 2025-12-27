# Status Workflow API Documentation

## Overview

The Status Workflow API enforces a strict state machine for maintenance request status transitions. This ensures data integrity and prevents invalid status changes.

## Allowed Status Transitions

```
New → In Progress → Repaired
New → Scrap
```

### Status Flow Diagram

```
        New
       /   \
      /     \
In Progress  Scrap
      |
   Repaired
```

## Endpoints

### Update Status (Recommended)

**Endpoint:** `PATCH /api/requests/:id/status`

Updates only the status field with workflow validation.

**Request Body:**
```json
{
  "status": "In Progress"
}
```

**Response:**
```json
{
  "id": 1,
  "subject": "Laptop screen not working",
  "type": "Corrective",
  "status": "In Progress",
  "priority": "Medium",
  "previous_status": "New",
  "equipment": {
    "id": 1,
    "name": "Dell Laptop XPS 15",
    "serial_number": "DL-XPS-001",
    "location": "Building A, Floor 3"
  },
  "team": {
    "id": 1,
    "team_name": "IT Support Team",
    "specialization": "IT Equipment & Laptops"
  },
  "technician": null,
  "scheduled_date": null,
  "duration": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:35:00.000Z"
}
```

### Update Request (Full Update)

**Endpoint:** `PUT /api/requests/:id`

Updates any field, including status (with validation).

**Request Body:**
```json
{
  "subject": "Updated subject",
  "status": "Repaired",
  "priority": "High"
}
```

## Valid Transitions

| From | To | Valid |
|------|-----|-------|
| New | In Progress | ✅ |
| New | Scrap | ✅ |
| In Progress | Repaired | ✅ |
| Any | Same Status | ✅ (idempotent) |

## Invalid Transitions

| From | To | Reason |
|------|-----|--------|
| Repaired | Any | Terminal state |
| Scrap | Any | Terminal state |
| In Progress | New | Not in workflow |
| In Progress | Scrap | Only New can go to Scrap |
| Repaired | In Progress | Cannot go backwards |
| Scrap | Repaired | Cannot go backwards |

## Error Responses

### Invalid Transition
```json
{
  "error": "Invalid transition: In Progress → Scrap. Allowed transitions: Repaired",
  "current_status": "In Progress",
  "requested_status": "Scrap"
}
```

### Terminal State
```json
{
  "error": "Cannot change status from terminal state: Repaired",
  "current_status": "Repaired",
  "requested_status": "In Progress"
}
```

### Invalid Status Value
```json
{
  "error": "Invalid status: Pending. Valid statuses are: New, In Progress, Repaired, Scrap"
}
```

### Missing Status
```json
{
  "error": "Status is required"
}
```

## Examples

### Transition: New → In Progress
```bash
curl -X PATCH http://localhost:3001/api/requests/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "In Progress"}'
```

### Transition: In Progress → Repaired
```bash
curl -X PATCH http://localhost:3001/api/requests/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Repaired"}'
```

### Transition: New → Scrap
```bash
curl -X PATCH http://localhost:3001/api/requests/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Scrap"}'
```

### Invalid Transition (Will Fail)
```bash
curl -X PATCH http://localhost:3001/api/requests/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "New"}'
# Error: Cannot change status from terminal state: Repaired
```

## Status Definitions

- **New**: Request has been created but not yet started
- **In Progress**: Work has begun on the request
- **Repaired**: Maintenance completed successfully (terminal state)
- **Scrap**: Equipment is beyond repair and should be scrapped (terminal state)

## Notes

- Status transitions are case-insensitive but normalized to proper case
- Terminal states (Repaired, Scrap) cannot be changed once reached
- The same status can be set multiple times (idempotent operation)
- Both `PATCH /api/requests/:id/status` and `PUT /api/requests/:id` validate status transitions

