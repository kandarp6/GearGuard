# Auto-Fill Logic Implementation

## Overview

Smart auto-fill functionality for maintenance request forms that automatically populates fields when equipment is selected.

## Features

### ✅ Auto-Fill on Equipment Selection

When equipment is selected in the request form:

1. **Maintenance Team** - Auto-assigned from equipment's `default_maintenance_team`
   - Displayed as read-only info box
   - Backend automatically assigns team_id

2. **Priority** - Auto-set based on equipment type
   - **High**: Vehicles, Machinery, Production equipment
   - **Medium**: IT Equipment, Laptops, Computers
   - **Low**: Office equipment, general items
   - Visual "Auto-filled" badge shown

3. **Default Technician** - Auto-selected from team
   - First available technician from the equipment's maintenance team
   - Dropdown populated with all team technicians
   - User can change selection if needed
   - Visual "Auto-selected" badge shown

## Implementation Details

### Frontend Logic

**File:** `frontend/src/components/RequestFormModal.js`

**Auto-Fill Flow:**
1. User selects equipment from dropdown
2. Fetch equipment details (includes team info)
3. Auto-set priority using `determinePriority()` helper
4. Fetch technicians for the equipment's team
5. Auto-select first technician (if available)
6. Update form fields with auto-filled values
7. Show notification about auto-filled fields

### Priority Helper

**File:** `frontend/src/utils/priorityHelper.js`

Matches backend logic exactly:
- Analyzes equipment name and team specialization
- Returns: 'High', 'Medium', or 'Low'
- Default: 'Medium'

### API Integration

**Endpoints Used:**
- `GET /api/equipment/:id` - Get equipment details with team
- `GET /api/technicians/team/:teamId` - Get technicians for team

**Backend Auto-Fill:**
- Backend also performs auto-fill as fallback
- Frontend auto-fill provides immediate user feedback
- Both work together for best UX

## User Experience

### Visual Indicators

1. **Auto-Fill Badges**
   - Small blue badges next to auto-filled fields
   - Shows "Auto-filled" or "Auto-selected"
   - Indicates fields were automatically populated

2. **Team Info Box**
   - Highlighted info box showing auto-assigned team
   - Read-only display
   - Blue left border for visibility

3. **Notifications**
   - Info notification when auto-fill occurs
   - Shows what was auto-filled
   - Auto-dismisses after 2 seconds

### Form Behavior

- **Equipment Selection**: Triggers auto-fill
- **Equipment Cleared**: Resets auto-filled fields
- **Manual Override**: User can change any auto-filled value
- **Technician Dropdown**: Populated only when equipment has a team

## Request Types

### Corrective Maintenance
- Type: "Corrective"
- Scheduled date: Optional
- Auto-fill: Team, Priority, Technician

### Preventive Maintenance
- Type: "Preventive"
- Scheduled date: Required
- Auto-fill: Team, Priority, Technician

## Auto-Fill Rules

### Priority Determination

**High Priority:**
- Equipment names containing: vehicle, van, truck, machine, cnc, production, factory
- Team specialization: vehicle, machinery, fleet

**Medium Priority:**
- Equipment names containing: laptop, computer, desktop, server, printer, monitor
- Team specialization: it, computer

**Low Priority:**
- All other equipment

### Technician Selection

- Fetches all technicians from equipment's maintenance team
- Auto-selects first technician (if team has technicians)
- User can change to any other team technician
- If no technicians available, shows hint message

## Example Flow

1. **User opens form** → Form is empty
2. **User selects "Company Van #5"** → 
   - Priority auto-set to "High" (vehicle)
   - Team auto-assigned: "Vehicle Maintenance"
   - Technicians loaded: Mike Brown, John Smith
   - Technician auto-selected: Mike Brown
   - Notification: "Auto-filled: Priority set to High, Technician: Mike Brown"
3. **User can modify** → Can change priority or technician if needed
4. **User submits** → Request created with auto-filled values

## Error Handling

- **Equipment not found**: Shows error notification
- **Team has no technicians**: Shows hint, allows manual selection later
- **Network errors**: Gracefully handles, allows manual entry
- **Backend validation**: Backend validates and can override if needed

## Benefits

1. **Faster Request Creation**: Reduces manual data entry
2. **Consistency**: Ensures correct team and priority assignment
3. **User Feedback**: Clear indication of auto-filled fields
4. **Flexibility**: Users can override any auto-filled value
5. **Smart Logic**: Priority based on equipment type

## Status

- Initial status is always "New" 
- Cannot be changed during creation
- Set automatically by API

