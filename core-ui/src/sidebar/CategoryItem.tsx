import { SideNav } from 'fundamental-react';
import { useRecoilState } from 'recoil';
import { Category } from 'state/navigation/categories';
import { expandedCategoriesState } from 'state/navigation/expandedCategoriesAtom';
import { useHasTranslations } from './helpers';
import { NavItem } from './NavItem';

export function CategoryItem({ category }: { category: Category }) {
  const [expandedCategories, setExpandedCategories] = useRecoilState(
    expandedCategoriesState,
  );

  const hasTranslations = useHasTranslations();

  const handleAddExpandedCategory = () => {
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
  };

  return (
    <SideNav.ListItem
      key={category.key}
      expandSubmenuLabel={`Expand ${category.key || category.label} category`}
      id={category.key}
      name={hasTranslations(category.key || category.label)}
      url="#"
      glyph={category.icon || 'customize'}
      expanded={expandedCategories.includes(category.key)}
      onClick={handleAddExpandedCategory}
    >
      <SideNav.List level={2}>
        {category.items?.map(nn => (
          <NavItem node={nn} />
        ))}
      </SideNav.List>
    </SideNav.ListItem>
  );
}
