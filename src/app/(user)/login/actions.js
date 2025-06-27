'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import axios from 'axios';

export async function loginUser(formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user/signin`,
            { email, password },
            {
                headers: {
                    'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Extract user data from response
        const token = response.data.token;
        const name = response.data.user.username;
        const role = response.data.user.role;
        const purchasedGames = response.data.user.purchasedGames || [];
        const userId = response.data.user.userId;

        // Set cookies for authentication data
        const cookieStore = cookies();

        // Set secure HTTP-only cookies for sensitive data
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 10 * 365 * 24, // 1 week
            path: '/',
        });

        // Revalidate the home page to reflect the new authentication state
        revalidatePath('/');

        return {
            success: true,
            message: `Welcome back, ${name}!`,
            userData: {
                token,
                name,
                role,
                userId,
                purchasedGames
            }
        };
    } catch (error) {
        console.error('Login error:', error);

        // Handle axios specific errors
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return {
                success: false,
                message: error.response.data?.message || `Login failed with status ${error.response.status}. Please check your credentials.`
            };
        } else if (error.request) {
            // The request was made but no response was received
            return { success: false, message: 'No response received from server. Please try again later.' };
        } else {
            // Something happened in setting up the request that triggered an Error
            return { success: false, message: `Error: ${error.message}` };
        }
    }
}
