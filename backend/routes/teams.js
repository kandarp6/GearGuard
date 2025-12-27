const express = require('express');
const router = express.Router();
const db = require('../database/db');
const MaintenanceTeam = require('../models/MaintenanceTeam');

// GET all teams
router.get('/', async (req, res) => {
  try {
    const teams = await db.prepare('SELECT * FROM maintenance_teams ORDER BY created_at DESC').all();
    res.json(teams.map(row => MaintenanceTeam.fromDB(row)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET team by ID
router.get('/:id', async (req, res) => {
  try {
    const row = await db.prepare('SELECT * FROM maintenance_teams WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(MaintenanceTeam.fromDB(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET team with technicians and equipment count
router.get('/:id/details', async (req, res) => {
  try {
    const team = await db.prepare('SELECT * FROM maintenance_teams WHERE id = ?').get(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const technicians = await db.prepare('SELECT * FROM technicians WHERE team_id = ?').all(req.params.id);
    const equipmentCount = await db.prepare('SELECT COUNT(*) as count FROM equipment WHERE default_maintenance_team = ?').get(req.params.id);

    res.json({
      ...MaintenanceTeam.fromDB(team),
      technicians: technicians.map(t => require('../models/Technician').fromDB(t)),
      equipment_count: equipmentCount.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new team
router.post('/', async (req, res) => {
  try {
    const team = new MaintenanceTeam(req.body);
    const data = team.toDB();
    data.created_at = new Date().toISOString();
    data.updated_at = new Date().toISOString();

    const result = await db.prepare(`
      INSERT INTO maintenance_teams (team_name, specialization, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run(
      data.team_name,
      data.specialization,
      data.created_at,
      data.updated_at
    );

    const newTeam = await db.prepare('SELECT * FROM maintenance_teams WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(MaintenanceTeam.fromDB(newTeam));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update team
router.put('/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM maintenance_teams WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const team = new MaintenanceTeam({ ...existing, ...req.body });
    const data = team.toDB();
    data.updated_at = new Date().toISOString();

    await db.prepare(`
      UPDATE maintenance_teams 
      SET team_name = ?, specialization = ?, updated_at = ?
      WHERE id = ?
    `).run(data.team_name, data.specialization, data.updated_at, req.params.id);

    const updated = await db.prepare('SELECT * FROM maintenance_teams WHERE id = ?').get(req.params.id);
    res.json(MaintenanceTeam.fromDB(updated));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE team
router.delete('/:id', async (req, res) => {
  try {
    const existing = await db.prepare('SELECT * FROM maintenance_teams WHERE id = ?').get(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await db.prepare('DELETE FROM maintenance_teams WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
