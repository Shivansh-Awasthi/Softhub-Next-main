'use client';

import { useEffect } from 'react';
import refreshUserData from '../utils/refreshUserData';

/**
 * This component automatically refreshes user data when the page loads
 * It doesn't render anything visible - it just runs the refresh function
 */
const UserDataRefresher = () => {
    useEffect(() => {
        // Only run if we have a token (user is logged in)
        if (typeof window !== 'undefined' && localStorage.getItem('token')) {
            refreshUserData();
            
            // Also set up refresh when page becomes visible again
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible' && localStorage.getItem('token')) {
                    refreshUserData();
                }
            };
            
            document.addEventListener('visibilitychange', handleVisibilityChange);
            
            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, []);

    // This component doesn't render anything
    return null;
};

export default UserDataRefresher;
