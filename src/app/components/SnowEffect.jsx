'use client';

import { useEffect } from 'react';

/**
 * A simple snow effect component that creates snowflakes on the page
 * @param {Object} props Component props
 * @param {number} props.count Number of snowflakes to create (default: 50)
 * @param {boolean} props.startAfterSidebar Whether to start the snow after the sidebar (default: true)
 * @returns {null} This component doesn't render any visible elements directly
 */
export default function SnowEffect({ count = 50, startAfterSidebar = true }) {
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Create a reference to the container that we can use in cleanup
    let snowContainer = null;

    // Function to safely create the snow container
    const createSnowContainer = () => {
      // Check if we already have a snow container
      const existingContainer = document.querySelector('.let-it-snow');
      if (existingContainer) {
        // If it exists, remove it first to prevent duplicates
        try {
          existingContainer.parentNode.removeChild(existingContainer);
        } catch (e) {
          // Ignore errors if it's already been removed
        }
      }

      // Create a new container
      snowContainer = document.createElement('div');
      snowContainer.className = 'let-it-snow';

      // If startAfterSidebar is true, adjust the container position
      if (startAfterSidebar) {
        snowContainer.style.left = '240px'; // Sidebar width
        snowContainer.style.width = 'calc(100% - 240px)';
      }

      // Add to document
      document.body.appendChild(snowContainer);

      return snowContainer;
    };

    // Create the container
    const container = createSnowContainer();

    // Create snowflakes
    for (let i = 0; i < count; i++) {
      createSnowflake(container);
    }

    // Cleanup function
    return () => {
      // Use a more robust cleanup approach
      try {
        // First try to find the container in the DOM (in case it was moved)
        const containerInDOM = document.querySelector('.let-it-snow');
        if (containerInDOM) {
          containerInDOM.remove(); // Use the modern .remove() method
        } else if (snowContainer) {
          // Fallback to our reference if we still have it
          snowContainer.remove();
        }
      } catch (error) {
        console.log('Error cleaning up snow effect:', error);
      }
    };
  }, [count, startAfterSidebar]);

  return null;
}

/**
 * Creates a single snowflake element and adds it to the container
 * @param {HTMLElement} container - The container to add the snowflake to
 */
function createSnowflake(container) {
  // Safety check - if container is not valid, don't proceed
  if (!container || !container.appendChild) {
    console.log('Invalid container for snowflake');
    return;
  }

  try {
    // Create snowflake element
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';

    // Simpler approach - just use a dot character for all snowflakes
    // This avoids potential issues with special characters
    snowflake.innerHTML = '•';

    // Set random properties
    const size = Math.random() * 0.8 + 0.2; // Size between 0.2 and 1.0
    const startPositionX = Math.random() * 100; // Random horizontal position
    const fallDuration = Math.random() * 10 + 5; // Fall duration between 5-15s
    const shakeDuration = Math.random() * 5 + 2; // Shake duration between 2-7s
    const shakeDelay = Math.random() * 2; // Random delay for shake animation
    const fallDelay = Math.random() * 5; // Random delay for fall animation

    // Apply styles directly without trying to create custom animations
    // This is more reliable and less likely to cause errors
    Object.assign(snowflake.style, {
      opacity: Math.random() * 0.7 + 0.3, // Opacity between 0.3 and 1.0
      fontSize: `${Math.floor(15 * size)}px`,
      left: `${startPositionX}%`,
      animationDelay: `${fallDelay}s, ${shakeDelay}s`,
      animationDuration: `${fallDuration}s, ${shakeDuration}s`,
    });

    // Add to container
    container.appendChild(snowflake);
  } catch (error) {
    // Silently fail if there's an error creating a snowflake
    // This prevents the entire effect from breaking
    console.log('Error creating snowflake:', error);
  }
}
