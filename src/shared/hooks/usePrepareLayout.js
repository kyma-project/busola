import { useEffect, useMemo } from 'react';
import {
  NavigationType,
  useNavigationType,
  useSearchParams,
} from 'react-router';
import { useSetRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { isFormOpenState } from 'state/formOpenAtom';

const switchToPrevLayout = layout => {
  switch (layout) {
    case 'endColumn':
      return 'TwoColumnsMidExpanded';
    case 'midColumn':
    case 'startColumn':
    default: {
      return 'OneColumn';
    }
  }
};

const switchToCurrentLayout = layout => {
  switch (layout) {
    case 'startColumn':
      return 'OneColumn';
    case 'midColumn':
      return 'TwoColumnsMidExpanded';
    case 'endColumn':
    default: {
      return 'ThreeColumnsEndExpanded';
    }
  }
};

const switchToNextLayout = layout => {
  switch (layout) {
    case 'startColumn': {
      return 'TwoColumnsMidExpanded';
    }
    case 'midColumn':
    case 'endColumn':
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
  resource,
}) {
  const setLayoutColumn = useSetRecoilState(columnLayoutState);
  const setIsFormOpen = useSetRecoilState(isFormOpenState);
  const [searchParams] = useSearchParams();
  const layout = searchParams.get('layout');
  const showCreate = searchParams.get('showCreate');
  const showEdit = searchParams.get('showEdit');
  const editColumn = searchParams.get('editColumn');
  const navigationType = useNavigationType();

  const newLayoutState = useMemo(() => {
    const isAllNamespaces = namespaceId === '-all-';
    if (!layout || layout === 'OneColumn' || isAllNamespaces) {
      return {
        layout: 'OneColumn',
        startColumn: {
          resourceName:
            resourceType === 'Namespaces' ? resourceName : undefined,
          resourceType,
          namespaceId,
          apiGroup,
          apiVersion,
        },
        midColumn: null,
        endColumn: null,
        showEdit: showEdit
          ? {
              resourceType,
              namespaceId,
              apiGroup,
              apiVersion,
              resourceName:
                resourceType === 'Namespaces' ? resourceName : undefined,
              resource,
            }
          : null,
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
          ? { resourceType: resourceName, namespaceId, resource }
          : null,
        showEdit: showEdit
          ? {
              resourceName: crName,
              resourceType: resourceName,
              namespaceId,
              apiGroup,
              apiVersion,
              resource,
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
      showCreate: showCreate ? { resourceType, namespaceId, resource } : null,
      showEdit: showEdit
        ? editColumn === 'startColumn'
          ? { resourceType, namespaceId, apiGroup, apiVersion }
          : {
              resourceName,
              resourceType,
              namespaceId,
              apiGroup,
              apiVersion,
              resource,
            }
        : null,
    };
  }, [
    layout,
    showCreate,
    showEdit,
    editColumn,
    resourceType,
    namespaceId,
    apiGroup,
    apiVersion,
    resourceName,
    isCustomResource,
    crName,
    resource,
  ]);

  useEffect(() => {
    if (navigationType === NavigationType.Pop) {
      setLayoutColumn(newLayoutState);
    }
  }, [newLayoutState, setLayoutColumn, navigationType]);

  useEffect(() => {
    setIsFormOpen({
      formOpen: !!newLayoutState.showCreate || !!newLayoutState.showEdit,
    });
  }, [newLayoutState.showCreate, newLayoutState.showEdit, setIsFormOpen]);

  useEffect(() => {
    setLayoutColumn(newLayoutState);
    setIsFormOpen({
      formOpen:
        namespaceId !== '-all-' &&
        (!!newLayoutState.showCreate || !!newLayoutState.showEdit),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
