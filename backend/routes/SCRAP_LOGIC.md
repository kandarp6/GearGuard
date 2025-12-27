# Scrap Logic Documentation

## Overview

When a maintenance request is marked as "Scrap", the system automatically:
1. Updates the associated equipment status to "Scrapped"
2. Blocks new maintenance requests for that equipment
3. Logs system notes for audit trail

## Implementation Details

### 1. Equipment Status Update

When a maintenance request status changes to "Scrap":
- The associated equipment's status is automatically updated to "Scrapped"
- This only happens if the equipment is not already scrapped
- The equipment's `updated_at` timestamp is also updated

### 2. Blocking New Requests

When creating a new maintenance request:
- The system checks if the equipment status is "Scrapped"
- If scrapped, the request creation is blocked with a clear error message
- This prevents any new maintenance work on scrapped equipment

### 3. System Notes Logging

Two system notes are created when scrap occurs:

1. **Equipment Note**: Logged on the equipment entity
   - Type: `scrap`
   - Message: Includes equipment name, ID, and the maintenance request details

2. **Maintenance Request Note**: Logged on the maintenance request entity
   - Type: `scrap`
   - Message: Confirms the scrap action and equipment status change

## API Endpoints

### Update Status to Scrap

**Endpoint:** `PATCH /api/requests/:id/status`

**Request:**
```json
{
  "status": "Scrap"
}
```

**Response:**
```json
{
  "id": 1,
  "subject": "Equipment beyond repair",
  "status": "Scrap",
  "equipment": {
    "id": 5,
    "name": "Old CNC Machine",
    "status": "Scrapped"
  },
  ...
}
```

### Create Request (Blocked for Scrapped Equipment)

**Endpoint:** `POST /api/requests`

**Request:**
```json
{
  "subject": "New maintenance request",
  "equipment_id": 5
}
```

**Error Response (if equipment is scrapped):**
```json
{
  "error": "Cannot create maintenance request for scrapped equipment",
  "equipment_id": 5,
  "equipment_name": "Old CNC Machine",
  "equipment_status": "Scrapped"
}
```

### View System Notes

**Endpoint:** `GET /api/notes/:entityType/:entityId`

**Example:**
```bash
GET /api/notes/equipment/5
GET /api/notes/maintenance_request/1
```

**Response:**
```json
[
  {
    "id": 1,
    "entity_type": "equipment",
    "entity_id": 5,
    "note_type": "scrap",
    "message": "Equipment \"Old CNC Machine\" (ID: 5) marked as Scrapped due to maintenance request #1: \"Equipment beyond repair\"",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
]
```

## Workflow Example

1. **Maintenance Request Created:**
   ```
   Request #1: "CNC Machine not working"
   Equipment: CNC Machine #5 (Status: Active)
   ```

2. **Request Marked as Scrap:**
   ```
   PATCH /api/requests/1/status
   { "status": "Scrap" }
   ```

3. **Automatic Actions:**
   - ✅ Request status → "Scrap"
   - ✅ Equipment #5 status → "Scrapped"
   - ✅ System note created on Equipment #5
   - ✅ System note created on Request #1

4. **Future Request Blocked:**
   ```
   POST /api/requests
   { "subject": "Fix machine", "equipment_id": 5 }
   
   Response: 400 Error - Cannot create maintenance request for scrapped equipment
   ```

## Database Schema

### system_notes Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| entity_type | TEXT | Type of entity ('equipment', 'maintenance_request') |
| entity_id | INTEGER | ID of the entity |
| note_type | TEXT | Type of note ('scrap', 'system', etc.) |
| message | TEXT | Note message |
| created_at | TEXT | Timestamp |

## Notes

- Equipment status "Scrapped" is a terminal state (cannot be changed back)
- System notes provide a complete audit trail
- The scrap logic is idempotent - marking as Scrap multiple times won't duplicate notes
- Equipment must be associated with the request for scrap logic to apply

