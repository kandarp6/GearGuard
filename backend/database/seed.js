const db = require('./db');

// Seed sample data for development/testing
async function seedDatabase() {
  try {
    // Clear existing data
    await db.exec(`
      DELETE FROM maintenance_requests;
      DELETE FROM technicians;
      DELETE FROM equipment;
      DELETE FROM maintenance_teams;
    `);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Insert sample maintenance teams
    const team1 = await db.prepare(`
      INSERT INTO maintenance_teams (team_name, specialization, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run('IT Support Team', 'IT Equipment & Computers', now.toISOString(), now.toISOString());

    const team2 = await db.prepare(`
      INSERT INTO maintenance_teams (team_name, specialization, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run('Mechanical Team', 'Vehicles & Machinery', now.toISOString(), now.toISOString());

    const team3 = await db.prepare(`
      INSERT INTO maintenance_teams (team_name, specialization, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run('Electrical Team', 'Electrical Systems & Equipment', now.toISOString(), now.toISOString());

    // Insert sample equipment (5 items)
    const eq1 = await db.prepare(`
      INSERT INTO equipment (name, serial_number, department, assigned_employee, purchase_date, warranty_expiry, location, default_maintenance_team, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Dell Latitude 7420 Laptop',
      'DL-LAT-7420-001',
      'Engineering',
      'Sarah Chen',
      '2023-03-15',
      '2026-03-15',
      'Building A, Floor 3, Office 301',
      team1.lastInsertRowid,
      'Active',
      now.toISOString(),
      now.toISOString()
    );

    const eq2 = await db.prepare(`
      INSERT INTO equipment (name, serial_number, department, assigned_employee, purchase_date, warranty_expiry, location, default_maintenance_team, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'HP LaserJet Pro Printer',
      'HP-LJ-4050-002',
      'Administration',
      'Michael Torres',
      '2023-01-20',
      '2026-01-20',
      'Building B, Floor 1, Reception',
      team1.lastInsertRowid,
      'Active',
      now.toISOString(),
      now.toISOString()
    );

    const eq3 = await db.prepare(`
      INSERT INTO equipment (name, serial_number, department, assigned_employee, purchase_date, warranty_expiry, location, default_maintenance_team, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Ford Transit Van #12',
      'VAN-FT-2022-012',
      'Logistics',
      'David Martinez',
      '2022-08-10',
      '2025-08-10',
      'Parking Lot A, Bay 12',
      team2.lastInsertRowid,
      'Active',
      now.toISOString(),
      now.toISOString()
    );

    const eq4 = await db.prepare(`
      INSERT INTO equipment (name, serial_number, department, assigned_employee, purchase_date, warranty_expiry, location, default_maintenance_team, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'CNC Milling Machine',
      'CNC-MILL-2023-05',
      'Manufacturing',
      'Robert Kim',
      '2023-05-22',
      '2026-05-22',
      'Factory Floor 2, Station 5',
      team2.lastInsertRowid,
      'Active',
      now.toISOString(),
      now.toISOString()
    );

    const eq5 = await db.prepare(`
      INSERT INTO equipment (name, serial_number, department, assigned_employee, purchase_date, warranty_expiry, location, default_maintenance_team, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Industrial Generator 500kW',
      'GEN-500KW-2021-08',
      'Facilities',
      'Jennifer Lee',
      '2021-11-30',
      '2024-11-30',
      'Building C, Basement, Generator Room',
      team3.lastInsertRowid,
      'Active',
      now.toISOString(),
      now.toISOString()
    );

    // Insert sample technicians (6 total - 2 per team)
    const tech1 = await db.prepare(`
      INSERT INTO technicians (name, email, team_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('Alice Williams', 'alice.williams@company.com', team1.lastInsertRowid, now.toISOString(), now.toISOString());

    const tech2 = await db.prepare(`
      INSERT INTO technicians (name, email, team_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('James Anderson', 'james.anderson@company.com', team1.lastInsertRowid, now.toISOString(), now.toISOString());

    const tech3 = await db.prepare(`
      INSERT INTO technicians (name, email, team_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('Mike Brown', 'mike.brown@company.com', team2.lastInsertRowid, now.toISOString(), now.toISOString());

    const tech4 = await db.prepare(`
      INSERT INTO technicians (name, email, team_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('Emma Wilson', 'emma.wilson@company.com', team2.lastInsertRowid, now.toISOString(), now.toISOString());

    const tech5 = await db.prepare(`
      INSERT INTO technicians (name, email, team_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('Sarah Davis', 'sarah.davis@company.com', team3.lastInsertRowid, now.toISOString(), now.toISOString());

    const tech6 = await db.prepare(`
      INSERT INTO technicians (name, email, team_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('Chris Taylor', 'chris.taylor@company.com', team3.lastInsertRowid, now.toISOString(), now.toISOString());

    // Insert sample maintenance requests (10 requests)
    // Request 1: New - Laptop screen repair (IT)
    await db.prepare(`
      INSERT INTO maintenance_requests (subject, type, equipment_id, team_id, assigned_technician, scheduled_date, duration, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Screen flickering issue on Dell Latitude',
      'Corrective',
      eq1.lastInsertRowid,
      team1.lastInsertRowid,
      tech1.lastInsertRowid,
      nextWeek.toISOString().split('T')[0],
      null,
      'Medium',
      'New',
      lastWeek.toISOString(),
      lastWeek.toISOString()
    );

    // Request 2: In Progress - Printer paper jam (IT)
    await db.prepare(`
      INSERT INTO maintenance_requests (subject, type, equipment_id, team_id, assigned_technician, scheduled_date, duration, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Paper jam in HP LaserJet Pro',
      'Corrective',
      eq2.lastInsertRowid,
      team1.lastInsertRowid,
      tech2.lastInsertRowid,
      today.toISOString().split('T')[0],
      null,
      'Medium',
      'In Progress',
      yesterday.toISOString(),
      today.toISOString()
    );

    // Request 3: Repaired - Van oil change (Mechanical)
    await db.prepare(`
      INSERT INTO maintenance_requests (subject, type, equipment_id, team_id, assigned_technician, scheduled_date, duration, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Routine oil change and inspection',
      'Preventive',
      eq3.lastInsertRowid,
      team2.lastInsertRowid,
      tech3.lastInsertRowid,
      lastWeek.toISOString().split('T')[0],
      45,
      'High',
      'Repaired',
      lastWeek.toISOString(),
      yesterday.toISOString()
    );

    // Request 4: New - CNC calibration (Mechanical)
    await db.prepare(`
      INSERT INTO maintenance_requests (subject, type, equipment_id, team_id, assigned_technician, scheduled_date, duration, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'CNC machine calibration required',
      'Preventive',
      eq4.lastInsertRowid,
      team2.lastInsertRowid,
      null,
      nextMonth.toISOString().split('T')[0],
      null,
      'High',
      'New',
      yesterday.toISOString(),
      yesterday.toISOString()
    );

    // Request 5: In Progress - Generator maintenance (Electrical)
    await db.prepare(`
      INSERT INTO maintenance_requests (subject, type, equipment_id, team_id, assigned_technician, scheduled_date, duration, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Monthly generator inspection and testing',
      'Preventive',
      eq5.lastInsertRowid,
      team3.lastInsertRowid,
      tech5.lastInsertRowid,
      today.toISOString().split('T')[0],
      null,
      'High',
      'In Progress',
      lastWeek.toISOString(),
      today.toISOString()
    );

    // Request 6: Overdue - Laptop keyboard replacement (IT)
    await db.prepare(`
      INSERT INTO maintenance_requests (subject, type, equipment_id, team_id, assigned_technician, scheduled_date, duration, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Keyboard keys not responding',
      'Corrective',
      eq1.lastInsertRowid,
      team1.lastInsertRowid,
      tech1.lastInsertRowid,
      lastWeek.toISOString().split('T')[0],
      null,
      'Medium',
      'New',
      lastWeek.toISOString(),
      lastWeek.toISOString()
    );

    // Request 7: New - Van tire replacement (Mechanical)
    await db.prepare(`
      INSERT INTO maintenance_requests (subject, type, equipment_id, team_id, assigned_technician, scheduled_date, duration, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Front tire replacement needed',
      'Corrective',
      eq3.lastInsertRowid,
      team2.lastInsertRowid,
      null,
      nextWeek.toISOString().split('T')[0],
      null,
      'High',
      'New',
      yesterday.toISOString(),
      yesterday.toISOString()
    );

    // Request 8: Repaired - Printer toner replacement (IT)
    await db.prepare(`
      INSERT INTO maintenance_requests (subject, type, equipment_id, team_id, assigned_technician, scheduled_date, duration, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Replace black toner cartridge',
      'Preventive',
      eq2.lastInsertRowid,
      team1.lastInsertRowid,
      tech2.lastInsertRowid,
      lastWeek.toISOString().split('T')[0],
      15,
      'Low',
      'Repaired',
      lastWeek.toISOString(),
      yesterday.toISOString()
    );

    // Request 9: New - Generator battery check (Electrical)
    await db.prepare(`
      INSERT INTO maintenance_requests (subject, type, equipment_id, team_id, assigned_technician, scheduled_date, duration, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Generator battery health check',
      'Preventive',
      eq5.lastInsertRowid,
      team3.lastInsertRowid,
      null,
      nextWeek.toISOString().split('T')[0],
      null,
      'Medium',
      'New',
      yesterday.toISOString(),
      yesterday.toISOString()
    );

    // Request 10: Scrap - Old equipment
    await db.prepare(`
      INSERT INTO maintenance_requests (subject, type, equipment_id, team_id, assigned_technician, scheduled_date, duration, priority, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Equipment beyond repair - recommend scrapping',
      'Corrective',
      eq2.lastInsertRowid,
      team1.lastInsertRowid,
      tech1.lastInsertRowid,
      yesterday.toISOString().split('T')[0],
      null,
      'Low',
      'Scrap',
      lastWeek.toISOString(),
      yesterday.toISOString()
    );

    console.log('✅ Demo data seeded successfully');
    console.log(`   - 3 Teams (IT, Mechanical, Electrical)`);
    console.log(`   - 5 Equipment items`);
    console.log(`   - 6 Technicians (2 per team)`);
    console.log(`   - 10 Maintenance requests`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Only seed if database is empty
async function checkAndSeed() {
  try {
    const teamCount = await db.prepare('SELECT COUNT(*) as count FROM maintenance_teams').get();
    if (teamCount.count === 0) {
      await seedDatabase();
    } else {
      console.log('⚠️  Database already has data. To re-seed, delete the database file.');
    }
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

// Run check on module load
checkAndSeed();

module.exports = { seedDatabase };
