# Request Lifecycle Rules - Implementation Summary

## ✅ Implemented Features

### 1. Technician Required for "In Progress" ✅
- **Backend:** Validates technician is set when moving to "In Progress"
- **Frontend:** Validates before allowing drag-and-drop
- **Error:** Clear message if technician is missing

### 2. Duration Required for "Repaired" ✅
- **Backend:** Validates duration > 0 when moving to "Repaired"
- **Frontend:** Validates before allowing drag-and-drop
- **Error:** Clear message if duration is missing

### 3. Equipment Scrapped on "Scrap" ✅
- **Already Implemented:** Equipment status → "Scrapped"
- **System Notes:** Audit trail created
- **Request Prevention:** New requests blocked for scrapped equipment

### 4. Technician Self-Assignment ✅
- **New Endpoint:** `PATCH /api/requests/:id/assign`
- **Validation:** Technician must be from request's team
- **System Notes:** Assignment logged

## Status Flow

```
New → In Progress (requires technician) → Repaired (requires duration)
New → Scrap (equipment scrapped)
```

## API Endpoints

### Update Status
```
PATCH /api/requests/:id/status
Body: {
  "status": "In Progress",
  "assigned_technician": 1  // Optional, but validated if required
}
```

### Assign Technician
```
PATCH /api/requests/:id/assign
Body: {
  "technician_id": 1
}
```

## Validation Rules

| From | To | Required Fields | Validation |
|------|-----|----------------|------------|
| New | In Progress | `assigned_technician` | ✅ Enforced |
| In Progress | Repaired | `duration` | ✅ Enforced |
| New | Scrap | None | Equipment auto-scrapped |
| Any | Same | None | Allowed (idempotent) |

## Error Handling

All validations return clear error messages:
- "Technician is required when moving request to 'In Progress' status"
- "Duration is required when moving request to 'Repaired' status"
- "Technician must be from the same team as the maintenance request"

## Components

1. **Backend Validation** - `validateLifecycleRules()` function
2. **Frontend Validation** - `validateLifecycleRules()` utility
3. **RequestStatusModal** - Form for status updates with conditional fields
4. **KanbanBoard** - Enhanced with lifecycle validation

## Usage

### Valid Transition (with required fields)
```javascript
// Request has technician, moving to In Progress
PATCH /api/requests/1/status
{ "status": "In Progress" }
// ✅ Success

// Request has duration, moving to Repaired
PATCH /api/requests/1/status
{ "status": "Repaired" }
// ✅ Success
```

### Invalid Transition (missing required fields)
```javascript
// Request has no technician, moving to In Progress
PATCH /api/requests/1/status
{ "status": "In Progress" }
// ❌ Error: Technician is required

// Request has no duration, moving to Repaired
PATCH /api/requests/1/status
{ "status": "Repaired" }
// ❌ Error: Duration is required
```

### Self-Assignment
```javascript
// Technician assigns themselves
PATCH /api/requests/1/assign
{ "technician_id": 1 }
// ✅ Success: Technician assigned
```

All lifecycle rules are now implemented and enforced! 🎉

