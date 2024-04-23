import { useTranslation } from 'react-i18next';
import { SetterOrUpdater, useRecoilState, useRecoilValue } from 'recoil';
import { Category } from 'state/navigation/categories';
import { SideNavigationItem, Ui5CustomEvent } from '@ui5/webcomponents-react';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';

import { ExpandedCategories } from 'state/navigation/expandedCategories/expandedCategoriesAtom';
import { NavItem } from './NavItem';
import { isResourceEditedState } from 'state/resourceEditedAtom';

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
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );

  const handleAddExpandedCategory = (e: Ui5CustomEvent) => {
    e.preventDefault();

    if (isResourceEdited.isEdited) {
      setIsResourceEdited({ ...isResourceEdited, warningOpen: true });
      return;
    }

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
    <NavItem node={nn} key={nn.pathSegment} subItem={true} />
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
