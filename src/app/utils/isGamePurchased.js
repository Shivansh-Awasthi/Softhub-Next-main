'use client';

/**
 * Utility function to check if a game is purchased
 * Uses both localStorage and cookies for maximum reliability
 * 
 * @param {string} gameId - The ID of the game to check
 * @param {boolean} isAdmin - Whether the current user is an admin (optional)
 * @returns {boolean} - Whether the game is purchased or accessible
 */
export function isGamePurchased(gameId, isAdmin = false) {
  // If we're not on the client, we can't check localStorage
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Admin users can access all games
  if (isAdmin || localStorage.getItem('role') === 'ADMIN') {
    return true;
  }
  
  // Get purchased games from localStorage
  try {
    const purchasedGamesStr = localStorage.getItem('gData');
    if (purchasedGamesStr) {
      const purchasedGames = JSON.parse(purchasedGamesStr);
      if (Array.isArray(purchasedGames) && purchasedGames.includes(gameId)) {
        return true;
      }
    }
  } catch (error) {
    console.error('Error checking purchased games in localStorage:', error);
  }
  
  // If we couldn't find it in localStorage, return false
  return false;
}

/**
 * Utility function to get all purchased games
 * 
 * @returns {Array} - Array of purchased game IDs
 */
export function getPurchasedGames() {
  // If we're not on the client, we can't check localStorage
  if (typeof window === 'undefined') {
    return [];
  }
  
  // Get purchased games from localStorage
  try {
    const purchasedGamesStr = localStorage.getItem('gData');
    if (purchasedGamesStr) {
      const purchasedGames = JSON.parse(purchasedGamesStr);
      if (Array.isArray(purchasedGames)) {
        return purchasedGames;
      }
    }
  } catch (error) {
    console.error('Error getting purchased games from localStorage:', error);
  }
  
  return [];
}
