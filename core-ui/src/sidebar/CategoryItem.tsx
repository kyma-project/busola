import { SideNav, Popover, Icon } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { SetterOrUpdater } from 'recoil';
import { Category } from 'state/navigation/categories';
import { ExpandedCategories } from 'state/navigation/expandedCategories/expandedCategoriesAtom';
import { NavItem } from './NavItem';
import './CategoryItem.scss';

type CategoryItemProps = {
  category: Category;
  expandedCategories: string[];
  handleExpandedCategories: SetterOrUpdater<ExpandedCategories>;
  isSidebarCondensed: boolean;
};

export function CategoryItem({
  category,
  expandedCategories,
  handleExpandedCategories,
  isSidebarCondensed,
}: CategoryItemProps) {
  const { t } = useTranslation();
  const categoryName = t(category.label, { defaultValue: category.label });

  const handleAddExpandedCategory = () => {
    const wasExpanded = expandedCategories.includes(category.key);
    let newExpandedCategories = [...expandedCategories];
    if (wasExpanded) {
      newExpandedCategories = newExpandedCategories.filter(
        el => el !== category.key,
      );
    } else {
      newExpandedCategories.push(category.key);
    }

    handleExpandedCategories(newExpandedCategories);
  };

  const children = (
    <SideNav.List level={2}>
      {category.items?.map(nn => (
        <NavItem node={nn} key={nn.pathSegment} />
      ))}
    </SideNav.List>
  );

  const expanded = expandedCategories.includes(category.key);

  return isSidebarCondensed ? (
    <li className="fd-nested-list__item condensed-item">
      <Popover
        body={
          <>
            <p>{categoryName}</p>
            {children}
          </>
        }
        control={
          <Icon glyph={category.icon} className="fd-nested-list__icon" />
        }
        placement="right-start"
      />
    </li>
  ) : (
    <SideNav.ListItem
      key={expanded + category.key}
      expandSubmenuLabel={`Expand ${categoryName} category`}
      id={category.key}
      name={categoryName}
      url="#"
      glyph={category.icon}
      onClick={handleAddExpandedCategory}
      expanded={expanded}
    >
      {children}
    </SideNav.ListItem>
  );
}
