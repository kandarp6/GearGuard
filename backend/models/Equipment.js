// Equipment Model
// Represents machines, laptops, vehicles, etc.

class Equipment {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.serial_number = data.serial_number || '';
    this.department = data.department || '';
    this.assigned_employee = data.assigned_employee || '';
    this.purchase_date = data.purchase_date || null;
    this.warranty_expiry = data.warranty_expiry || null;
    this.location = data.location || '';
    this.default_maintenance_team = data.default_maintenance_team || null; // FK to MaintenanceTeam
    this.status = data.status || 'Active'; // 'Active' or 'Scrapped'
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Convert to database format (snake_case)
  toDB() {
    return {
      name: this.name,
      serial_number: this.serial_number,
      department: this.department,
      assigned_employee: this.assigned_employee,
      purchase_date: this.purchase_date,
      warranty_expiry: this.warranty_expiry,
      location: this.location,
      default_maintenance_team: this.default_maintenance_team,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Create from database row
  static fromDB(row) {
    const equipment = new Equipment({
      id: row.id,
      name: row.name,
      serial_number: row.serial_number,
      department: row.department,
      assigned_employee: row.assigned_employee,
      purchase_date: row.purchase_date,
      warranty_expiry: row.warranty_expiry,
      location: row.location,
      default_maintenance_team: row.default_maintenance_team,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
    
    // Add team_name if present (from JOIN)
    if (row.team_name) {
      equipment.team_name = row.team_name;
    }
    
    return equipment;
  }
}

module.exports = Equipment;
