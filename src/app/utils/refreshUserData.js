'use client';

import axios from 'axios';

/**
 * Refreshes user data from the server and updates localStorage
 * This ensures that when a user refreshes the page, they see the latest data
 * without having to log in again
 */
const refreshUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://toxicgames.in';
        const response = await axios.get(`${apiUrl}/api/user`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN
            },
        });

        if (response.data.success) {
            const userData = response.data.user;

            // Update localStorage with the latest user data
            localStorage.setItem('name', userData.username);
            localStorage.setItem('role', userData.role);
            localStorage.setItem('gData', JSON.stringify(userData.purchasedGames || []));
            localStorage.setItem('userId', userData.userId);

            console.log('User data refreshed successfully');
            return userData;
        } else {
            console.error('Failed to refresh user data:', response.data.message);
            return null;
        }
    } catch (error) {
        console.error('Error refreshing user data:', error);
        return null;
    }
};

export default refreshUserData;
