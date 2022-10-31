import { SideNav } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { isEqual } from 'lodash';
import { memo, useCallback } from 'react';
import { SetterOrUpdater } from 'recoil';
import { Category } from 'state/navigation/categories';
import { ExpandedCategoriesAtom } from 'state/navigation/expandedCategoriesAtom';
import { MemoizedNavItem } from './NavItem';

export function CategoryItem({
  category,
  expandedCategories,
  handleExpandedCategories,
}: {
  category: Category;
  expandedCategories: string[];
  handleExpandedCategories: SetterOrUpdater<ExpandedCategoriesAtom>;
}) {
  const { t } = useTranslation();
  console.log(category);

  const handleAddExpandedCategory = useCallback(() => {
    const wasExpanded = expandedCategories.includes(category.key);
    let newExpandedCategories = [...expandedCategories];
    if (wasExpanded) {
      newExpandedCategories = newExpandedCategories?.filter(
        el => el !== category.key,
      );
    } else {
      newExpandedCategories.push(category.key);
    }
    handleExpandedCategories(newExpandedCategories);
  }, [expandedCategories, category.key, handleExpandedCategories]);

  return (
    <SideNav.ListItem
      key={category.key}
      expandSubmenuLabel={`Expand ${category.key || category.label} category`}
      id={category.key}
      name={t(category.label, { defaultValue: category.label })}
      url="#"
      glyph={category.icon || 'customize'}
      expanded={expandedCategories.includes(category.key)}
      onItemSelect={handleAddExpandedCategory}
    >
      <SideNav.List level={2}>
        {category.items?.map(nn => (
          <MemoizedNavItem node={nn} />
        ))}
      </SideNav.List>
    </SideNav.ListItem>
  );
}

const areCategoriesEqual = (prevCategory: any, nextCategory: any) => {
  // console.log('rowne', isEqual(prevCategory, nextCategory));
  // const isThisCategoryExpanded =
  //   prevCategory.expandedCategories.includes(nextCategory.category.key) &&
  //   nextCategory.expandedCategories.includes(prevCategory.category.key);

  return isEqual(prevCategory.category, nextCategory.category);
  // isThisCategoryExpanded
};

export const MemoizedCategory = memo(CategoryItem, areCategoriesEqual);
