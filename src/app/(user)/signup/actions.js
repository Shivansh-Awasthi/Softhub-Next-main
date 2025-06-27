'use server';

import { revalidatePath } from 'next/cache';
import axios from 'axios';

export async function registerUser(formData) {
    const username = formData.get('username');
    const email = formData.get('email');
    const password = formData.get('password');

    // Basic validation
    if (!username || !email || !password) {
        return {
            success: false,
            message: 'All fields are required'
        };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            success: false,
            message: 'Please enter a valid email address'
        };
    }

    // Password validation (at least 8 characters)
    if (password.length < 8) {
        return {
            success: false,
            message: 'Password must be at least 8 characters long'
        };
    }

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user/signup`,
            {
                username,
                email,
                password
            },
            {
                headers: {
                    'X-Auth-Token': process.env.NEXT_PUBLIC_API_TOKEN,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Revalidate the login page to reflect the new user
        revalidatePath('/login');

        return {
            success: true,
            message: 'User created successfully!'
        };
    } catch (error) {
        console.error('Registration error:', error);

        // Handle axios specific errors
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx

            // If the error status is 409 (Conflict), it means user already exists
            if (error.response.status === 409) {
                return {
                    success: false,
                    message: 'User already exists!'
                };
            }

            return {
                success: false,
                message: error.response.data?.message || `Registration failed with status ${error.response.status}.`
            };
        } else if (error.request) {
            // The request was made but no response was received
            return {
                success: false,
                message: 'No response received from server. Please try again later.'
            };
        } else {
            // Something happened in setting up the request that triggered an Error
            return {
                success: false,
                message: `Error: ${error.message}`
            };
        }
    }
}
