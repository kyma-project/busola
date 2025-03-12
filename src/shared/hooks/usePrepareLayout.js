import { useEffect, useMemo } from 'react';
import {
  NavigationType,
  useNavigationType,
  useSearchParams,
} from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';

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

export function usePrepareLayoutColumns({
  resourceType,
  namespaceId,
  apiGroup,
  apiVersion,
  resourceName,
}) {
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');
  const showCreate = searchParams.get('showCreate');
  const navigationType = useNavigationType();

  const newLayoutState = useMemo(() => {
    return layout
      ? {
          layout: layout,
          startColumn: {
            resourceType,
            namespaceId,
            apiGroup,
            apiVersion,
          },
          midColumn:
            !showCreate && resourceName
              ? {
                  resourceName,
                  resourceType,
                  namespaceId,
                  apiGroup,
                  apiVersion,
                }
              : null,
          endColumn: null,
          showCreate: showCreate ? { resourceType, namespaceId } : null,
        }
      : {
          layout: 'OneColumn',
          startColumn: {
            resourceType,
            namespaceId,
            apiGroup,
            apiVersion,
          },
          midColumn: null,
          endColumn: null,
          showCreate: null,
        };
  }, [
    layout,
    showCreate,
    resourceType,
    namespaceId,
    apiGroup,
    apiVersion,
    resourceName,
  ]);

  useEffect(() => {
    if (navigationType === NavigationType.Pop) {
      setLayoutColumn(newLayoutState);
    }
  }, [newLayoutState, setLayoutColumn, navigationType]);

  useEffect(() => {
    setLayoutColumn(newLayoutState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
