const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize database connection
const db = new sqlite3.Database(path.join(__dirname, 'gearguard.db'));

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Compatibility layer to make sqlite3 work like better-sqlite3
const compatibilityLayer = {
  prepare: function(sql) {
    return {
      run: function(...params) {
        return new Promise((resolve, reject) => {
          db.run(sql, params, function(err) {
            if (err) {
              reject(err);
            } else {
              this.lastInsertRowid = this.lastID;
              resolve(this);
            }
          });
        });
      },
      get: function(...params) {
        return new Promise((resolve, reject) => {
          db.get(sql, params, (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        });
      },
      all: function(...params) {
        return new Promise((resolve, reject) => {
          db.all(sql, params, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows || []);
            }
          });
        });
      }
    };
  },
  exec: function(sql) {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Initialize database schema
async function initializeDatabase() {
  const exec = compatibilityLayer.exec;
  
  try {
    await exec(`
      CREATE TABLE IF NOT EXISTS maintenance_teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        team_name TEXT NOT NULL,
        specialization TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    await exec(`
      CREATE TABLE IF NOT EXISTS equipment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        serial_number TEXT UNIQUE,
        department TEXT,
        assigned_employee TEXT,
        purchase_date TEXT,
        warranty_expiry TEXT,
        location TEXT,
        default_maintenance_team INTEGER,
        status TEXT NOT NULL DEFAULT 'Active' CHECK(status IN ('Active', 'Scrapped')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (default_maintenance_team) REFERENCES maintenance_teams(id) ON DELETE SET NULL
      )
    `);
    
    await exec(`
      CREATE TABLE IF NOT EXISTS technicians (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        team_id INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE SET NULL
      )
    `);
    
    await exec(`
      CREATE TABLE IF NOT EXISTS maintenance_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('Corrective', 'Preventive')),
        equipment_id INTEGER,
        team_id INTEGER,
        assigned_technician INTEGER,
        scheduled_date TEXT,
        duration INTEGER,
        priority TEXT NOT NULL DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')),
        status TEXT NOT NULL DEFAULT 'New' CHECK(status IN ('New', 'In Progress', 'Repaired', 'Scrap')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE SET NULL,
        FOREIGN KEY (team_id) REFERENCES maintenance_teams(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_technician) REFERENCES technicians(id) ON DELETE SET NULL
      )
    `);
    
    await exec(`
      CREATE TABLE IF NOT EXISTS system_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id INTEGER NOT NULL,
        note_type TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    
    await exec(`
      CREATE INDEX IF NOT EXISTS idx_equipment_team ON equipment(default_maintenance_team);
      CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
      CREATE INDEX IF NOT EXISTS idx_technician_team ON technicians(team_id);
      CREATE INDEX IF NOT EXISTS idx_request_equipment ON maintenance_requests(equipment_id);
      CREATE INDEX IF NOT EXISTS idx_request_team ON maintenance_requests(team_id);
      CREATE INDEX IF NOT EXISTS idx_request_technician ON maintenance_requests(assigned_technician);
      CREATE INDEX IF NOT EXISTS idx_request_status ON maintenance_requests(status);
      CREATE INDEX IF NOT EXISTS idx_request_type ON maintenance_requests(type);
      CREATE INDEX IF NOT EXISTS idx_request_scheduled_date ON maintenance_requests(scheduled_date);
      CREATE INDEX IF NOT EXISTS idx_system_notes_entity ON system_notes(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_system_notes_type ON system_notes(note_type);
    `);
    
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
  throw err;
  }
}

// Initialize on module load
initializeDatabase().catch(err => {
  console.error('❌ Database initialization failed:', err);
});

// Export compatibility layer
module.exports = compatibilityLayer;
