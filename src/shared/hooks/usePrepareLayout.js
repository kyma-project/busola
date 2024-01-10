import { useFeature } from 'hooks/useFeature';

const switchToNextLayout = layout => {
  switch (layout) {
    case 'StartColumn':
      return '?layout=TwoColumnsMidExpanded';
    case 'MidColumn':
    case 'EndColumn':
    default:
      return '?layout=ThreeColumnsEndExpanded';
  }
};

export function usePrepareNextLayout(layoutNumber) {
  const { isEnabled: isColumnLeyoutEnabled } = useFeature('COLUMN_LAYOUT');

  if (!isColumnLeyoutEnabled) {
    return '';
  }

  if (layoutNumber) {
    return switchToNextLayout(layoutNumber);
  }

  return '';
}
