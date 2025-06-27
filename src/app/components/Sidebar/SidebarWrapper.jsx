'use client';

import React from 'react';
import Sidebar from './Sidebar';

// This wrapper is needed because Sidebar is a client component
// and we need to include it in the server-side layout
const SidebarWrapper = () => {
  return <Sidebar />;
};

export default SidebarWrapper;
