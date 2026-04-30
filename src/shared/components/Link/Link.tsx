import { ReactNode } from 'react';
import { Link as UI5Link } from '@ui5/webcomponents-react';
import { useSetAtom } from 'jotai';
import { columnLayoutAtom, ColumnLayoutState } from 'state/columnLayoutAtom';
import { useNavigate } from 'react-router';

function getLayoutFromUrl(url: string): ColumnLayoutState {
  const urlObj = new URL(url, window.location.origin);
  const layout = urlObj.searchParams.get('layout') || 'OneColumn';

  // Skip the first two segments: /cluster/<CLUSTER_NAME>/...
  const allSegments = urlObj.pathname.split('/').filter(Boolean);
  const pathSegments = allSegments.slice(2); // everything after cluster/<name>

  // Remaining path patterns:
  // namespaces/:ns/:resourceType                -> list view (OneColumn)
  // namespaces/:ns/:resourceType/:resourceName  -> detail view (TwoColumnsMidExpanded)
  // :resourceType                               -> cluster-scoped list
  // :resourceType/:resourceName                 -> cluster-scoped detail

  let startColumn = null;
  let midColumn = null;
  let endColumn = null;

  if (pathSegments[0] === 'namespaces') {
    const namespaceId = pathSegments[1] || null;
    const resourceType = pathSegments[2] || null;
    const resourceName = pathSegments[3] || null;

    startColumn = {
      resourceType,
      resourceName: null,
      namespaceId,
    };

    if (resourceName && layout !== 'OneColumn') {
      midColumn = {
        resourceType,
        resourceName,
        namespaceId,
      };
    }

    // Sub-resource for third column
    const subResourceType = pathSegments[4] || null;
    const subResourceName = pathSegments[5] || null;
    if (subResourceName && layout === 'ThreeColumnsEndExpanded') {
      endColumn = {
        resourceType: subResourceType,
        resourceName: subResourceName,
        namespaceId,
      };
    }
  } else {
    // Cluster-scoped resources
    const resourceType = pathSegments[0] || null;
    const resourceName = pathSegments[1] || null;

    startColumn = {
      resourceType,
      resourceName: null,
    };

    if (resourceName && layout !== 'OneColumn') {
      midColumn = {
        resourceType,
        resourceName,
      };
    }
  }
  console.log('lolo getLayoutFromUrl', {
    layout: layout as ColumnLayoutState['layout'],
    startColumn,
    midColumn,
    endColumn,
  });
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
  const finalUrl = layout
    ? `${url}${url.includes('?') ? '&' : '?'}layout=${layout}`
    : url;

  function handleOnlick(resetLayout: any, url: any, e: any) {
    e.preventDefault();
    console.log('handleOnlick resetLayout', resetLayout);
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
        onClick ? onClick(e) : handleOnlick(resetLayout, finalUrl, e)
      }
      href={finalUrl}
      target="_blank"
      style={style}
    >
      {children}
    </UI5Link>
  );
};
