'use client';

import React from 'react';

const LiveSearchSkeleton = ({ itemCount = 7 }) => {
  // Create an array of the specified length to map over
  const items = Array.from({ length: itemCount }, (_, i) => i);

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-[#1E1E1E] to-[#121212] rounded-lg border border-purple-600/20 shadow-lg z-500">
      {/* Ambient background elements for the skeleton */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-600 opacity-5 rounded-full blur-xl"></div>
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-600 opacity-5 rounded-full blur-xl"></div>

      <ul className="divide-y divide-gray-700/30 relative z-10">
        {items.map((index) => (
          <li key={index} className="py-2 px-4 animate-pulse">
            <div className="flex items-center">
              {/* Image skeleton */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-gray-700 to-gray-800"></div>
              </div>

              {/* Content skeleton */}
              <div className="ml-3 flex-1">
                {/* Title skeleton */}
                <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded w-3/4 mb-2"></div>

                {/* Platform skeleton */}
                <div className="h-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded w-1/3"></div>
              </div>
            </div>
          </li>
        ))}

        {/* View all results skeleton */}
        <li className="py-2 px-4 bg-black/30">
          <div className="h-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded w-1/2 mx-auto"></div>
        </li>
      </ul>
    </div>
  );
};

export default LiveSearchSkeleton;
