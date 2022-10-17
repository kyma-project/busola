import React from 'react';
import { useFilterNavList } from 'sidebar/useFilterNavList';

export const SidebarNavigation = () => {
  const { filteredNavList } = useFilterNavList();

  //missing on NS
  //custom resources
  //helm releases   ??
  //overview
  //back to cluster details

  //missing on cluster
  //custom resources
  //extensions
  //cluster details

  // on limited view destination rules   // swap with EXT

  return (
    <nav>
      <p>{JSON.stringify(filteredNavList)}</p>
      <br />
      <br />
      <br />
      <br />
      {Object.entries(filteredNavList || {})?.map(([key, value]) => (
        <p>
          {key}: {value.length} {'->'}{' '}
          {value.map(v => v.resourceType).join(', ')}
        </p>
      ))}
    </nav>
  );
};
