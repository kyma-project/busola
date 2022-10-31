import { SideNav } from 'fundamental-react';
import { isEqual } from 'lodash';
import { memo, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { Category } from 'state/navigation/categories';
import { expandedCategoriesState } from 'state/navigation/expandedCategoriesAtom';
// import { useHasTranslations } from './helpers';
import { MemoizedNavItem } from './NavItem';

export function CategoryItem({ category, ...rest }: { category: Category }) {
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesState,
  );
  console.log(category);
  // const hasTranslations = useHasTranslations();

  const handleAddExpandedCategory = useCallback(() => {
    //@ts-ignore
    const wasExpanded = expandedCategories.includes(category.key);
    let newExpandedCategories = [...expandedCategories];
    if (wasExpanded) {
      newExpandedCategories = newExpandedCategories?.filter(
        el => el !== category.key,
      );
    } else {
      newExpandedCategories.push(category.key);
    }
    setExpandedCategories(newExpandedCategories);
  }, [expandedCategories, category.key, setExpandedCategories]);

  return (
    <SideNav.ListItem
      key={category.key}
      expandSubmenuLabel={`Expand ${category.key || category.label} category`}
      id={category.key}
      // name={hasTranslations(category.key || category.label)}
      name={category.label}
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
  return isEqual(prevCategory, nextCategory);
};

export const MemoizedCategory = memo(CategoryItem, areCategoriesEqual);
