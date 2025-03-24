import { useEffect, useMemo } from 'react';
import {
  NavigationType,
  useNavigationType,
  useSearchParams,
} from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { isFormOpenState } from 'state/formOpenAtom';

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
  isCustomResource,
  crName,
}) {
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');
  const showCreate = searchParams.get('showCreate');
  const showEdit = searchParams.get('showEdit');
  const navigationType = useNavigationType();

  const newLayoutState = useMemo(() => {
    if (!layout) {
      return {
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
    }

    if (isCustomResource) {
      return {
        layout: layout,
        startColumn: {
          resourceType,
          namespaceId,
          apiGroup,
          apiVersion,
        },
        midColumn: resourceName
          ? {
              resourceName,
              resourceType,
              namespaceId,
              apiGroup,
              apiVersion,
            }
          : null,
        endColumn: crName
          ? {
              resourceName: crName,
              resourceType: resourceName,
              namespaceId,
              apiGroup,
              apiVersion,
            }
          : null,
        showCreate: showCreate
          ? { resourceType: resourceName, namespaceId }
          : null,
        showEdit: showEdit
          ? {
              resourceName: crName,
              resourceType: resourceName,
              namespaceId,
              apiGroup,
              apiVersion,
              resource: null,
            }
          : null,
      };
    }

    return {
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
      showEdit: showEdit
        ? {
            resourceName,
            resourceType,
            namespaceId,
            apiGroup,
            apiVersion,
            resource: null,
          }
        : null,
    };
  }, [
    layout,
    showCreate,
    showEdit,
    resourceType,
    namespaceId,
    apiGroup,
    apiVersion,
    resourceName,
    isCustomResource,
    crName,
  ]);

  useEffect(() => {
    if (navigationType === NavigationType.Pop) {
      setLayoutColumn(newLayoutState);
      setIsFormOpen({ formOpen: !!newLayoutState.showCreate });
    }
  }, [newLayoutState, setLayoutColumn, setIsFormOpen, navigationType]);

  useEffect(() => {
    setLayoutColumn(newLayoutState);
    setIsFormOpen({ formOpen: !!newLayoutState.showCreate });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
