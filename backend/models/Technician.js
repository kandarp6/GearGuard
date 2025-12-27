// Technician Model
// Represents maintenance technicians

class Technician {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.team_id = data.team_id || null; // FK to MaintenanceTeam
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Convert to database format (snake_case)
  toDB() {
    return {
      name: this.name,
      email: this.email,
      team_id: this.team_id,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Create from database row
  static fromDB(row) {
    return new Technician({
      id: row.id,
      name: row.name,
      email: row.email,
      team_id: row.team_id,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }
}

module.exports = Technician;
