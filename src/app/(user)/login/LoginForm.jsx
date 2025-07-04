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
                    window.location.href = '/'; // Use location.href to force navigation to home
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-[8px] transition-all min-h-screen">
            <div className="w-full h-full mx-auto flex items-center justify-center">
                <div className="relative overflow-hidden backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-w-md w-full p-0">
                    {/* Top Border Gradient */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500" />
                    <div className="p-8 sm:p-10">
                        <form
                            ref={formRef}
                            className="space-y-7"
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                handleFormSubmit(formData);
                            }}
                            action={async (formData) => {
                                await handleFormSubmit(formData);
                            }}
                        >
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">Sign in to your account</h3>
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-900 block mb-2 dark:text-gray-300">Your email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    className="bg-gray-50 border border-gray-200 dark:border-gray-700 text-gray-900 sm:text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-800 dark:text-white transition-all duration-200 shadow-sm"
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
                                    className="bg-gray-50 border border-gray-200 dark:border-gray-700 text-gray-900 sm:text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-3 dark:bg-gray-800 dark:text-white transition-all duration-200 shadow-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={handlePassword}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Signing In...' : 'Login to your account'}
                            </button>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-300 text-center mt-4">
                                Not registered? <Link href="/signup" className="text-blue-700 hover:underline dark:text-blue-400">Create account</Link>
                            </div>
                        </form>
                    </div>
                </div>
                <ToastContainer />
            </div>
        </div>
    );
};

export default LoginForm;
