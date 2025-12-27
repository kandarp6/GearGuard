/**
 * Client-side workflow validation for maintenance request status transitions
 * Matches backend validation logic
 */

export const VALID_STATUSES = ['New', 'In Progress', 'Repaired', 'Scrap'];

export const ALLOWED_TRANSITIONS = {
  'New': ['In Progress', 'Scrap'],
  'In Progress': ['Repaired'],
};

export const TERMINAL_STATES = ['Repaired', 'Scrap'];

/**
 * Validate lifecycle rules for status transitions
 * @param {object} request - Current request data
 * @param {string} newStatus - New status being set
 * @param {object} updateData - Data being updated
 * @returns {object} { valid: boolean, error: string }
 */
export function validateLifecycleRules(request, newStatus, updateData = {}) {
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
 * Validate status transition
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - Desired new status
 * @returns {object} { valid: boolean, error: string }
 */
export function validateStatusTransition(currentStatus, newStatus) {
  // Normalize status values
  const current = currentStatus?.trim();
  const next = newStatus?.trim();

  // Check if new status is valid
  if (!VALID_STATUSES.includes(next)) {
    return {
      valid: false,
      error: `Invalid status: ${next}. Valid statuses are: ${VALID_STATUSES.join(', ')}`
    };
  }

  // Terminal states - cannot transition from these
  if (TERMINAL_STATES.includes(current)) {
    return {
      valid: false,
      error: `Cannot change status from terminal state: ${current}`
    };
  }

  // Same status is always valid (idempotent)
  if (current === next) {
    return { valid: true, error: null };
  }

  // Check allowed transitions
  const allowed = ALLOWED_TRANSITIONS[current];
  
  if (!allowed || !allowed.includes(next)) {
    return {
      valid: false,
      error: `Invalid transition: ${current} → ${next}. Allowed transitions: ${allowed?.join(', ') || 'none'}`
    };
  }

  return { valid: true, error: null };
}

/**
 * Get allowed target statuses for a given current status
 * @param {string} currentStatus - Current status
 * @returns {string[]} Array of allowed target statuses
 */
export function getAllowedTargetStatuses(currentStatus) {
  if (TERMINAL_STATES.includes(currentStatus)) {
    return [];
  }
  
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return allowed || [];
}

