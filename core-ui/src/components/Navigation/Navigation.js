import React from 'react';
import { List } from 'fundamental-react';

import { resourcesData } from 'resources';
import { otherResourcesData } from 'resources/other';

import './Navigation.scss';

const createNavigationStructure = (routes, namespaced) => {
  let categories = [];
  routes?.map(route => {
    if (!route?.navData?.category) return null;
    if (route?.namespaced !== namespaced) return null;
    const matchingIndex = categories?.findIndex(
      category => category?.name === route?.navData?.category,
    );
    if (matchingIndex >= 0) {
      const matchingCategory = categories?.[matchingIndex];
      const newCategory = {
        ...matchingCategory,
        children: [
          ...matchingCategory?.children,
          { label: route?.navData?.label, ...route },
        ],
      };
      categories[matchingIndex] = newCategory;
    } else {
      categories = [
        ...categories,
        {
          name: route?.navData?.category,
          children: [{ label: route?.navData?.label, ...route }],
        },
      ];
    }
    return null;
  });
  return categories.filter(c => c);
};

export function Navigation() {
  const pathName = window.location.pathname;
  console.log(window.location);

  if (pathName === '/clusters' || pathName === '/clusters/') {
    return null;
  }
  // const allRoutes = [...resourceRoutes?.props?.children || [], ...otherRoutes?.props?.children || []];
  const navStructure = createNavigationStructure(
    resourcesData,
    !!pathName.includes('/namespaces/'),
  );

  return (
    <div>
      {navStructure?.map(nav => (
        <List header={nav.name} key={nav.name} navigation>
          {nav.children?.map(child => (
            <List.Item url={child.path} key={`${nav.name}-${child.label}`}>
              <List.Text>{child.label}</List.Text>
            </List.Item>
          ))}
        </List>
      ))}
    </div>
  );
}
