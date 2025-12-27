const express = require('express');
const router = express.Router();
const db = require('../database/db');
const MaintenanceRequest = require('../models/MaintenanceRequest');

// GET all maintenance requests with related data
router.get('/', async (req, res) => {
  try {
    const { status, type, team_id, equipment_id, overdue } = req.query;
    
    let query = `
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        mt.team_name,
        t.name as technician_name,
        t.email as technician_email
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN technicians t ON mr.assigned_technician = t.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (status) {
      query += ' AND mr.status = ?';
      params.push(status);
    }
    if (type) {
      query += ' AND mr.type = ?';
      params.push(type);
    }
    if (team_id) {
      query += ' AND mr.team_id = ?';
      params.push(team_id);
    }
    if (equipment_id) {
      query += ' AND mr.equipment_id = ?';
      params.push(equipment_id);
    }
    
    query += ' ORDER BY mr.created_at DESC';
    
    let requests = await db.prepare(query).all(...params);
    
    // Add overdue flag to each request
    requests = requests.map(row => {
      const request = MaintenanceRequest.fromDB(row);
      request.is_overdue = isRequestOverdue(request);
      return request;
    });

    // Filter by overdue if requested
    if (overdue === 'true') {
      requests = requests.filter(r => r.is_overdue);
    }
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET request by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const row = await db.prepare(`
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        e.location as equipment_location,
        mt.team_name,
        t.name as technician_name,
        t.email as technician_email
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN technicians t ON mr.assigned_technician = t.id
      WHERE mr.id = ?
    `).get(req.params.id);
    
    if (!row) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    const request = MaintenanceRequest.fromDB(row);
    request.is_overdue = isRequestOverdue(request);
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Check if a request is overdue
 * Conditions: scheduled_date < today AND status NOT IN ('Repaired', 'Scrap')
 */
function isRequestOverdue(request) {
  if (!request.scheduled_date) {
    return false;
  }

  const scheduled = new Date(request.scheduled_date);
  const now = new Date();
  
  // Reset time to midnight for date-only comparison
  scheduled.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const isPastDue = scheduled < now;
  const isTerminal = request.status === 'Repaired' || request.status === 'Scrap';

  return isPastDue && !isTerminal;
}

/**
 * Validate status transition
 * Allowed flows:
 * - New → In Progress → Repaired
 * - New → Scrap
 * 
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - Desired new status
 * @returns {object} { valid: boolean, error: string }
 */
function validateStatusTransition(currentStatus, newStatus) {
  // Normalize status values (handle case variations)
  const current = currentStatus?.trim();
  const next = newStatus?.trim();

  // Valid status values
  const validStatuses = ['New', 'In Progress', 'Repaired', 'Scrap'];
  
  if (!validStatuses.includes(next)) {
    return {
      valid: false,
      error: `Invalid status: ${next}. Valid statuses are: ${validStatuses.join(', ')}`
    };
  }

  // Terminal states - cannot transition from these
  if (current === 'Repaired' || current === 'Scrap') {
    return {
      valid: false,
      error: `Cannot change status from terminal state: ${current}`
    };
  }

  // Same status is always valid (idempotent)
  if (current === next) {
    return { valid: true, error: null };
  }

  // Define allowed transitions
  const allowedTransitions = {
    'New': ['In Progress', 'Scrap'],
    'In Progress': ['Repaired']
  };

  const allowed = allowedTransitions[current];
  
  if (!allowed || !allowed.includes(next)) {
    return {
      valid: false,
      error: `Invalid transition: ${current} → ${next}. Allowed transitions: ${allowed?.join(', ') || 'none'}`
    };
  }

  return { valid: true, error: null };
}

/**
 * Validate lifecycle rules for status transitions
 * @param {object} request - Current request data
 * @param {string} newStatus - New status being set
 * @param {object} updateData - Data being updated
 * @returns {object} { valid: boolean, error: string }
 */
function validateLifecycleRules(request, newStatus, updateData = {}) {
  // Rule 1: When moving to "In Progress", technician is required
  if (newStatus === 'In Progress' && request.status !== 'In Progress') {
    const technicianId = updateData.assigned_technician !== undefined 
      ? updateData.assigned_technician 
      : request.assigned_technician;
    
    if (!technicianId) {
      return {
        valid: false,
        error: 'Technician is required when moving request to "In Progress" status'
      };
    }
  }

  // Rule 2: When moving to "Repaired", duration is required
  if (newStatus === 'Repaired' && request.status !== 'Repaired') {
    const duration = updateData.duration !== undefined 
      ? updateData.duration 
      : request.duration;
    
    if (!duration || duration <= 0) {
      return {
        valid: false,
        error: 'Duration is required when moving request to "Repaired" status'
      };
    }
  }

  return { valid: true, error: null };
}

/**
 * Auto-determine priority based on equipment type
 * Logic: Vehicles/Machinery = High, IT Equipment = Medium, Others = Low
 */
function determinePriority(equipmentName, teamSpecialization) {
  if (!equipmentName && !teamSpecialization) {
    return 'Medium'; // Default
  }

  const name = (equipmentName || '').toLowerCase();
  const specialization = (teamSpecialization || '').toLowerCase();

  // High priority: Vehicles, Machinery, Production equipment
  if (
    name.includes('vehicle') || name.includes('van') || name.includes('truck') ||
    name.includes('machine') || name.includes('cnc') || name.includes('production') ||
    name.includes('factory') || specialization.includes('vehicle') ||
    specialization.includes('machinery') || specialization.includes('fleet')
  ) {
    return 'High';
  }

  // Medium priority: IT Equipment, Laptops, Computers
  if (
    name.includes('laptop') || name.includes('computer') || name.includes('desktop') ||
    name.includes('server') || name.includes('printer') || name.includes('monitor') ||
    specialization.includes('it') || specialization.includes('computer')
  ) {
    return 'Medium';
  }

  // Low priority: Office equipment, general items
  return 'Low';
}

// POST create new maintenance request
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.subject) {
      return res.status(400).json({ error: 'Subject is required' });
    }

    // Block new requests for scrapped equipment
    if (req.body.equipment_id) {
      const equipment = await db.prepare('SELECT id, name, status FROM equipment WHERE id = ?').get(req.body.equipment_id);
      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
      if (equipment.status === 'Scrapped') {
        return res.status(400).json({ 
          error: 'Cannot create maintenance request for scrapped equipment',
          equipment_id: equipment.id,
          equipment_name: equipment.name,
          equipment_status: equipment.status
        });
      }
    }

    // Initialize request data
    const requestData = {
      ...req.body,
      status: 'New', // Always start with "New" status
    };

    let equipment = null;
    let team = null;

    // Auto-fetch maintenance team from equipment if equipment is selected
    if (req.body.equipment_id) {
      equipment = await db.prepare(`
        SELECT e.*, mt.id as team_id, mt.team_name, mt.specialization
        FROM equipment e
        LEFT JOIN maintenance_teams mt ON e.default_maintenance_team = mt.id
        WHERE e.id = ?
      `).get(req.body.equipment_id);

      if (!equipment) {
        return res.status(404).json({ error: 'Equipment not found' });
      }

      // Auto-assign team from equipment if not provided
      if (!requestData.team_id && equipment.team_id) {
        requestData.team_id = equipment.team_id;
        team = {
          id: equipment.team_id,
          team_name: equipment.team_name,
          specialization: equipment.specialization
        };
      }
    }

    // Auto-set priority based on equipment type if not provided
    if (!requestData.priority && equipment) {
      requestData.priority = determinePriority(
        equipment.name,
        equipment.specialization
      );
    } else if (!requestData.priority) {
      requestData.priority = 'Medium'; // Default
    }

    // Create request model
    const request = new MaintenanceRequest(requestData);
    const data = request.toDB();
    data.created_at = new Date().toISOString();
    data.updated_at = new Date().toISOString();

    // Insert into database
    const result = await db.prepare(`
      INSERT INTO maintenance_requests (
        subject, type, equipment_id, team_id, assigned_technician, 
        scheduled_date, duration, priority, status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.subject,
      data.type,
      data.equipment_id,
      data.team_id,
      data.assigned_technician,
      data.scheduled_date,
      data.duration,
      data.priority,
      data.status,
      data.created_at,
      data.updated_at
    );

    // Fetch complete request with all related data
    const newRequest = await db.prepare(`
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        e.location as equipment_location,
        mt.team_name,
        mt.specialization as team_specialization,
        t.name as technician_name,
        t.email as technician_email
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN technicians t ON mr.assigned_technician = t.id
      WHERE mr.id = ?
    `).get(result.lastInsertRowid);

    // Return clean JSON response
    const response = {
      id: newRequest.id,
      subject: newRequest.subject,
      type: newRequest.type,
      status: newRequest.status,
      priority: newRequest.priority,
      equipment: newRequest.equipment_id ? {
        id: newRequest.equipment_id,
        name: newRequest.equipment_name,
        serial_number: newRequest.equipment_serial,
        location: newRequest.equipment_location
      } : null,
      team: newRequest.team_id ? {
        id: newRequest.team_id,
        team_name: newRequest.team_name,
        specialization: newRequest.team_specialization
      } : null,
      technician: newRequest.assigned_technician ? {
        id: newRequest.assigned_technician,
        name: newRequest.technician_name,
        email: newRequest.technician_email
      } : null,
      scheduled_date: newRequest.scheduled_date,
      duration: newRequest.duration,
      created_at: newRequest.created_at,
      updated_at: newRequest.updated_at
    };

    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH update maintenance request status (with workflow validation)
router.patch('/:id/status', async (req, res) => {
  try {
    // Validate request body
    if (!req.body.status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Fetch current request
    const existing = await db.prepare('SELECT * FROM maintenance_requests WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Validate status transition
    const transitionValidation = validateStatusTransition(existing.status, req.body.status);
    if (!transitionValidation.valid) {
      return res.status(400).json({ 
        error: transitionValidation.error,
        current_status: existing.status,
        requested_status: req.body.status
      });
    }

    // Validate lifecycle rules (technician required for In Progress, duration for Repaired)
    const lifecycleValidation = validateLifecycleRules(existing, req.body.status, req.body);
    if (!lifecycleValidation.valid) {
      return res.status(400).json({ 
        error: lifecycleValidation.error,
        current_status: existing.status,
        requested_status: req.body.status
      });
    }

    // Prepare update data
    const updated_at = new Date().toISOString();
    const updateData = {
      status: req.body.status,
      updated_at: updated_at
    };

    // Allow updating technician when moving to In Progress
    if (req.body.status === 'In Progress' && req.body.assigned_technician) {
      updateData.assigned_technician = req.body.assigned_technician;
    }

    // Allow updating duration when moving to Repaired
    if (req.body.status === 'Repaired' && req.body.duration) {
      updateData.duration = req.body.duration;
    }

    // Update status and related fields
    const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const updateValues = [...Object.values(updateData), req.params.id];
    
    await db.prepare(`
      UPDATE maintenance_requests 
      SET ${updateFields}
      WHERE id = ?
    `).run(...updateValues);

    // Handle Scrap logic
    if (req.body.status === 'Scrap' && existing.equipment_id) {
      // Update equipment status to Scrapped
      const equipment = await db.prepare('SELECT id, name, status FROM equipment WHERE id = ?').get(existing.equipment_id);
      if (equipment && equipment.status !== 'Scrapped') {
        await db.prepare(`
          UPDATE equipment 
          SET status = 'Scrapped', updated_at = ?
          WHERE id = ?
        `).run(updated_at, existing.equipment_id);

        // Log system note
        const noteMessage = `Equipment "${equipment.name}" (ID: ${equipment.id}) marked as Scrapped due to maintenance request #${req.params.id}: "${existing.subject}"`;
        await db.prepare(`
          INSERT INTO system_notes (entity_type, entity_id, note_type, message, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run('equipment', existing.equipment_id, 'scrap', noteMessage, updated_at);

        // Also log note on the maintenance request
        await db.prepare(`
          INSERT INTO system_notes (entity_type, entity_id, note_type, message, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run('maintenance_request', req.params.id, 'scrap', `Maintenance request marked as Scrap. Equipment "${equipment.name}" automatically marked as Scrapped.`, updated_at);
      }
    }

    // Fetch updated request with related data
    const updated = await db.prepare(`
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        e.location as equipment_location,
        e.status as equipment_status,
        mt.team_name,
        mt.specialization as team_specialization,
        t.name as technician_name,
        t.email as technician_email
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN technicians t ON mr.assigned_technician = t.id
      WHERE mr.id = ?
    `).get(req.params.id);

    // Return clean JSON response
    const response = {
      id: updated.id,
      subject: updated.subject,
      type: updated.type,
      status: updated.status,
      priority: updated.priority,
      previous_status: existing.status,
      equipment: updated.equipment_id ? {
        id: updated.equipment_id,
        name: updated.equipment_name,
        serial_number: updated.equipment_serial,
        location: updated.equipment_location,
        status: updated.equipment_status
      } : null,
      team: updated.team_id ? {
        id: updated.team_id,
        team_name: updated.team_name,
        specialization: updated.team_specialization
      } : null,
      technician: updated.assigned_technician ? {
        id: updated.assigned_technician,
        name: updated.technician_name,
        email: updated.technician_email
      } : null,
      scheduled_date: updated.scheduled_date,
      duration: updated.duration,
      created_at: updated.created_at,
      updated_at: updated.updated_at
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH assign technician to request (self-assignment)
router.patch('/:id/assign', async (req, res) => {
  try {
    // Validate request body
    if (!req.body.technician_id) {
      return res.status(400).json({ error: 'Technician ID is required' });
    }

    // Fetch current request
    const existing = await db.prepare('SELECT * FROM maintenance_requests WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Verify technician exists
    const technician = await db.prepare('SELECT * FROM technicians WHERE id = ?').get(req.body.technician_id);
    if (!technician) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    // Verify technician is from the request's team (if team is assigned)
    if (existing.team_id && technician.team_id !== existing.team_id) {
      return res.status(400).json({ 
        error: 'Technician must be from the same team as the maintenance request',
        request_team_id: existing.team_id,
        technician_team_id: technician.team_id
      });
    }

    // Update assigned technician
    const updated_at = new Date().toISOString();
    await db.prepare(`
      UPDATE maintenance_requests 
      SET assigned_technician = ?, updated_at = ?
      WHERE id = ?
    `).run(req.body.technician_id, updated_at, req.params.id);

    // Log system note
    const noteMessage = `Technician "${technician.name}" assigned to this request`;
    await db.prepare(`
      INSERT INTO system_notes (entity_type, entity_id, note_type, message, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('maintenance_request', req.params.id, 'assignment', noteMessage, updated_at);

    // Fetch updated request with related data
    const updated = await db.prepare(`
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        mt.team_name,
        t.name as technician_name,
        t.email as technician_email
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN technicians t ON mr.assigned_technician = t.id
      WHERE mr.id = ?
    `).get(req.params.id);

    const response = {
      id: updated.id,
      subject: updated.subject,
      status: updated.status,
      technician: {
        id: updated.assigned_technician,
        name: updated.technician_name,
        email: updated.technician_email
      },
      message: 'Technician assigned successfully'
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update maintenance request (with status validation if status is being updated)
router.put('/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM maintenance_requests WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    // Validate status transition if status is being updated
    if (req.body.status && req.body.status !== existing.status) {
      const transitionValidation = validateStatusTransition(existing.status, req.body.status);
      if (!transitionValidation.valid) {
        return res.status(400).json({ 
          error: transitionValidation.error,
          current_status: existing.status,
          requested_status: req.body.status
        });
      }

      // Validate lifecycle rules
      const lifecycleValidation = validateLifecycleRules(existing, req.body.status, req.body);
      if (!lifecycleValidation.valid) {
        return res.status(400).json({ 
          error: lifecycleValidation.error,
          current_status: existing.status,
          requested_status: req.body.status
        });
      }
    }

    const request = new MaintenanceRequest({ ...existing, ...req.body });
    const data = request.toDB();
    const updated_at = new Date().toISOString();
    data.updated_at = updated_at;

    // Handle Scrap logic if status is being changed to Scrap
    if (req.body.status === 'Scrap' && existing.status !== 'Scrap' && existing.equipment_id) {
      // Update equipment status to Scrapped
      const equipment = await db.prepare('SELECT id, name, status FROM equipment WHERE id = ?').get(existing.equipment_id);
      if (equipment && equipment.status !== 'Scrapped') {
        await db.prepare(`
          UPDATE equipment 
          SET status = 'Scrapped', updated_at = ?
          WHERE id = ?
        `).run(updated_at, existing.equipment_id);

        // Log system note on equipment
        const equipmentNoteMessage = `Equipment "${equipment.name}" (ID: ${equipment.id}) marked as Scrapped due to maintenance request #${req.params.id}: "${existing.subject}"`;
        await db.prepare(`
          INSERT INTO system_notes (entity_type, entity_id, note_type, message, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run('equipment', existing.equipment_id, 'scrap', equipmentNoteMessage, updated_at);

        // Log system note on maintenance request
        const requestNoteMessage = `Maintenance request marked as Scrap. Equipment "${equipment.name}" automatically marked as Scrapped.`;
        await db.prepare(`
          INSERT INTO system_notes (entity_type, entity_id, note_type, message, created_at)
          VALUES (?, ?, ?, ?, ?)
        `).run('maintenance_request', req.params.id, 'scrap', requestNoteMessage, updated_at);
      }
    }

    await db.prepare(`
      UPDATE maintenance_requests 
      SET subject = ?, type = ?, equipment_id = ?, team_id = ?, assigned_technician = ?,
          scheduled_date = ?, duration = ?, priority = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.subject,
      data.type,
      data.equipment_id,
      data.team_id,
      data.assigned_technician,
      data.scheduled_date,
      data.duration,
      data.priority,
      data.status,
      data.updated_at,
      req.params.id
    );

    const updated = await db.prepare(`
      SELECT 
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        mt.team_name,
        t.name as technician_name,
        t.email as technician_email
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN technicians t ON mr.assigned_technician = t.id
      WHERE mr.id = ?
    `).get(req.params.id);

    res.json(MaintenanceRequest.fromDB(updated));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE maintenance request
router.delete('/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM maintenance_requests WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }

    await db.prepare('DELETE FROM maintenance_requests WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
