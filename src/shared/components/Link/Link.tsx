import { ReactNode } from 'react';
import { Link as UI5Link } from '@ui5/webcomponents-react';
import { useSetAtom } from 'jotai';
import { columnLayoutAtom, ColumnLayoutState } from 'state/columnLayoutAtom';
import { useNavigate } from 'react-router';

function createNamespaceColumnsLayout(pathSegments: string[], layout: string) {
  const namespaceId = pathSegments[1] || null;
  const resourceType = pathSegments[2] || null;
  const resourceName = pathSegments[3] || null;
  const subResourceType = pathSegments[4] || null;
  const subResourceName = pathSegments[5] || null;

  const startColumn = { resourceType, resourceName: null, namespaceId };
  const midColumn =
    resourceName && layout !== 'OneColumn'
      ? { resourceType, resourceName, namespaceId }
      : null;
  const endColumn =
    subResourceName && layout === 'ThreeColumnsEndExpanded'
      ? {
          resourceType: subResourceType,
          resourceName: subResourceName,
          namespaceId,
        }
      : null;

  return { startColumn, midColumn, endColumn };
}

function createClusterColumnsLayout(pathSegments: string[], layout: string) {
  const resourceType = pathSegments[0] || null;
  const resourceName = pathSegments[1] || null;

  const startColumn = { resourceType, resourceName: null };
  const midColumn =
    resourceName && layout !== 'OneColumn'
      ? { resourceType, resourceName }
      : null;

  return { startColumn, midColumn, endColumn: null };
}

function getLayoutFromUrl(url: string): ColumnLayoutState {
  const urlObj = new URL(url, window.location.origin);
  const layout = urlObj.searchParams.get('layout') || 'OneColumn';

  // Skip the first two segments: /cluster/<CLUSTER_NAME>/...
  const allSegments = urlObj.pathname.split('/').filter(Boolean);
  const pathSegments = allSegments.slice(2);

  const { startColumn, midColumn, endColumn } =
    pathSegments[0] === 'namespaces'
      ? createNamespaceColumnsLayout(pathSegments, layout)
      : createClusterColumnsLayout(pathSegments, layout);

  return {
    layout: layout as ColumnLayoutState['layout'],
    startColumn,
    midColumn,
    endColumn,
  };
}

type LinkProps = {
  url: string;
  className?: string;
  children?: ReactNode;
  dataTestId?: string;
  design?: 'Default' | 'Subtle' | 'Emphasized';
  resetLayout?: boolean;
  layout?: string | false;
  onClick?: any;
  style?: React.CSSProperties;
};

export const Link = ({
  url,
  className = '',
  children,
  dataTestId,
  design = 'Emphasized',
  layout = 'TwoColumnsMidExpanded',
  resetLayout = true,
  onClick,
  style = {},
}: LinkProps) => {
  const setLayout = useSetAtom(columnLayoutAtom);
  const navigate = useNavigate();
  const finalUrl = (() => {
    const u = new URL(url, window.location.origin);
    if (layout) u.searchParams.set('layout', String(layout));
    return u.pathname + u.search;
  })();

  function handleOnClick(resetLayout: any, url: any, e: any) {
    e.preventDefault();
    if (resetLayout) {
      setLayout(getLayoutFromUrl(url));
    }
    navigate(url);
  }

  return (
    <UI5Link
      wrappingType={'Normal'}
      design={design}
      className={className}
      data-testid={dataTestId}
      onClick={(e) =>
        onClick ? onClick(e) : handleOnClick(resetLayout, finalUrl, e)
      }
      href={finalUrl}
      target="_blank"
      style={style}
    >
      {children}
    </UI5Link>
  );
};
