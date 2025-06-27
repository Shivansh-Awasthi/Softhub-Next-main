'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import axios from 'axios';

/**
 * Server action to fetch user data
 * This runs on the server, so no requests will appear in the network tab
 */
export async function fetchUserData() {
  try {
    // Get token from cookies - properly awaited
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    // Make the API request from the server
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://toxicgames.in';
    const response = await axios.get(`${apiUrl}/api/user/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN
      },
    });

    if (response.data.success) {
      const userData = response.data.user;

      // Update cookies with the latest user data
      cookieStore.set('name', userData.username, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      cookieStore.set('role', userData.role, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      cookieStore.set('userId', userData.userId, {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      // For purchased games, we need to stringify the array
      cookieStore.set('gData', JSON.stringify(userData.purchasedGames || []), {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      // Revalidate all pages to ensure they have the latest data
      revalidatePath('/');

      return {
        success: true,
        userData: {
          username: userData.username,
          role: userData.role,
          userId: userData.userId,
          purchasedGames: userData.purchasedGames || []
        }
      };
    } else {
      return { success: false, message: response.data.message || 'Failed to fetch user data' };
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'An error occurred while fetching user data'
    };
  }
}
