# Database Schema Documentation

## Overview

GearGuard uses SQLite with proper relational constraints and foreign keys. All relationships are enforced at the database level.

## Entity Relationships

```
MaintenanceTeam (1) ──< (N) Equipment
MaintenanceTeam (1) ──< (N) Technician
Equipment (1) ──< (N) MaintenanceRequest
MaintenanceTeam (1) ──< (N) MaintenanceRequest
Technician (1) ──< (N) MaintenanceRequest
```

## Tables

### 1. maintenance_teams

Base table with no dependencies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| team_name | TEXT | NOT NULL | Name of the maintenance team |
| specialization | TEXT | | Specialization area |
| created_at | TEXT | NOT NULL | Creation timestamp |
| updated_at | TEXT | NOT NULL | Last update timestamp |

**Relationships:**
- Referenced by: `equipment.default_maintenance_team`
- Referenced by: `technicians.team_id`
- Referenced by: `maintenance_requests.team_id`

---

### 2. equipment

References: `maintenance_teams`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Equipment name |
| serial_number | TEXT | UNIQUE | Serial number |
| department | TEXT | | Department assignment |
| assigned_employee | TEXT | | Employee assigned to equipment |
| purchase_date | TEXT | | Purchase date (ISO format) |
| warranty_expiry | TEXT | | Warranty expiration date |
| location | TEXT | | Physical location |
| default_maintenance_team | INTEGER | FK → maintenance_teams(id), ON DELETE SET NULL | Auto-mapped team |
| status | TEXT | NOT NULL, CHECK('Active'/'Scrapped') | Equipment status |
| created_at | TEXT | NOT NULL | Creation timestamp |
| updated_at | TEXT | NOT NULL | Last update timestamp |

**Relationships:**
- References: `maintenance_teams` (default_maintenance_team)
- Referenced by: `maintenance_requests.equipment_id`

**Indexes:**
- `idx_equipment_team` on `default_maintenance_team`

---

### 3. technicians

References: `maintenance_teams`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Technician name |
| email | TEXT | NOT NULL, UNIQUE | Email address |
| team_id | INTEGER | FK → maintenance_teams(id), ON DELETE SET NULL | Team assignment |
| created_at | TEXT | NOT NULL | Creation timestamp |
| updated_at | TEXT | NOT NULL | Last update timestamp |

**Relationships:**
- References: `maintenance_teams` (team_id)
- Referenced by: `maintenance_requests.assigned_technician`

**Indexes:**
- `idx_technician_team` on `team_id`

---

### 4. maintenance_requests

References: `equipment`, `maintenance_teams`, `technicians`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier |
| subject | TEXT | NOT NULL | Request subject/title |
| type | TEXT | NOT NULL, CHECK('Corrective'/'Preventive') | Request type |
| equipment_id | INTEGER | FK → equipment(id), ON DELETE SET NULL | Related equipment |
| team_id | INTEGER | FK → maintenance_teams(id), ON DELETE SET NULL | Assigned team |
| assigned_technician | INTEGER | FK → technicians(id), ON DELETE SET NULL | Assigned technician |
| scheduled_date | TEXT | | Scheduled date (ISO format) |
| duration | INTEGER | | Duration in minutes |
| priority | TEXT | NOT NULL, CHECK('Low'/'Medium'/'High'/'Urgent') | Priority level |
| status | TEXT | NOT NULL, CHECK('New'/'In Progress'/'Repaired'/'Scrap') | Request status |
| created_at | TEXT | NOT NULL | Creation timestamp |
| updated_at | TEXT | NOT NULL | Last update timestamp |

**Relationships:**
- References: `equipment` (equipment_id)
- References: `maintenance_teams` (team_id)
- References: `technicians` (assigned_technician)

**Indexes:**
- `idx_request_equipment` on `equipment_id`
- `idx_request_team` on `team_id`
- `idx_request_technician` on `assigned_technician`
- `idx_request_status` on `status`
- `idx_request_type` on `type`
- `idx_request_scheduled_date` on `scheduled_date`

---

## Foreign Key Constraints

All foreign keys use `ON DELETE SET NULL` to prevent cascading deletions and maintain data integrity. This means:
- If a team is deleted, equipment and technicians remain but their team references are set to NULL
- If equipment is deleted, maintenance requests remain but equipment reference is set to NULL
- If a technician is deleted, maintenance requests remain but technician reference is set to NULL

## Auto-Mapping Logic

When creating a maintenance request:
1. If `equipment_id` is provided but `team_id` is not, the system automatically assigns the equipment's `default_maintenance_team` to the request
2. This enables the "Equipment → Team auto-mapping" feature

## Data Validation

- Status fields use CHECK constraints to ensure only valid values
- Email addresses are unique for technicians
- Serial numbers are unique for equipment
- All timestamps are stored in ISO 8601 format (TEXT)

