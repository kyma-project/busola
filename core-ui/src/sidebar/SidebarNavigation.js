import React from 'react';
// import { useRecoilValueLoadable } from 'recoil';
// import { sidebarNavigationNodesSelector } from 'state/navigation/sidebarNavigationNodesSelector';

export const SidebarNavigation = () => {
  // const navigationNodes = useRecoilValueLoadable(sidebarNavigationNodesSelector);

  return <></>;

  // switch (navigationNodes.state) {
  //   case 'hasValue':
  //     return (
  //       <nav>
  //         <p>{JSON.stringify(navigationNodes.contents)}</p>
  //         <br />
  //         <br />
  //         <br />
  //         <br />
  //         {navigationNodes.contents.map(value => (
  //           <p key={value.key}>
  //             {value.key}: {value.items.length} {'->'}{' '}
  //             {value.items.map(v => v.resourceType).join(', ')}
  //           </p>
  //         ))}
  //       </nav>
  //     );
  //   case 'loading':
  //     return <div>Loading...</div>;
  //   case 'hasError':
  //   default:
  //     throw navigationNodes.contents;
  // }
};
