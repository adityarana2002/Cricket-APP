/**
 * Two-letter avatar initials for a team or player name.
 * Shared by the local-match page, the watch modal and the dashboard.
 */
export const getInitials = (name: string): string => {
  const words = (name ?? '').trim().split(/\s+/);
  return words
    .slice(0, 2)
    .map(w => w[0] || '')
    .join('')
    .toUpperCase() || '??';
};
