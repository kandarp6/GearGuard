import React, { useState } from 'react';
import EquipmentList from './components/EquipmentList';
import EquipmentForm from './components/EquipmentForm';
import EquipmentDetails from './components/EquipmentDetails';
import KanbanBoard from './components/KanbanBoard';
import PreventiveCalendar from './components/PreventiveCalendar';
import RequestList from './components/RequestList';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [view, setView] = useState('dashboard'); // 'dashboard', 'list', 'form', 'details', 'edit', 'kanban', 'calendar', 'requests'
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);

  const handleSelectEquipment = (id) => {
    setSelectedEquipmentId(id);
    setView('details');
  };

  const handleCreateNew = () => {
    setSelectedEquipmentId(null);
    setView('form');
  };

  const handleEdit = () => {
    setView('edit');
  };

  const handleSave = () => {
    setView('list');
    setSelectedEquipmentId(null);
  };

  const handleCancel = () => {
    if (selectedEquipmentId) {
      setView('details');
    } else {
      setView('list');
    }
  };

  const handleBack = () => {
    setView('list');
    setSelectedEquipmentId(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>GearGuard</h1>
        <p>The Ultimate Maintenance Tracker</p>
      </header>
      <nav className="main-nav">
        <button
          onClick={() => setView('dashboard')}
          className={view === 'dashboard' ? 'active' : ''}
        >
          Dashboard
        </button>
        <button
          onClick={() => setView('kanban')}
          className={view === 'kanban' ? 'active' : ''}
        >
          Kanban Board
        </button>
        <button
          onClick={() => setView('calendar')}
          className={view === 'calendar' ? 'active' : ''}
        >
          Calendar
        </button>
        <button
          onClick={() => setView('requests')}
          className={view === 'requests' ? 'active' : ''}
        >
          Requests
        </button>
        <button
          onClick={() => setView('list')}
          className={view === 'list' ? 'active' : ''}
        >
          Equipment
        </button>
      </nav>
      <main>
        {view === 'dashboard' && <Dashboard />}
        {view === 'kanban' && <KanbanBoard />}
        {view === 'calendar' && <PreventiveCalendar />}
        {view === 'requests' && <RequestList />}
        {view === 'list' && (
          <EquipmentList
            onSelectEquipment={handleSelectEquipment}
            onCreateNew={handleCreateNew}
          />
        )}
        {view === 'form' && (
          <EquipmentForm
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
        {view === 'details' && selectedEquipmentId && (
          <EquipmentDetails
            equipmentId={selectedEquipmentId}
            onBack={handleBack}
            onEdit={handleEdit}
          />
        )}
        {view === 'edit' && selectedEquipmentId && (
          <EquipmentForm
            equipmentId={selectedEquipmentId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
}

export default App;
