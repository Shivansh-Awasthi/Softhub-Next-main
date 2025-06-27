'use client';
import { jwtDecode } from 'jwt-decode';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginUser } from './actions';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef(null);
    const router = useRouter();

    const handleEmail = (e) => {
        setEmail(e.target.value);
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
    };

    // Handle form submission with server action
    const handleFormSubmit = async (formData) => {
        setIsSubmitting(true);

        try {
            // Call the server action
            const result = await loginUser(formData);

            if (result.success) {
                // Store user data in localStorage for client-side access

                if (typeof window !== 'undefined' && result.userData.token) {
                    localStorage.setItem('token', result.userData.token);

                    const decoded = jwtDecode(result.userData.token);

                    const user = {
                        id: decoded.userId,
                        email: decoded.email,
                        role: decoded.role,
                        avatar: decoded.avatar,
                        purchasedGames: decoded.purchasedGames
                    };
                }




                // Reset form fields
                setEmail('');
                setPassword('');

                // Show success toast
                toast.success(`${result.message} Redirecting to home...`, {
                    position: "top-right",
                    autoClose: 2000, // 2 seconds
                });

                // Redirect to home after 2 seconds
                setTimeout(() => {
                    router.push('/');
                    router.refresh(); // Refresh the page to update auth state
                }, 2000);
            } else {
                // Show error toast
                toast.error(result.message, {
                    position: "top-right",
                    autoClose: 3000, // 3 seconds
                });
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Something went wrong. Please try again.', {
                position: "top-right",
                autoClose: 3000, // 3 seconds
            });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl h-full mx-auto">
            <div className="bg-white shadow-md border border-gray-200 rounded-lg max-w-sm p-4 sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700">
                <form
                    ref={formRef}
                    className="space-y-6"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleFormSubmit(formData);
                    }}
                    action={async (formData) => {
                        // This is the recommended way to use server actions with forms
                        await handleFormSubmit(formData);
                    }}
                >
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3>

                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-900 block mb-2 dark:text-gray-300">Your email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            placeholder="email@company.com"
                            value={email}
                            onChange={handleEmail}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-900 block mb-2 dark:text-gray-300">Your password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            placeholder="••••••••"
                            value={password}
                            onChange={handlePassword}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Signing In...' : 'Login to your account'}
                    </button>

                    <div className="text-sm font-medium text-gray-500 dark:text-gray-300">
                        Not registered? <Link href="/signup" className="text-blue-700 hover:underline dark:text-blue-500">Create account</Link>
                    </div>
                </form>
            </div>
            {/* Toast Container for displaying toasts */}
            <ToastContainer />
        </div >
    );
};

export default LoginForm;
