import React from 'react';
import { useCreateCompleteNavList } from 'sidebar/useCreateCompleteNavList';
import { useFilterNavList } from 'sidebar/useFilterNavList';

export const Sidebar = () => {
  const { completeNavList } = useCreateCompleteNavList();
  const { filteredNavList } = useFilterNavList(completeNavList);

  return <div>{JSON.stringify(filteredNavList)}</div>;
};
