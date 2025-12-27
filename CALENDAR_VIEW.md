# Preventive Maintenance Calendar View

## Overview

A calendar view that displays all preventive maintenance requests, allows creating new requests by clicking dates, and highlights overdue tasks.

## Features

### ✅ Core Functionality
- **Monthly Calendar View**: Navigate between months
- **Preventive Requests Only**: Filters to show only "Preventive" type requests
- **Scheduled Date Display**: Shows requests on their scheduled dates
- **Click to Create**: Click any date to create a new preventive maintenance request
- **Overdue Highlighting**: Visual indicators for overdue tasks

### ✅ Visual Features
- **Color-Coded Status**: Different colors for New, In Progress, Repaired
- **Overdue Indicators**: Red border and warning icon for overdue requests
- **Today Highlight**: Current date is highlighted
- **Request Badges**: Equipment names shown on calendar days
- **Legend**: Color legend for status types

### ✅ User Experience
- **Month Navigation**: Previous/Next month buttons
- **Today Button**: Quick jump to current month
- **Modal Form**: Clean modal for creating new requests
- **Responsive Design**: Works on desktop, tablet, and mobile

## Components

### 1. PreventiveCalendar (`PreventiveCalendar.js`)
Main calendar component that:
- Fetches preventive maintenance requests
- Renders monthly calendar grid
- Handles date clicks
- Highlights overdue requests
- Manages month navigation

### 2. RequestFormModal (`RequestFormModal.js`)
Modal form for creating new preventive requests:
- Pre-filled with selected date
- Equipment selection (active equipment only)
- Priority selection
- Duration input
- Form validation

## Overdue Logic

A preventive request is considered overdue if:
- It has a `scheduled_date`
- The scheduled date is in the past
- Status is NOT "Repaired" or "Scrap"

**Visual Indicators:**
- Red left border on calendar day
- Red background on request badge
- Warning icon (⚠) on badge
- "Overdue" label in legend

## Calendar Features

### Month Navigation
- **Previous Month**: Click "‹" button
- **Next Month**: Click "›" button
- **Today**: Click "Today" button to jump to current month

### Date Display
- **Day Numbers**: Clear day numbers
- **Request Badges**: Equipment names on days with requests
- **Status Colors**: Color-coded by request status
- **Today Highlight**: Blue border and background

### Request Badges
- Shows equipment name (truncated if long)
- Color-coded by status:
  - **New**: Light blue
  - **In Progress**: Blue
  - **Repaired**: Green
  - **Overdue**: Red with warning icon

## Creating New Requests

### Flow
1. Click on any date in the calendar
2. Modal opens with form pre-filled:
   - Type: "Preventive" (fixed)
   - Scheduled Date: Selected date
3. Fill in required fields:
   - Subject (required)
   - Equipment (optional)
   - Priority (default: Medium)
   - Duration (optional)
4. Submit to create request
5. Calendar refreshes automatically

### Form Fields
- **Subject**: Required, e.g., "Monthly vehicle inspection"
- **Equipment**: Dropdown of active equipment
- **Priority**: Low, Medium, High, Urgent
- **Scheduled Date**: Pre-filled from clicked date
- **Duration**: Optional, in minutes

## API Integration

### Endpoints Used
- `GET /api/requests?type=Preventive` - Fetch preventive requests
- `GET /api/equipment` - Fetch equipment list
- `POST /api/requests` - Create new request

### Request Creation
The form automatically:
- Sets type to "Preventive"
- Sets status to "New"
- Auto-assigns team from equipment (if selected)
- Auto-sets priority based on equipment type

## Styling

### Calendar Grid
- 7 columns (Sunday to Saturday)
- Responsive grid layout
- Hover effects on days
- Smooth transitions

### Color Scheme
- **Today**: Blue border and light blue background
- **Overdue**: Red left border
- **New Requests**: Light blue badge
- **In Progress**: Blue badge
- **Repaired**: Green badge
- **Overdue**: Red badge with warning

## Responsive Design

- **Desktop**: Full calendar with all features
- **Tablet**: Adjusted spacing and font sizes
- **Mobile**: Compact view with smaller badges

## Usage

1. Navigate to "Calendar" tab in the app
2. View all preventive maintenance requests on the calendar
3. Click any date to create a new request
4. See overdue tasks highlighted in red
5. Use navigation buttons to move between months

## Legend

The calendar includes a legend showing:
- **Overdue**: Red badge
- **New**: Light blue badge
- **In Progress**: Blue badge
- **Repaired**: Green badge

## Future Enhancements

Potential improvements:
- Week view option
- Day view with detailed list
- Recurring maintenance scheduling
- Drag and drop to reschedule
- Filter by team or equipment
- Export calendar (iCal format)
- Reminder notifications

