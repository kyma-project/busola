import { SideNav } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { SetterOrUpdater } from 'recoil';
import { Category } from 'state/navigation/categories';
import { ExpandedCategoriesAtom } from 'state/navigation/expandedCategoriesAtom';
import { NavItem } from './NavItem';

type CategoryItemProps = {
  category: Category;
  expandedCategories: string[];
  handleExpandedCategories: SetterOrUpdater<ExpandedCategoriesAtom>;
};

export function CategoryItem({
  category,
  expandedCategories,
  handleExpandedCategories,
}: CategoryItemProps) {
  const { t } = useTranslation();
  // console.log(category);

  const handleAddExpandedCategory = () => {
    const wasExpanded = expandedCategories.includes(category.key);
    console.log(wasExpanded);
    let newExpandedCategories = [...expandedCategories];
    if (wasExpanded) {
      newExpandedCategories = newExpandedCategories.filter(
        el => el !== category.key,
      );
    } else {
      newExpandedCategories.push(category.key);
    }

    handleExpandedCategories(newExpandedCategories);
    console.log(expandedCategories, category.key);
  };

  return (
    <SideNav.ListItem
      key={category.key}
      expandSubmenuLabel={`Expand ${category.key || category.label} category`}
      id={category.key}
      name={t(category.label, { defaultValue: category.label })}
      url="#"
      glyph={category.icon}
      onClick={handleAddExpandedCategory}
      expanded={expandedCategories.includes(category.key)}
    >
      <SideNav.List level={2}>
        {category.items?.map(nn => (
          <NavItem node={nn} />
        ))}
      </SideNav.List>
    </SideNav.ListItem>
  );
}
