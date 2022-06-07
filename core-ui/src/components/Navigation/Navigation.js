import React from 'react';
import { List } from 'fundamental-react';
import { useLocation, NavLink } from 'react-router-dom';

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
  const pathName = useLocation().pathname;

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
          {nav.children?.map(child => {
            const cluster = pathName
              .split('/')
              ?.slice(0, 3)
              ?.join('/');
            //change namespace as well
            const path = `${cluster}/${child.path}`;
            return (
              <List.Item key={`${nav.name}-${child.label}`}>
                <NavLink to={path}>{child.label}</NavLink>
              </List.Item>
            );
          })}
        </List>
      ))}
    </div>
  );
}
