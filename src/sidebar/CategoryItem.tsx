import { useTranslation } from 'react-i18next';
import { SetterOrUpdater, useRecoilValue } from 'recoil';
import { Category } from 'state/navigation/categories';
import { SideNavigationItem, Ui5CustomEvent } from '@ui5/webcomponents-react';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';

import { ExpandedCategories } from 'state/navigation/expandedCategories/expandedCategoriesAtom';
import { NavItem } from './NavItem';
import { DataSourcesContextProvider } from 'components/Extensibility/contexts/DataSources';

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
      } else if (expanded) {
        handleExpandedCategories(
          expandedCategories.filter(el => el !== category.key),
        );
      } else {
        handleExpandedCategories([...expandedCategories, category.key]);
      }
    }
  };

  const children = category.items?.map(nn => (
    <>
      {nn.dataSources ? (
        <DataSourcesContextProvider dataSources={nn.dataSources}>
          <NavItem node={nn} key={nn.pathSegment} subItem={true} />
        </DataSourcesContextProvider>
      ) : (
        <NavItem node={nn} key={nn.pathSegment} subItem={true} />
      )}
    </>
  ));

  return (
    <SideNavigationItem
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
