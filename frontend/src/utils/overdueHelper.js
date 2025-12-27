/**
 * Overdue Detection Utility
 * 
 * A request is considered overdue if:
 * - It has a scheduled_date
 * - The scheduled date is in the past (before today)
 * - Status is NOT "Repaired" or "Scrap"
 */

/**
 * Check if a maintenance request is overdue
 * @param {object} request - Maintenance request object
 * @returns {boolean} - True if request is overdue
 */
export function isOverdue(request) {
  // Must have a scheduled date
  if (!request.scheduled_date) {
    return false;
  }

  // Parse scheduled date
  const scheduled = new Date(request.scheduled_date);
  const now = new Date();
  
  // Reset time to midnight for date-only comparison
  scheduled.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  // Check if scheduled date is in the past
  const isPastDue = scheduled < now;

  // Check if status is terminal (not overdue if already completed)
  const isTerminal = request.status === 'Repaired' || request.status === 'Scrap';

  // Overdue if past due and not terminal
  return isPastDue && !isTerminal;
}

/**
 * Get overdue requests from an array
 * @param {array} requests - Array of maintenance requests
 * @returns {array} - Array of overdue requests
 */
export function getOverdueRequests(requests) {
  return requests.filter(request => isOverdue(request));
}

/**
 * Get overdue count from an array
 * @param {array} requests - Array of maintenance requests
 * @returns {number} - Count of overdue requests
 */
export function getOverdueCount(requests) {
  return getOverdueRequests(requests).length;
}

/**
 * Format overdue message
 * @param {object} request - Maintenance request object
 * @returns {string} - Formatted overdue message
 */
export function getOverdueMessage(request) {
  if (!isOverdue(request)) {
    return null;
  }

  const scheduled = new Date(request.scheduled_date);
  const now = new Date();
  const daysOverdue = Math.floor((now - scheduled) / (1000 * 60 * 60 * 24));

  if (daysOverdue === 0) {
    return 'Due today';
  } else if (daysOverdue === 1) {
    return '1 day overdue';
  } else {
    return `${daysOverdue} days overdue`;
  }
}

