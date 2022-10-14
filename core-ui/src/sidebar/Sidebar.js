import React from 'react';
import { useCreateNavigation } from 'sidebar/useCreateNavigation';

export const Sidebar = () => {
  useCreateNavigation();

  return <div>Sidebar</div>;
};
