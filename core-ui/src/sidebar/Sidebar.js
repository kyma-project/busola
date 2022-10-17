import React from 'react';
import { useFilterNavList } from 'sidebar/useFilterNavList';

export const Sidebar = () => {
  const { filteredNavList } = useFilterNavList();

  return <div>{JSON.stringify(filteredNavList)}</div>;
};
