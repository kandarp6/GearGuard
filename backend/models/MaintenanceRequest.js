// MaintenanceRequest Model
// Represents both corrective and preventive maintenance requests

class MaintenanceRequest {
  constructor(data) {
    this.id = data.id || null;
    this.subject = data.subject || '';
    this.type = data.type || 'Corrective'; // 'Corrective' or 'Preventive'
    this.equipment_id = data.equipment_id || null; // FK to Equipment
    this.team_id = data.team_id || null; // FK to MaintenanceTeam
    this.assigned_technician = data.assigned_technician || null; // FK to Technician
    this.scheduled_date = data.scheduled_date || null;
    this.duration = data.duration || null; // Duration in minutes or hours
    this.priority = data.priority || 'Medium'; // 'Low', 'Medium', 'High', 'Urgent'
    this.status = data.status || 'New'; // 'New', 'In Progress', 'Repaired', 'Scrap'
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }

  // Convert to database format (snake_case)
  toDB() {
    return {
      subject: this.subject,
      type: this.type,
      equipment_id: this.equipment_id,
      team_id: this.team_id,
      assigned_technician: this.assigned_technician,
      scheduled_date: this.scheduled_date,
      duration: this.duration,
      priority: this.priority,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  // Create from database row
  static fromDB(row) {
    const request = new MaintenanceRequest({
      id: row.id,
      subject: row.subject,
      type: row.type,
      equipment_id: row.equipment_id,
      team_id: row.team_id,
      assigned_technician: row.assigned_technician,
      scheduled_date: row.scheduled_date,
      duration: row.duration,
      priority: row.priority,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
    
    // Add joined fields if present (from API queries)
    if (row.equipment_name) request.equipment_name = row.equipment_name;
    if (row.equipment_serial) request.equipment_serial = row.equipment_serial;
    if (row.team_name) request.team_name = row.team_name;
    if (row.technician_name) request.technician_name = row.technician_name;
    if (row.technician_email) request.technician_email = row.technician_email;
    
    return request;
  }
}

module.exports = MaintenanceRequest;
