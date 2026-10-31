/**
 * Landmark comparison lines based on building height in metres (floors * 3)
 */

export function getLandmarkLine(floors: number): string {
  if (floors <= 2) {
    return "A garden shed. Everyone starts somewhere.";
  }
  if (floors <= 5) {
    return "A neat little bungalow.";
  }
  if (floors <= 8) {
    return "Respectable. Almost a Gateway of India (26 m).";
  }
  if (floors <= 14) {
    return "You out-built the Gateway of India (26 m).";
  }
  if (floors <= 24) {
    return "Heading for the Qutub Minar (73 m). So close.";
  }
  if (floors <= 60) {
    return "You out-built the Qutub Minar (73 m).";
  }
  if (floors <= 109) {
    return "Past the Statue of Unity (182 m). Absolute unit.";
  }
  if (floors <= 275) {
    return "Eiffel Tower height (330 m) cleared. Show-off.";
  }
  return "Burj Khalifa (828 m). Go touch some grass.";
}

export function getMilestoneNote(floors: number): string | null {
  switch (floors) {
    case 5:
      return "steady hands";
    case 10:
      return "double digits!";
    case 20:
      return "okay, show-off";
    case 30:
      return "someone call the architect";
    case 50:
      return "this is a skyscraper";
    default:
      return null;
  }
}

