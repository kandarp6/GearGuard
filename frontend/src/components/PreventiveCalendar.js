import React, { useState, useEffect } from 'react';
import { requestsAPI, equipmentAPI } from '../services/api';
import { isOverdue } from '../utils/overdueHelper';
import RequestFormModal from './RequestFormModal';
import './PreventiveCalendar.css';

function PreventiveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPreventiveRequests();
  }, []);

  const loadPreventiveRequests = async () => {
    try {
      setLoading(true);
      const response = await requestsAPI.getAll({ type: 'Preventive' });
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load preventive maintenance requests');
    } finally {
      setLoading(false);
    }
  };


  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getRequestsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return requests.filter(request => {
      if (!request.scheduled_date) return false;
      const requestDate = new Date(request.scheduled_date);
      const requestDateStr = requestDate.toISOString().split('T')[0];
      return requestDateStr === dateStr;
    });
  };

  const handleDateClick = (date) => {
    if (date) {
      setSelectedDate(date);
      setShowModal(true);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleRequestCreated = () => {
    setShowModal(false);
    setSelectedDate(null);
    loadPreventiveRequests();
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <div className="calendar-loading">Loading preventive maintenance calendar...</div>;
  }

  return (
    <div className="preventive-calendar">
      <div className="calendar-header">
        <h2>Preventive Maintenance Calendar</h2>
        <button onClick={loadPreventiveRequests} className="btn btn-secondary btn-sm">
          Refresh
        </button>
      </div>

      {error && <div className="calendar-error">{error}</div>}

      <div className="calendar-controls">
        <button onClick={handlePreviousMonth} className="btn btn-icon">‹</button>
        <button onClick={handleToday} className="btn btn-link">
          Today
        </button>
        <h3>{formatMonthYear(currentDate)}</h3>
        <button onClick={handleNextMonth} className="btn btn-icon">›</button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="calendar-weekday">{day}</div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((date, index) => {
            const dateRequests = getRequestsForDate(date);
            const hasOverdue = dateRequests.some(r => isOverdue(r));
            const isCurrentDay = isToday(date);

            return (
              <div
                key={index}
                className={`calendar-day ${!date ? 'empty' : ''} ${isCurrentDay ? 'today' : ''} ${hasOverdue ? 'has-overdue' : ''}`}
                onClick={() => handleDateClick(date)}
              >
                {date && (
                  <>
                    <div className="day-number">{date.getDate()}</div>
                    {dateRequests.length > 0 && (
                      <div className="day-requests">
                        {dateRequests.map(request => (
                          <div
                            key={request.id}
                            className={`request-badge ${isOverdue(request) ? 'overdue' : ''} ${request.status.toLowerCase().replace(' ', '-')}`}
                            title={`${request.subject} - ${request.equipment_name || 'No Equipment'}`}
                          >
                            {request.equipment_name ? request.equipment_name.substring(0, 15) : 'Unassigned'}
                            {isOverdue(request) && <span className="overdue-icon">⚠</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color overdue"></div>
          <span>Overdue</span>
        </div>
        <div className="legend-item">
          <div className="legend-color new"></div>
          <span>New</span>
        </div>
        <div className="legend-item">
          <div className="legend-color in-progress"></div>
          <span>In Progress</span>
        </div>
        <div className="legend-item">
          <div className="legend-color repaired"></div>
          <span>Repaired</span>
        </div>
      </div>

      {showModal && selectedDate && (
        <RequestFormModal
          initialDate={selectedDate}
          onClose={() => {
            setShowModal(false);
            setSelectedDate(null);
          }}
          onSave={handleRequestCreated}
        />
      )}
    </div>
  );
}

export default PreventiveCalendar;

