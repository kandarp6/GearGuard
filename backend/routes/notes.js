const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET system notes for an entity
router.get('/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const notes = await db.prepare(`
      SELECT * FROM system_notes
      WHERE entity_type = ? AND entity_id = ?
      ORDER BY created_at DESC
    `).all(entityType, entityId);
    
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all system notes (with optional filtering)
router.get('/', async (req, res) => {
  try {
    const { entity_type, entity_id, note_type } = req.query;
    
    let query = 'SELECT * FROM system_notes WHERE 1=1';
    const params = [];
    
    if (entity_type) {
      query += ' AND entity_type = ?';
      params.push(entity_type);
    }
    if (entity_id) {
      query += ' AND entity_id = ?';
      params.push(entity_id);
    }
    if (note_type) {
      query += ' AND note_type = ?';
      params.push(note_type);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    const notes = await db.prepare(query).all(...params);
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
