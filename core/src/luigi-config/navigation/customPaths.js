import { config } from '../config';

const getCustomNodes = (crs, scope) => {
  const toSearchParamsString = object => {
    return new URLSearchParams(object).toString();
  };

  let customPaths;

  try {
    customPaths =
      crs?.map(cr => ({
        category: {
          label: cr.nav?.category || 'Custom Resources',
          collapsible: true,
          icon: 'source-code',
        },
        resourceType: cr.nav?.resourceType,
        pathSegment: cr.nav?.path,
        label: cr.nav?.label,
        viewUrl:
          config.coreUIModuleUrl +
          `${scope === 'namespace' ? '/namespaces/:namespaceId' : ''}/${
            cr.nav?.path
          }?` +
          toSearchParamsString({
            resourceApiPath: cr.nav?.api,
            hasDetailsView: cr.nav?.hasDetailsView,
          }),
        keepSelectedForChildren: true,
        navigationContext: cr.nav?.path,
        context: {
          customResource: cr,
        },
        children: [
          {
            pathSegment: 'details',
            children: [
              {
                pathSegment: `:${cr.nav?.path}Name`,
                resourceType: cr.nav?.path,
                viewUrl:
                  config.coreUIModuleUrl +
                  `${scope === 'namespace' ? '/namespaces/:namespaceId' : ''}/${
                    cr.nav?.path
                  }/:${cr.nav?.path}Name?` +
                  toSearchParamsString({
                    resourceApiPath: cr.nav?.api,
                  }),
              },
            ],
          },
        ],
      })) || [];
  } catch (e) {
    console.error('An error occured while creating custom paths:', e);
  }
  return customPaths || [];
};

export const getCustomPaths = (customResources, scope) => {
  const getScopedCrs = (crs, scope) => {
    const scopedCrs = crs?.filter(cr => {
      const crScope = cr.nav?.scope;
      if (
        !crScope ||
        (crScope.toLowerCase() !== 'namespace' &&
          crScope.toLowerCase() !== 'cluster')
      ) {
        console.warn(
          'Some of the custom resources have incorrect scope value (should be "namespace" or "cluster").',
        );
        return false;
      }
      return crScope === scope;
    });
    return scopedCrs || [];
  };

  const getValidCrs = crs => {
    const validCrs = crs?.filter(cr => {
      const isValidCr =
        cr.nav &&
        typeof cr.nav.path === 'string' &&
        typeof cr.nav.api === 'string' &&
        typeof cr.nav.resourceType === 'string';
      if (!isValidCr) {
        console.warn(
          'Some of the custom resources are not configured properly.',
        );
      }
      return isValidCr;
    });
    return validCrs || [];
  };

  const scopedCrs = getScopedCrs(customResources, scope);
  const validCrs = getValidCrs(scopedCrs);

  return getCustomNodes(validCrs, scope);
};
