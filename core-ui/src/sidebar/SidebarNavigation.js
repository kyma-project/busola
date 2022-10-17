import React from 'react';
import { useFilterNavList } from 'sidebar/useFilterNavList';

export const SidebarNavigation = () => {
  const { filteredNavList } = useFilterNavList();

  return <nav>{JSON.stringify(filteredNavList)}</nav>;
};
