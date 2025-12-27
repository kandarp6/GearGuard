/**
 * Team Icons Utility
 * Returns appropriate icon/emoji for each team specialization
 */

export function getTeamIcon(teamName, specialization) {
  if (!teamName && !specialization) {
    return '👥'; // Default icon
  }

  const name = (teamName || '').toLowerCase();
  const spec = (specialization || '').toLowerCase();

  // IT Team
  if (
    name.includes('it') || name.includes('support') ||
    spec.includes('it') || spec.includes('computer') || spec.includes('laptop')
  ) {
    return '💻'; // Laptop icon
  }

  // Mechanical Team
  if (
    name.includes('mechanical') || name.includes('vehicle') || name.includes('machinery') ||
    spec.includes('vehicle') || spec.includes('machinery') || spec.includes('fleet') ||
    spec.includes('mechanical')
  ) {
    return '🔧'; // Wrench icon
  }

  // Electrical Team
  if (
    name.includes('electrical') || name.includes('electric') ||
    spec.includes('electrical') || spec.includes('electric') || spec.includes('generator')
  ) {
    return '⚡'; // Lightning icon
  }

  // Default
  return '👥';
}

export function getTeamColor(teamName, specialization) {
  if (!teamName && !specialization) {
    return '#6c757d'; // Default gray
  }

  const name = (teamName || '').toLowerCase();
  const spec = (specialization || '').toLowerCase();

  // IT Team - Blue
  if (
    name.includes('it') || name.includes('support') ||
    spec.includes('it') || spec.includes('computer') || spec.includes('laptop')
  ) {
    return '#007bff';
  }

  // Mechanical Team - Orange
  if (
    name.includes('mechanical') || name.includes('vehicle') || name.includes('machinery') ||
    spec.includes('vehicle') || spec.includes('machinery') || spec.includes('fleet') ||
    spec.includes('mechanical')
  ) {
    return '#fd7e14';
  }

  // Electrical Team - Yellow/Gold
  if (
    name.includes('electrical') || name.includes('electric') ||
    spec.includes('electrical') || spec.includes('electric') || spec.includes('generator')
  ) {
    return '#ffc107';
  }

  // Default
  return '#6c757d';
}

