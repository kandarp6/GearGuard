const express = require('express');
const router = express.Router();
const db = require('../database/db');

/**
 * Check if a request is overdue
 */
function isRequestOverdue(request) {
  if (!request.scheduled_date) {
    return false;
  }

  const scheduled = new Date(request.scheduled_date);
  const now = new Date();
  
  scheduled.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const isPastDue = scheduled < now;
  const isTerminal = request.status === 'Repaired' || request.status === 'Scrap';

  return isPastDue && !isTerminal;
}

// GET dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get all requests
    const allRequests = await db.prepare(`
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.id as equipment_id,
        mt.team_name,
        mt.id as team_id
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
    `).all();

    // Calculate total open requests (not Repaired or Scrap)
    const openRequests = allRequests.filter(r => 
      r.status !== 'Repaired' && r.status !== 'Scrap'
    );

    // Calculate overdue requests
    const overdueRequests = allRequests.filter(r => isRequestOverdue(r));

    // Calculate requests per team
    const requestsPerTeam = {};
    allRequests.forEach(request => {
      const teamName = request.team_name || 'Unassigned';
      if (!requestsPerTeam[teamName]) {
        requestsPerTeam[teamName] = {
          team_name: teamName,
          team_id: request.team_id,
          total: 0,
          open: 0,
          overdue: 0
        };
      }
      requestsPerTeam[teamName].total++;
      if (request.status !== 'Repaired' && request.status !== 'Scrap') {
        requestsPerTeam[teamName].open++;
      }
      if (isRequestOverdue(request)) {
        requestsPerTeam[teamName].overdue++;
      }
    });

    // Calculate equipment with frequent breakdowns
    // Count requests per equipment (only Corrective requests count as breakdowns)
    const equipmentBreakdowns = {};
    allRequests.forEach(request => {
      if (request.type === 'Corrective' && request.equipment_id && request.equipment_name) {
        const equipmentId = request.equipment_id;
        if (!equipmentBreakdowns[equipmentId]) {
          equipmentBreakdowns[equipmentId] = {
            equipment_id: equipmentId,
            equipment_name: request.equipment_name,
            breakdown_count: 0,
            total_requests: 0
          };
        }
        equipmentBreakdowns[equipmentId].breakdown_count++;
        equipmentBreakdowns[equipmentId].total_requests++;
      }
    });

    // Sort equipment by breakdown count (descending) and get top 10
    const frequentBreakdowns = Object.values(equipmentBreakdowns)
      .sort((a, b) => b.breakdown_count - a.breakdown_count)
      .slice(0, 10);

    // Convert requests per team to array
    const teamStats = Object.values(requestsPerTeam)
      .sort((a, b) => b.total - a.total);

    // Calculate status breakdown
    const statusBreakdown = {
      'New': allRequests.filter(r => r.status === 'New').length,
      'In Progress': allRequests.filter(r => r.status === 'In Progress').length,
      'Repaired': allRequests.filter(r => r.status === 'Repaired').length,
      'Scrap': allRequests.filter(r => r.status === 'Scrap').length,
    };

    // Get equipment and teams count
    const equipmentCount = await db.prepare('SELECT COUNT(*) as count FROM equipment WHERE status = ?').get('Active');
    const teamsCount = await db.prepare('SELECT COUNT(*) as count FROM maintenance_teams').get();

    res.json({
      summary: {
        total_open: openRequests.length,
        total_overdue: overdueRequests.length,
        total_requests: allRequests.length,
        total_equipment: equipmentCount.count,
        total_teams: teamsCount.count,
      },
      requests_per_team: teamStats,
      frequent_breakdowns: frequentBreakdowns,
      status_breakdown: statusBreakdown,
      overdue_requests: overdueRequests.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
