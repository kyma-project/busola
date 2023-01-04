import { NavNode } from '../types';
import { CATEGORIES, Category, PredefinedCategories } from './categories';
import { cloneDeep } from 'lodash';

export const assignNodesToCategories = (navList: NavNode[]): Category[] => {
  const categories = cloneDeep(CATEGORIES);
  navList.forEach(node => {
    if (node.topLevelNode) {
      categories.unshift({
        topLevelNode: true,
        key: '' as PredefinedCategories,
        label: '',
        icon: node.icon || 'customize',
        items: [node],
      });
      return;
    }

    const existingCategory = categories.find(
      category => category.key === node.category,
    );

    if (existingCategory) {
      existingCategory.items.push(node);
    } else {
      const { icon, ...childNode } = node;
      categories.push({
        key: node.category as PredefinedCategories,
        label: node.category || node.label,
        icon: node.icon || 'customize',
        items: [childNode],
      });
    }
  });

  return categories;
};
