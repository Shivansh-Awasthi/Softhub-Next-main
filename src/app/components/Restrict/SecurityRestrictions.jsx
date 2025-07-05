'use client';

import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';

const SecurityRestrictions = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user info and determine if user is admin
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const xAuthToken = process.env.NEXT_PUBLIC_API_TOKEN;

        if (!token) {
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        if (xAuthToken) headers['X-Auth-Token'] = xAuthToken;

        try {
          const res = await axios.get(
            process.env.NEXT_PUBLIC_API_URL + '/api/user/me',
            { headers }
          );

          const role = res.data?.user?.role;
          if (role === 'ADMIN') {
            setIsAdmin(true);
          }

        } catch (apiError) {
          // Fallback to decoding token
          try {
            const decoded = jwtDecode(token);
            const role = decoded?.role;

            if (role === 'ADMIN') {
              setIsAdmin(true);
            }
          } catch (decodeError) {
            console.error('Token decode failed:', decodeError);
          }
        }
      } catch (err) {
        console.error('User fetch failed:', err);
      }
    };

    fetchUser();
  }, []);

  // Apply restrictions for non-admin users
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isAdmin) return;

    console.log('Non-admin user detected. Applying security restrictions.');

    // Save original console methods
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    const originalConsoleDebug = console.debug;

    // Disable console output
    console.log = () => { };
    console.warn = () => { };
    console.error = () => { };
    console.debug = () => { };

    // Disable right-click
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);

    // Block DevTools shortcuts
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.metaKey && e.altKey && e.key.toLowerCase() === 'i') ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u')
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Block user selection and copy
    const style = document.createElement('style');
    style.textContent = `
      body {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);

    // Detect DevTools via window size diff
    const detectDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > threshold || heightDiff > threshold) {
        alert('Developer tools are not allowed on this site.');
      }
    };
    const devToolsInterval = setInterval(detectDevTools, 2000);

    // Cleanup on unmount
    return () => {
      clearInterval(devToolsInterval);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.head.removeChild(style);
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
      console.debug = originalConsoleDebug;
    };
  }, [isAdmin]);

  // Client-only component; doesn't render anything
  return null;
};

export default SecurityRestrictions;
