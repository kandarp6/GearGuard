/**
 * Auto-determine priority based on equipment type
 * Matches backend logic: Vehicles/Machinery = High, IT Equipment = Medium, Others = Low
 */
export function determinePriority(equipmentName, teamSpecialization) {
  if (!equipmentName && !teamSpecialization) {
    return 'Medium'; // Default
  }

  const name = (equipmentName || '').toLowerCase();
  const specialization = (teamSpecialization || '').toLowerCase();

  // High priority: Vehicles, Machinery, Production equipment
  if (
    name.includes('vehicle') || name.includes('van') || name.includes('truck') ||
    name.includes('machine') || name.includes('cnc') || name.includes('production') ||
    name.includes('factory') || specialization.includes('vehicle') ||
    specialization.includes('machinery') || specialization.includes('fleet')
  ) {
    return 'High';
  }

  // Medium priority: IT Equipment, Laptops, Computers
  if (
    name.includes('laptop') || name.includes('computer') || name.includes('desktop') ||
    name.includes('server') || name.includes('printer') || name.includes('monitor') ||
    specialization.includes('it') || specialization.includes('computer')
  ) {
    return 'Medium';
  }

  // Low priority: Office equipment, general items
  return 'Low';
}

