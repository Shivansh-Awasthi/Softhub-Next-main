/**
 * Format a date string consistently between server and client
 * @param {string} dateString - The date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Use YYYY-MM-DD format which is consistent across server and client
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Create a URL-friendly slug from a title
 * @param {string} title - The title to convert to a slug
 * @returns {string} - URL-friendly slug
 */
export const createSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase() // Convert to lowercase
    .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .trim(); // Remove trailing spaces
};

/**
 * Get platform-specific color class
 * @param {string} platform - The platform name
 * @returns {string} - Tailwind CSS color class
 */
export const getPlatformColorClass = (platform) => {
  switch (platform) {
    case 'Mac':
      return 'text-blue-400';
    case 'PC':
      return 'text-red-400';
    case 'Android':
      return 'text-green-400';
    case 'Playstation':
      return 'text-purple-400';
    case 'iOS':
      return 'text-yellow-400';
    default:
      return 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400';
  }
};
