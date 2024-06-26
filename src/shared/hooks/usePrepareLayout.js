const switchToPrevLayout = layout => {
  switch (layout) {
    case 'EndColumn':
      return 'TwoColumnsMidExpanded';
    case 'MidColumn':
    case 'StartColumn':
    default: {
      return 'OneColumn';
    }
  }
};

const switchToCurrentLayout = layout => {
  switch (layout) {
    case 'StartColumn':
      return 'OneColumn';
    case 'MidColumn':
      return 'TwoColumnsMidExpanded';
    case 'EndColumn':
    default: {
      return 'ThreeColumnsEndExpanded';
    }
  }
};

const switchToNextLayout = layout => {
  switch (layout) {
    case 'StartColumn': {
      return 'TwoColumnsMidExpanded';
    }
    case 'MidColumn':
    case 'EndColumn':
    default: {
      return 'ThreeColumnsEndExpanded';
    }
  }
};

export function usePrepareLayout(layoutNumber) {
  if (!layoutNumber) {
    return {
      prevLayout: 'OneColumn',
      currentLayout: 'OneColumn',
      nextLayout: 'OneColumn',
      prevQuery: '',
      currentQuery: '',
      nextQuery: '',
    };
  }

  const prevLayout = switchToPrevLayout(layoutNumber);
  const currentLayout = switchToCurrentLayout(layoutNumber);
  const nextLayout = switchToNextLayout(layoutNumber);

  return {
    prevLayout,
    currentLayout,
    nextLayout,
    prevQuery:
      prevLayout !== '' && prevLayout !== 'OneColumn'
        ? `?layout=${prevLayout}`
        : '',
    currentQuery:
      currentLayout !== '' && currentLayout !== 'OneColumn'
        ? `?layout=${currentLayout}`
        : '',
    nextQuery:
      nextLayout !== '' && nextLayout !== 'OneColumn'
        ? `?layout=${nextLayout}`
        : '',
  };
}
