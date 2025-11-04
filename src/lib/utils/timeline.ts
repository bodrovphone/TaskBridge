/**
 * Converts timeline from hours format (e.g., "24h") to human-readable labels
 * @param timeline - Timeline string in format "24h" or number string
 * @param t - Translation function from react-i18next
 * @returns Human-readable timeline label
 */
export function getTimelineLabel(timeline: string, t: (key: string) => string): string {
  // If it's already a formatted string, return it
  if (!timeline.includes('h') && !timeline.match(/^\d+$/)) {
    return timeline;
  }

  // Extract hours if format is "24h" or just a number
  const hours = parseInt(timeline.replace('h', ''));

  if (isNaN(hours)) {
    return t('application.timelineFlexible');
  }

  if (hours <= 24) {
    return t('application.timelineToday');
  } else if (hours <= 72) {
    return t('application.timeline3days');
  } else if (hours <= 168) {
    return t('application.timelineWeek');
  } else {
    return t('application.timelineFlexible');
  }
}
