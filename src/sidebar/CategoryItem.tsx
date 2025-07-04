import React from 'react';
import { useTranslation } from 'react-i18next';
import { SetterOrUpdater, useRecoilValue } from 'recoil';
import { Category } from 'state/navigation/categories';
import { SideNavigationItem, Ui5CustomEvent } from '@ui5/webcomponents-react';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';

import { ExpandedCategories } from 'state/navigation/expandedCategories/expandedCategoriesAtom';
import { NavItem } from './NavItem';
import {
  DataSources,
  DataSourcesContextProvider,
} from 'components/Extensibility/contexts/DataSources';
import { cloneDeep } from 'lodash';

type CategoryItemProps = {
  category: Category;
  expandedCategories: string[];
  handleExpandedCategories: SetterOrUpdater<ExpandedCategories>;
};

export function CategoryItem({
  category,
  expandedCategories,
  handleExpandedCategories,
}: CategoryItemProps) {
  const { t } = useTranslation();
  const categoryName = t(category.label, { defaultValue: category.label });
  const expanded = expandedCategories.includes(category.key);
  const isSidebarCondensed = useRecoilValue(isSidebarCondensedState);

  const handleAddExpandedCategory = (e: Ui5CustomEvent) => {
    e.preventDefault();

    if (!isSidebarCondensed) {
      if (categoryName === e.target.parentElement?.getAttribute('text')) {
        return;
      } else if (expanded) {
        handleExpandedCategories(
          expandedCategories.filter(el => el !== category.key),
        );
      } else {
        handleExpandedCategories([...expandedCategories, category.key]);
      }
    }
  };

  const handleEmptyNamespace = (dataSources: DataSources) => {
    // Some data is available only on a certain namespace. If we don't have a given namespace, we can still get it on all namespaces.
    let clonedDataSources = cloneDeep(dataSources);
    Object.keys(clonedDataSources).forEach(key => {
      if (clonedDataSources?.[key]?.resource) {
        clonedDataSources[key].resource = {
          ...clonedDataSources[key]?.resource,
          namespace: clonedDataSources[key]?.resource?.namespace ?? '-all-',
        };
      }
    });
    return clonedDataSources;
  };

  const children = category.items?.map((nn, index) => (
    <React.Fragment key={`${nn.pathSegment}-${index}`}>
      {nn.dataSources ? (
        <DataSourcesContextProvider
          dataSources={handleEmptyNamespace(nn.dataSources)}
        >
          <NavItem node={nn} key={nn.pathSegment} subItem={true} />
        </DataSourcesContextProvider>
      ) : (
        <NavItem node={nn} key={nn.pathSegment} subItem={true} />
      )}
    </React.Fragment>
  ));

  return (
    <SideNavigationItem
      unselectable
      key={expanded + category.key}
      expanded={expanded}
      selected={false}
      icon={category.icon}
      text={categoryName}
      onClick={handleAddExpandedCategory}
    >
      {children}
    </SideNavigationItem>
  );
}
