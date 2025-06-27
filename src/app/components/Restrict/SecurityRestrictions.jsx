'use client';

import { useEffect } from 'react';

/**
 * Component that implements security restrictions for non-admin users:
 * - Disables right-click context menu
 * - Prevents access to developer tools (inspect element)
 * - Blocks keyboard shortcuts for developer tools
 * - Detects if developer tools are open
 *
 * IMPORTANT: This component MUST only run on the client side.
 * It uses browser APIs that are not available during server-side rendering.
 */
const SecurityRestrictions = () => {
  // Use a ref to track if the component is mounted
  // This avoids React hydration issues with useState
  const hasMounted = typeof window !== 'undefined' ? { current: false } : null;

  // Initialize the component on the client side
  useEffect(() => {
    // This effect only runs once on the client side
    if (typeof window === 'undefined' || !hasMounted) return;
    hasMounted.current = true;

    // Check if user is admin
    try {
      const userRole = localStorage.getItem('role');

      // If user is admin, don't apply any restrictions
      if (userRole === 'ADMIN') return;
    } catch (e) {
      // Handle any localStorage errors
      console.error('Error accessing localStorage:', e);
      return;
    }

    // Function to detect if DevTools is open
    function isDevToolsOpen() {
      const threshold = 160;
      const devToolsOpened =
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold;
      return devToolsOpened;
    }

    // Monitor DevTools and show console error if detected
    const monitorDevTools = () => {
      if (isDevToolsOpen()) {
        console.error("Failed to load resource: net::ERR_BLOCKED_BY_CLIENT");
      }
    };

    // Check periodically (every 10 seconds)
    const interval = setInterval(() => {
      monitorDevTools();
    }, 10000);

    // Cleanup function
    return () => clearInterval(interval);
  }, []);

  // Second useEffect: Block console input and keyboard shortcuts
  useEffect(() => {
    // Only run on client side after mounting
    if (!hasMounted) return;

    // Check if user is admin
    try {
      const userRole = localStorage.getItem('role');

      // If user is admin, don't apply any restrictions
      if (userRole === 'ADMIN') return;
    } catch (e) {
      // Handle any localStorage errors
      console.error('Error accessing localStorage:', e);
      return;
    }

    const blockConsoleInput = () => {
      // Store original console methods
      const originalConsoleLog = console.log;
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;
      const originalConsoleDebug = console.debug;

      // Override console methods
      console.log = function () { };
      console.warn = function () { };
      console.error = function () { };
      console.debug = function () { };

      // Block keyboard shortcuts for developer tools
      const preventKeyPress = (e) => {
        if (
          (e.key === 'F12') ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i')) ||
          (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i')) ||
          ((e.key === 'J' || e.key === 'j') && (e.ctrlKey || e.metaKey) && e.shiftKey)
        ) {
          e.preventDefault();
        }
      };

      // Prevent right-click context menu
      const preventRightClick = (e) => {
        e.preventDefault();
      };

      // Add event listeners
      document.addEventListener('keydown', preventKeyPress);
      document.addEventListener('contextmenu', preventRightClick);

      // Check for DevTools periodically
      const checkDevTools = () => {
        const devToolsOpen =
          window.outerWidth - window.innerWidth > 200 ||
          window.outerHeight - window.innerHeight > 200;

        if (devToolsOpen) {
          // Just show an alert instead of replacing the entire page
          alert('Developer tools are not allowed on this site.');
        }
      };

      // Check every 2 seconds
      const interval = setInterval(checkDevTools, 2000);

      // Return cleanup function
      return () => {
        clearInterval(interval);
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
        console.debug = originalConsoleDebug;
        document.removeEventListener('keydown', preventKeyPress);
        document.removeEventListener('contextmenu', preventRightClick);
      };
    };

    // Start blocking console input
    const cleanup = blockConsoleInput();

    // Return cleanup function
    return cleanup;
  }, []);

  // Third useEffect: Additional protections that won't break the page
  useEffect(() => {
    // Only run on client side after mounting
    if (!hasMounted) return;

    // Check if user is admin
    try {
      const userRole = localStorage.getItem('role');

      // If user is admin, don't apply any restrictions
      if (userRole === 'ADMIN') return;
    } catch (e) {
      // Handle any localStorage errors
      console.error('Error accessing localStorage:', e);
      return;
    }

    // Disable source viewing
    const disableSourceViewing = () => {
      document.addEventListener('keydown', function (e) {
        // Ctrl+U / Cmd+U (View Source)
        if ((e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
          (e.metaKey && (e.key === 'u' || e.key === 'U'))) {
          e.preventDefault();
          return false;
        }
      });
    };

    // Disable selection and copy (optional - uncomment if needed)
    const disableSelectionAndCopy = () => {
      // Add CSS to disable selection
      const style = document.createElement('style');
      style.textContent = `
        .protected-content {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `;
      document.head.appendChild(style);

      // Return cleanup function
      return () => {
        document.head.removeChild(style);
      };
    };

    // Apply protections
    disableSourceViewing();
    const cleanupSelectionDisable = disableSelectionAndCopy();

    // Return cleanup function
    return () => {
      if (cleanupSelectionDisable) cleanupSelectionDisable();
    };
  }, []);

  // Special check to ensure this component only runs on the client side
  // This prevents server-side rendering errors with useContext
  if (typeof window === 'undefined') {
    return null;
  }

  // This component doesn't render anything visible
  return null;
};

export default SecurityRestrictions;
