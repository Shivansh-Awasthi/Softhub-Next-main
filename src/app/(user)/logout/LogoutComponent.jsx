'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LogoutComponent = () => {
    const router = useRouter();

    useEffect(() => {
        // Function to handle logout
        const handleLogout = () => {
            try {
                // Clear all localStorage items related to authentication
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('name');
                    localStorage.removeItem('gData');
                    localStorage.removeItem('role');
                    localStorage.removeItem('userId');
                }

                // Show success toast
                toast.success('Logged out successfully! Redirecting to home...', {
                    position: 'top-right',
                    autoClose: 2000,
                });

                // Redirect to home page after 2 seconds
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } catch (error) {
                console.error('Logout error:', error);
                
                // Show error toast
                toast.error('Error logging out. Please try again.', {
                    position: 'top-right',
                    autoClose: 3000,
                });
                
                // Redirect to home page after 3 seconds even if there's an error
                setTimeout(() => {
                    router.push('/');
                }, 3000);
            }
        };

        // Call the logout function when component mounts
        handleLogout();
    }, [router]);

    return (
        <div className="max-w-xl h-full mx-auto text-center">
            <div className="bg-white shadow-md border border-gray-200 rounded-lg max-w-sm p-6 sm:p-8 mx-auto dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Logging Out</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Please wait while we log you out...</p>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default LogoutComponent;
