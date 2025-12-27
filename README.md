# GearGuard – The Ultimate Maintenance Tracker

A full-stack web application for managing equipment maintenance, teams, and maintenance requests.

## Project Overview

GearGuard is a comprehensive maintenance tracking system that helps organizations manage:
- **Equipment** (machines, laptops, vehicles)
- **Maintenance Teams & Technicians**
- **Maintenance Requests** (Corrective & Preventive)

## Core Features

- 🔄 **Equipment → Team Auto-Mapping**: Automatic assignment of equipment to maintenance teams
- 📋 **Request Lifecycle Management**: Track requests through states (New → In Progress → Repaired → Scrap)
- 📊 **Kanban Board**: Visual board for managing maintenance requests
- 📅 **Calendar View**: Schedule and view preventive maintenance tasks
- 🤖 **Automation & Smart Logic**: Intelligent routing and automated workflows

## Project Structure

```
GearGuard/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── server.js      # Express server entry point
└── README.md          # This file
```

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

## Development

- Backend API runs on: `http://localhost:3001`
- Frontend runs on: `http://localhost:3000`
- Database file: `backend/database/gearguard.db` (auto-created on first run)

## Database Schema

The database includes the following tables with proper relationships:

- **maintenance_teams**: Teams that handle maintenance
- **equipment**: Equipment items with reference to default maintenance team
- **technicians**: Technicians assigned to teams
- **maintenance_requests**: Maintenance requests with references to equipment, teams, and technicians

All foreign key relationships are enforced with proper constraints and cascade behaviors.

## License

MIT License - Hackathon Project

