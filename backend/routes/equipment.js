const express = require('express');
const router = express.Router();
const db = require('../database/db');
const Equipment = require('../models/Equipment');

// GET all equipment
router.get('/', async (req, res) => {
  try {
    const equipment = await db.prepare(`
      SELECT e.*, mt.team_name as team_name
      FROM equipment e
      LEFT JOIN maintenance_teams mt ON e.default_maintenance_team = mt.id
      ORDER BY e.created_at DESC
    `).all();
    
    res.json(equipment.map(row => Equipment.fromDB(row)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET equipment by ID
router.get('/:id', async (req, res) => {
  try {
    const row = await db.prepare(`
      SELECT e.*, mt.team_name as team_name
      FROM equipment e
      LEFT JOIN maintenance_teams mt ON e.default_maintenance_team = mt.id
      WHERE e.id = ?
    `).get(req.params.id);
    
    if (!row) {
      return res.status(404).json({ error: 'Equipment not found' });
    }
    res.json(Equipment.fromDB(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new equipment
router.post('/', async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    const data = equipment.toDB();
    data.created_at = new Date().toISOString();
    data.updated_at = new Date().toISOString();

    const result = await db.prepare(`
      INSERT INTO equipment (name, serial_number, department, assigned_employee, purchase_date, warranty_expiry, location, default_maintenance_team, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      data.name,
      data.serial_number,
      data.department,
      data.assigned_employee,
      data.purchase_date,
      data.warranty_expiry,
      data.location,
      data.default_maintenance_team,
      data.status,
      data.created_at,
      data.updated_at
    );

    const newEquipment = await db.prepare('SELECT * FROM equipment WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(Equipment.fromDB(newEquipment));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update equipment
router.put('/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const equipment = new Equipment({ ...existing, ...req.body });
    const data = equipment.toDB();
    data.updated_at = new Date().toISOString();

    await db.prepare(`
      UPDATE equipment 
      SET name = ?, serial_number = ?, department = ?, assigned_employee = ?, purchase_date = ?, 
          warranty_expiry = ?, location = ?, default_maintenance_team = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.name,
      data.serial_number,
      data.department,
      data.assigned_employee,
      data.purchase_date,
      data.warranty_expiry,
      data.location,
      data.default_maintenance_team,
      data.status,
      data.updated_at,
      req.params.id
    );

    const updated = await db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id);
    res.json(Equipment.fromDB(updated));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH mark equipment as scrapped
router.patch('/:id/scrap', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    if (existing.status === 'Scrapped') {
      return res.status(400).json({ error: 'Equipment is already scrapped' });
    }

    const updated_at = new Date().toISOString();
    
    // Update equipment status to Scrapped
    await db.prepare(`
      UPDATE equipment 
      SET status = 'Scrapped', updated_at = ?
      WHERE id = ?
    `).run(updated_at, req.params.id);

    
    const noteMessage = `Equipment "${existing.name}" (ID: ${existing.id}) manually marked as Scrapped`;
    await db.prepare(`
      INSERT INTO system_notes (entity_type, entity_id, note_type, message, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('equipment', req.params.id, 'scrap', noteMessage, updated_at);

    // Fetch updated equipment with team info
    const updated = await db.prepare(`
      SELECT e.*, mt.team_name
      FROM equipment e
      LEFT JOIN maintenance_teams mt ON e.default_maintenance_team = mt.id
      WHERE e.id = ?
    `).get(req.params.id);

    res.json(Equipment.fromDB(updated));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE equipment
router.delete('/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM equipment WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    await db.prepare('DELETE FROM equipment WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
