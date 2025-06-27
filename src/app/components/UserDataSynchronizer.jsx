'use client';

import { useEffect } from 'react';
import { fetchUserData } from '../actions/fetchUserData';

const UserDataSynchronizer = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const syncUserData = async () => {
      try {
        const result = await fetchUserData();

        if (result.success && result.userData) {
          localStorage.setItem('name', result.userData.username);
          localStorage.setItem('role', result.userData.role);
          localStorage.setItem('userId', result.userData.userId);
          localStorage.setItem('gData', JSON.stringify(result.userData.purchasedGames || []));
        }
        // Removed the else block that was showing the error
      } catch (error) {
        // This will still catch network errors or other exceptions if you want
        // You can remove this too if you want complete silence
      }
    };

    syncUserData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && localStorage.getItem('token')) {
        syncUserData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
};

export default UserDataSynchronizer;