'use client';

import React from 'react';
import LiveSearch from './LiveSearch';

const LiveSearchWrapper = () => {
  return (
    <div className="flex flex-wrap items-center justify-between px-1.5 pb-6">
      <LiveSearch />
    </div>
  );
};

export default LiveSearchWrapper;
