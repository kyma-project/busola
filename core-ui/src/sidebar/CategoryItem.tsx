import { SideNav, Popover } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { SetterOrUpdater } from 'recoil';
import { Category } from 'state/navigation/categories';
import { ExpandedCategoriesAtom } from 'state/navigation/expandedCategoriesAtom';
import { NavItem } from './NavItem';
type CategoryItemProps = {
  category: Category;
  expandedCategories: string[];
  handleExpandedCategories: SetterOrUpdater<ExpandedCategoriesAtom>;
  isSidebarCondensed: boolean;
};

export function CategoryItem({
  category,
  expandedCategories,
  handleExpandedCategories,
  isSidebarCondensed,
}: CategoryItemProps) {
  const { t } = useTranslation();

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

  const CategoryWrapper = ({ children }: { children?: JSX.Element }) => {
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
        {children}
      </SideNav.ListItem>
    );
  };

  const children = (
    <SideNav.List level={2}>
      {category.items?.map(nn => (
        <NavItem node={nn} />
      ))}
    </SideNav.List>
  );

  // const Wrapper = ({ children }: { children: JSX.Element }) => {
  //   return isSidebarCondensed ? (
  //     <Popover body={children} control={<W />}>
  //       {children}
  //     </Popover>
  //   ) : (
  //     <W>{children}</W>
  //   );
  // };

  return isSidebarCondensed ? (
    <Popover
      body={<div>xdd</div>}
      control={<CategoryWrapper>{children}</CategoryWrapper>}
      placement="right-end"
      noArrow={false}
    />
  ) : (
    <CategoryWrapper>{children}</CategoryWrapper>
  );
}
