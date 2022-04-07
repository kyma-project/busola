import { config } from '../config';

export const getCustomPaths = crs => {
  const toSearchParamsString = object => {
    return new URLSearchParams(object).toString();
  };

  const getValidCrs = crs => {
    const validCrs = crs?.filter(cr => {
      const isValidCr =
        cr?.nav &&
        cr.nav.path && cr.nav.api && cr.nav.resourceType &&
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
    return validCrs;
  };

  const validCrs = getValidCrs(crs);
  let customPaths = [];

  try {
    customPaths =
      validCrs?.map(cr => ({
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
          `/namespaces/:namespaceId/${cr.nav?.path}?` +
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
                  `/namespaces/:namespaceId/${cr.nav?.path}/:${cr.nav?.path}Name?` +
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
  return customPaths;
};
