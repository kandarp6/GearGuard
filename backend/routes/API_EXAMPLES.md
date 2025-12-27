# Maintenance Request API Examples

## Create Maintenance Request

**Endpoint:** `POST /api/requests`

### Features
- ✅ Any user can create a request
- ✅ Auto-fetches maintenance team from equipment
- ✅ Auto-sets priority based on equipment type
- ✅ Initial status is always "New"
- ✅ Returns clean JSON with all related data

### Request Body

#### Minimal Request (with equipment)
```json
{
  "subject": "Laptop screen not working",
  "equipment_id": 1
}
```

#### Full Request
```json
{
  "subject": "Vehicle needs oil change",
  "type": "Preventive",
  "equipment_id": 2,
  "scheduled_date": "2024-02-15T10:00:00Z",
  "duration": 60,
  "assigned_technician": 2
}
```

### Auto-Logic

1. **Auto-Fetch Team**: If `equipment_id` is provided, the system automatically fetches the equipment's `default_maintenance_team` and assigns it to the request.

2. **Auto-Set Priority**: Priority is automatically determined based on equipment type:
   - **High Priority**: Vehicles, Machinery, Production equipment
   - **Medium Priority**: IT Equipment, Laptops, Computers
   - **Low Priority**: Office equipment, general items

3. **Initial Status**: Always set to "New" regardless of input.

### Response Example

```json
{
  "id": 1,
  "subject": "Laptop screen not working",
  "type": "Corrective",
  "status": "New",
  "priority": "Medium",
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
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Error Responses

#### Missing Subject
```json
{
  "error": "Subject is required"
}
```

#### Equipment Not Found
```json
{
  "error": "Equipment not found"
}
```

### cURL Examples

#### Create Request with Equipment
```bash
curl -X POST http://localhost:3001/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Laptop screen not working",
    "equipment_id": 1
  }'
```

#### Create Preventive Maintenance Request
```bash
curl -X POST http://localhost:3001/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Monthly vehicle inspection",
    "type": "Preventive",
    "equipment_id": 2,
    "scheduled_date": "2024-02-15T10:00:00Z",
    "duration": 120
  }'
```

