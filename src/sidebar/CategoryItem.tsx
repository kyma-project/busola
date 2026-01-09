import React, { RefObject, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import { Category } from 'state/navigation/categories';
import {
  SideNavigationDomRef,
  SideNavigationItem,
  SideNavigationItemDomRef,
  Ui5CustomEvent,
} from '@ui5/webcomponents-react';
import { isSidebarCondensedAtom } from 'state/settings/isSidebarCondensedAtom';

import { ExpandedCategories } from 'state/navigation/expandedCategories/expandedCategoriesAtom';
import { NavItem } from './NavItem';
import {
  DataSources,
  DataSourcesContextProvider,
} from 'components/Extensibility/contexts/DataSources';
import { cloneDeep } from 'lodash';
import { SideNavigationItemClickEventDetail } from '@ui5/webcomponents-fiori/dist/SideNavigationItemBase';
import { useLocation } from 'react-router';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { clusterAtom } from 'state/clusterAtom';

type CategoryItemProps = {
  category: Category;
  expandedCategories: string[];
  handleExpandedCategories: (_newValue: ExpandedCategories) => void;
  sidebarRef: RefObject<SideNavigationDomRef & { closePicker: () => void }>;
};

export function CategoryItem({
  category,
  expandedCategories,
  handleExpandedCategories,
  sidebarRef,
}: CategoryItemProps) {
  const { t } = useTranslation();
  const categoryName = t(category.label, { defaultValue: category.label });
  const isSidebarCondensed = useAtomValue(isSidebarCondensedAtom);
  const namespaceId = useAtomValue(activeNamespaceIdAtom);
  const cluster = useAtomValue(clusterAtom);
  const location = useLocation();

  const checkIsSelected = useCallback(
    (node: any) => {
      if (node.externalUrl) return false;
      const namespacePart = namespaceId ? `/namespaces/${namespaceId}/` : '/';
      const resourcePart = location.pathname.replace(
        `/cluster/${cluster?.name}${namespacePart}`,
        '',
      );

      const pathSegment = resourcePart.split('/')?.[0];

      return pathSegment === node.pathSegment;
    },
    [namespaceId, cluster?.name, location.pathname],
  );

  const isAnyChildSelected = useMemo(() => {
    return category.items?.some((nn) => checkIsSelected(nn)) ?? false;
  }, [category.items, checkIsSelected]);

  const isExpanded =
    expandedCategories.includes(category.key) || isAnyChildSelected;

  const handleAddExpandedCategory = (
    e: Ui5CustomEvent<
      SideNavigationItemDomRef,
      SideNavigationItemClickEventDetail
    >,
  ) => {
    e.preventDefault();

    if (!isSidebarCondensed) {
      if (categoryName === e.target.parentElement?.getAttribute('text')) {
        return;
      } else if (isExpanded) {
        handleExpandedCategories(
          expandedCategories.filter((el) => el !== category.key),
        );
      } else {
        handleExpandedCategories([...expandedCategories, category.key]);
      }
    }
  };

  const handleEmptyNamespace = (dataSources: DataSources) => {
    // Some data is available only on a certain namespace. If we don't have a given namespace, we can still get it on all namespaces.
    const clonedDataSources = cloneDeep(dataSources);
    Object.keys(clonedDataSources).forEach((key) => {
      if (clonedDataSources?.[key]?.resource) {
        clonedDataSources[key].resource = {
          ...clonedDataSources[key]?.resource,
          namespace: clonedDataSources[key]?.resource?.namespace ?? '-all-',
        };
      }
    });
    return clonedDataSources;
  };

  const children = category.items?.map((nn, index) => {
    const isNodeSelected = checkIsSelected(nn);

    return (
      <React.Fragment key={`${nn.pathSegment}-${index}`}>
        {nn.dataSources ? (
          <DataSourcesContextProvider
            dataSources={handleEmptyNamespace(nn.dataSources)}
          >
            <NavItem
              node={nn}
              key={nn.pathSegment}
              subItem={true}
              sidebarRef={sidebarRef}
              isSelected={isNodeSelected}
            />
          </DataSourcesContextProvider>
        ) : (
          <NavItem
            node={nn}
            key={nn.pathSegment}
            subItem={true}
            sidebarRef={sidebarRef}
            isSelected={isNodeSelected}
          />
        )}
      </React.Fragment>
    );
  });

  return (
    <SideNavigationItem
      unselectable
      key={isExpanded + category.key}
      expanded={isExpanded}
      selected={false}
      icon={category.icon}
      text={categoryName}
      onClick={handleAddExpandedCategory}
    >
      {children}
    </SideNavigationItem>
  );
}
