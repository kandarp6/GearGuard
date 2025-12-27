import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { getTeamIcon, getTeamColor } from '../utils/teamIcons';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={loadStats} className="btn btn-primary">Retry</button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button onClick={loadStats} className="btn btn-secondary btn-sm">
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-cards">
        <div className="stat-card primary">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">Total Open Requests</div>
            <div className="stat-value">{stats.summary.total_open}</div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-label">Overdue Requests</div>
            <div className="stat-value">{stats.summary.total_overdue}</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-label">Active Teams</div>
            <div className="stat-value">{stats.summary.total_teams}</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <div className="stat-label">Active Equipment</div>
            <div className="stat-value">{stats.summary.total_equipment}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts">
        {/* Requests per Team */}
        <div className="chart-card">
          <h3>Requests per Team</h3>
          <div className="chart-content">
            {stats.requests_per_team.length > 0 ? (
              <div className="bar-chart">
                {stats.requests_per_team.map((team, index) => {
                  const maxRequests = Math.max(...stats.requests_per_team.map(t => t.total), 1);
                  const percentage = (team.total / maxRequests) * 100;
                  
                  return (
                    <div key={index} className="bar-item">
                      <div className="bar-label">
                        <span className="team-name">
                          <span className="team-icon">{getTeamIcon(team.team_name, team.specialization)}</span>
                          <span>{team.team_name}</span>
                        </span>
                        <span className="team-count">{team.total} requests</span>
                      </div>
                      <div className="bar-container">
                        <div 
                          className="bar-fill"
                          style={{ width: `${percentage}%` }}
                        >
                          <div className="bar-details">
                            <span>Open: {team.open}</span>
                            {team.overdue > 0 && (
                              <span className="overdue-count">Overdue: {team.overdue}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">No team data available</div>
            )}
          </div>
        </div>

        {/* Equipment with Frequent Breakdowns */}
        <div className="chart-card">
          <h3>Equipment with Frequent Breakdowns</h3>
          <div className="chart-content">
            {stats.frequent_breakdowns.length > 0 ? (
              <div className="breakdown-list">
                {stats.frequent_breakdowns.map((equipment, index) => (
                  <div key={equipment.equipment_id} className="breakdown-item">
                    <div className="breakdown-rank">#{index + 1}</div>
                    <div className="breakdown-info">
                      <div className="breakdown-name">{equipment.equipment_name}</div>
                      <div className="breakdown-stats">
                        <span className="breakdown-count">
                          {equipment.breakdown_count} breakdown{equipment.breakdown_count !== 1 ? 's' : ''}
                        </span>
                        <span className="breakdown-total">
                          ({equipment.total_requests} total requests)
                        </span>
                      </div>
                    </div>
                    <div className="breakdown-badge">
                      {equipment.breakdown_count}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">No breakdown data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="chart-card full-width">
        <h3>Request Status Breakdown</h3>
        <div className="status-grid">
          <div className="status-item new">
            <div className="status-label">New</div>
            <div className="status-value">{stats.status_breakdown.New}</div>
          </div>
          <div className="status-item in-progress">
            <div className="status-label">In Progress</div>
            <div className="status-value">{stats.status_breakdown['In Progress']}</div>
          </div>
          <div className="status-item repaired">
            <div className="status-label">Repaired</div>
            <div className="status-value">{stats.status_breakdown.Repaired}</div>
          </div>
          <div className="status-item scrap">
            <div className="status-label">Scrap</div>
            <div className="status-value">{stats.status_breakdown.Scrap}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

