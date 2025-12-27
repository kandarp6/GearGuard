const express = require('express');
const router = express.Router();
const db = require('../database/db');
const Technician = require('../models/Technician');

// GET all technicians
router.get('/', async (req, res) => {
  try {
    const technicians = await db.prepare(`
      SELECT t.*, mt.team_name
      FROM technicians t
      LEFT JOIN maintenance_teams mt ON t.team_id = mt.id
      ORDER BY t.created_at DESC
    `).all();
    
    res.json(technicians.map(row => Technician.fromDB(row)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET technician by ID
router.get('/:id', async (req, res) => {
  try {
    const row = await db.prepare(`
      SELECT t.*, mt.team_name
      FROM technicians t
      LEFT JOIN maintenance_teams mt ON t.team_id = mt.id
      WHERE t.id = ?
    `).get(req.params.id);
    
    if (!row) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    res.json(Technician.fromDB(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET technicians by team ID
router.get('/team/:teamId', async (req, res) => {
  try {
    const technicians = await db.prepare(`
      SELECT t.*, mt.team_name
      FROM technicians t
      LEFT JOIN maintenance_teams mt ON t.team_id = mt.id
      WHERE t.team_id = ?
    `).all(req.params.teamId);
    
    res.json(technicians.map(row => Technician.fromDB(row)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new technician
router.post('/', async (req, res) => {
  try {
    const technician = new Technician(req.body);
    const data = technician.toDB();
    data.created_at = new Date().toISOString();
    data.updated_at = new Date().toISOString();

    const result = await db.prepare(`
      INSERT INTO technicians (name, email, team_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      data.name,
      data.email,
      data.team_id,
      data.created_at,
      data.updated_at
    );

    const newTechnician = await db.prepare('SELECT * FROM technicians WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(Technician.fromDB(newTechnician));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update technician
router.put('/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM technicians WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    const technician = new Technician({ ...existing, ...req.body });
    const data = technician.toDB();
    data.updated_at = new Date().toISOString();

    await db.prepare(`
      UPDATE technicians 
      SET name = ?, email = ?, team_id = ?, updated_at = ?
      WHERE id = ?
    `).run(data.name, data.email, data.team_id, data.updated_at, req.params.id);

    const updated = await db.prepare('SELECT * FROM technicians WHERE id = ?').get(req.params.id);
    res.json(Technician.fromDB(updated));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE technician
router.delete('/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM technicians WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    await db.prepare('DELETE FROM technicians WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
