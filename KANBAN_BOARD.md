# Kanban Board Implementation

## Overview

A fully functional Kanban board for managing maintenance requests with drag-and-drop functionality, technician avatars, and overdue indicators.

## Features

### ✅ Core Functionality
- **4 Columns**: New, In Progress, Repaired, Scrap
- **Drag and Drop**: Move cards between columns to update status
- **Real-time Updates**: Status changes are immediately saved to backend
- **Request Count**: Each column shows the number of requests

### ✅ Visual Features
- **Technician Avatars**: Circular avatars with initials
- **Priority Badges**: Color-coded priority indicators (Low, Medium, High, Urgent)
- **Overdue Indicator**: Red border and warning icon for overdue requests
- **Type Badges**: Visual distinction between Corrective and Preventive
- **Responsive Design**: Works on desktop, tablet, and mobile

### ✅ User Experience
- **Optimistic Updates**: UI updates immediately, reverts on error
- **Loading States**: Visual feedback during status updates
- **Error Handling**: Clear error messages if updates fail
- **Empty States**: Helpful messages when columns are empty
- **Hover Effects**: Visual feedback on interactive elements

## Components

### 1. KanbanBoard (`KanbanBoard.js`)
Main container component that:
- Fetches all maintenance requests
- Manages drag and drop state
- Handles status updates via API
- Organizes requests by status

### 2. KanbanColumn (`KanbanColumn.js`)
Individual column component that:
- Displays column title and request count
- Provides drop zone for drag and drop
- Shows visual feedback when dragging over

### 3. RequestCard (`RequestCard.js`)
Individual request card that displays:
- Request subject/title
- Priority badge
- Equipment name
- Request type (Corrective/Preventive)
- Scheduled date (with overdue indicator)
- Team name
- Technician avatar and name

## Status Mapping

The Kanban board columns map to these request statuses:
- **New** → Status: "New"
- **In Progress** → Status: "In Progress"
- **Repaired** → Status: "Repaired"
- **Scrap** → Status: "Scrap"

## Overdue Logic

A request is considered overdue if:
- It has a `scheduled_date`
- The scheduled date is in the past
- Status is NOT "Repaired" or "Scrap"

Overdue requests display:
- Red left border
- Light red background
- Warning emoji indicator (⚠️)
- Red text for scheduled date

## Technician Avatars

- **With Technician**: Shows circular avatar with initials (first letter of first and last name)
- **No Technician**: Shows "Unassigned" text
- Avatar colors: Gradient purple background with white text

## Priority Colors

- **Low**: Gray (#6c757d)
- **Medium**: Yellow (#ffc107)
- **High**: Orange (#fd7e14)
- **Urgent**: Red (#dc3545)

## API Integration

### Endpoints Used
- `GET /api/requests` - Fetch all requests
- `PATCH /api/requests/:id/status` - Update request status

### Status Update Flow
1. User drags card to new column
2. Optimistic UI update (immediate)
3. API call to update status
4. Reload requests to get latest data
5. Revert on error with alert

## Installation

The Kanban board uses `@dnd-kit` for drag and drop:

```bash
cd frontend
npm install
```


Dependencies added:
- `@dnd-kit/core` - Core drag and drop functionality
- `@dnd-kit/sortable` - Sortable list support
- `@dnd-kit/utilities` - Utility functions

## Usage

1. Navigate to "Kanban Board" tab in the app
2. View all maintenance requests organized by status
3. Drag cards between columns to update status
4. See technician avatars and overdue indicators
5. Click refresh button to reload data

## Responsive Design

- **Desktop**: 4 columns side by side
- **Tablet** (< 1200px): 2 columns
- **Mobile** (< 768px): 1 column (stacked)

## Styling

- Modern card-based design
- Smooth transitions and animations
- Color-coded status columns
- Custom scrollbars for long columns
- Hover effects for better UX

## Error Handling

- Network errors: Shows error message, reverts UI
- Invalid transitions: Backend validates, shows alert
- Missing data: Gracefully handles undefined fields

## Future Enhancements

Potential improvements:
- Filter by team, equipment, or priority
- Search functionality
- Card details modal on click
- Bulk status updates
- Keyboard shortcuts
- Real-time updates (WebSocket)

