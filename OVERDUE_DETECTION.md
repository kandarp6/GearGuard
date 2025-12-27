# Overdue Detection Implementation

## Overview

Comprehensive overdue detection system for maintenance requests with consistent logic across frontend and backend, plus visual indicators throughout the UI.

## Overdue Conditions

A maintenance request is considered **overdue** if:
1. ✅ It has a `scheduled_date`
2. ✅ The scheduled date is **before today** (in the past)
3. ✅ Status is **NOT** "Repaired" or "Scrap" (terminal states)

## Implementation

### Backend

**File:** `backend/routes/requests.js`

**Features:**
- `isRequestOverdue()` function - Detects overdue requests
- Adds `is_overdue` flag to all API responses
- Supports `?overdue=true` query parameter to filter overdue requests

**API Response:**
```json
{
  "id": 1,
  "subject": "Monthly inspection",
  "scheduled_date": "2024-01-10",
  "status": "New",
  "is_overdue": true,
  ...
}
```

### Frontend

**File:** `frontend/src/utils/overdueHelper.js`

**Centralized Utility Functions:**
- `isOverdue(request)` - Check if single request is overdue
- `getOverdueRequests(requests)` - Filter overdue from array
- `getOverdueCount(requests)` - Count overdue requests
- `getOverdueMessage(request)` - Get formatted overdue message

**Used in:**
- KanbanBoard
- PreventiveCalendar
- RequestList
- RequestCard

## Visual Indicators

### 1. Kanban Board
- **Red left border** on overdue cards
- **Light red background** (#fff5f5)
- **Warning icon** (⚠️) in top-right corner
- **Red text** for scheduled date

### 2. Calendar View
- **Red left border** on calendar days with overdue requests
- **Red badges** with warning icon for overdue requests
- **Red text** for scheduled dates

### 3. Request List (Table)
- **Red background row** (#fff5f5) for overdue requests
- **Red left border** (4px solid)
- **"⚠ Overdue" badge** next to subject
- **Red text** for scheduled date
- **Overdue count badge** in header

### 4. Request Cards
- **Red left border** (4px solid #dc3545)
- **Light red background**
- **Warning icon** indicator
- **Red scheduled date text**

## UI Components

### RequestList Component
**New component** that displays all requests in a table format:
- Filter by: All, Overdue, Corrective, Preventive
- Overdue count badge in header
- Color-coded status and priority badges
- Responsive table design

## API Endpoints

### Get All Requests
```
GET /api/requests
```

**Query Parameters:**
- `overdue=true` - Filter to only overdue requests
- `status=New` - Filter by status
- `type=Preventive` - Filter by type

**Response includes:**
- `is_overdue: boolean` - Overdue flag for each request

### Example: Get Overdue Requests
```
GET /api/requests?overdue=true
```

## Date Comparison Logic

```javascript
// Reset time to midnight for date-only comparison
scheduled.setHours(0, 0, 0, 0);
now.setHours(0, 0, 0, 0);

// Check if scheduled date is in the past
const isPastDue = scheduled < now;

// Check if status is terminal
const isTerminal = status === 'Repaired' || status === 'Scrap';

// Overdue if past due and not terminal
return isPastDue && !isTerminal;
```

## Visual Design

### Color Scheme
- **Overdue Red**: #dc3545
- **Background**: #fff5f5 (light red)
- **Border**: 4px solid #dc3545
- **Text**: #dc3545 (red)

### Icons
- **Warning Icon**: ⚠️ (Unicode)
- **Badge Text**: "Overdue" or "⚠ Overdue"

## Usage Examples

### Check if Request is Overdue
```javascript
import { isOverdue } from '../utils/overdueHelper';

const overdue = isOverdue(request);
```

### Get Overdue Count
```javascript
import { getOverdueCount } from '../utils/overdueHelper';

const count = getOverdueCount(requests);
```

### Filter Overdue Requests
```javascript
import { getOverdueRequests } from '../utils/overdueHelper';

const overdueOnly = getOverdueRequests(requests);
```

## Status Behavior

### Terminal States (Never Overdue)
- **Repaired**: Completed, no longer overdue
- **Scrap**: Scrapped, no longer overdue

### Active States (Can Be Overdue)
- **New**: Can be overdue
- **In Progress**: Can be overdue

## Examples

### Overdue Request
```json
{
  "id": 1,
  "subject": "Monthly inspection",
  "scheduled_date": "2024-01-10",
  "status": "New",
  "is_overdue": true
}
```
- Scheduled: Jan 10, 2024
- Today: Jan 15, 2024
- Status: New
- **Result: Overdue** ✅

### Not Overdue (Repaired)
```json
{
  "id": 2,
  "subject": "Oil change",
  "scheduled_date": "2024-01-10",
  "status": "Repaired",
  "is_overdue": false
}
```
- Scheduled: Jan 10, 2024
- Today: Jan 15, 2024
- Status: Repaired
- **Result: Not Overdue** (terminal state)

### Not Overdue (Future Date)
```json
{
  "id": 3,
  "subject": "Next inspection",
  "scheduled_date": "2024-02-15",
  "status": "New",
  "is_overdue": false
}
```
- Scheduled: Feb 15, 2024
- Today: Jan 15, 2024
- Status: New
- **Result: Not Overdue** (future date)

## Benefits

 1. **Consistent Logic**: Same detection logic everywhere
2. **Visual Clarity**: Red indicators make overdue items obvious
3. **Multiple Views**: Overdue shown in Kanban, Calendar, and List
4. **Filtering**: Easy to filter and find overdue requests
5. **Real-time**: Updates automatically as dates pass

## Future Enhancements

- Email notifications for overdue requests
- Dashboard widget showing overdue count
- Auto-escalation for long-overdue requests
- Overdue reports and analytics

