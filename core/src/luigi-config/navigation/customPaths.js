import i18next from 'i18next';
import pluralize from 'pluralize';
import { config } from '../config';

// this fn is cloned in core-ui 'helpers.js' as 'useGetTranslation'. Modify it also there
const translate = translationObj => {
  const language = i18next.language;
  if (!translationObj) {
    return '';
  }
  if (typeof translationObj === 'string') {
    return translationObj;
  }
  if (translationObj[language]) {
    return translationObj[language];
  }
  return Object.values(translationObj)[0] || '';
};

const getCustomNodes = (crs, scope) => {
  const toSearchParamsString = object => {
    return new URLSearchParams(object).toString();
  };
  let customPaths;
  try {
    customPaths =
      crs?.map(cr => {
        const translationBundle = cr.general?.urlPath || 'extensibility';
        i18next.addResourceBundle(
          i18next.language,
          translationBundle,
          cr.translations?.[i18next.language] || {},
        );
        const { resource, urlPath, icon, category, name } = cr.general || {};
        const version = resource.version.toLowerCase();
        const group = resource?.group ? `apis/${resource.group}` : 'api';
        const api = `/${group}/${version}`;

        return {
          category: {
            label: i18next.t(`${translationBundle}::category`, {
              defaultValue: category || i18next.t('custom-resources.title'),
            }),
            collapsible: true,
            icon: icon || 'customize',
          },
          resourceType: resource.kind.toLowerCase(),
          pathSegment: urlPath,
          label: i18next.t(`${translationBundle}::name`, {
            defaultValue: name || pluralize(resource.kind),
          }),
          viewUrl:
            config.coreUIModuleUrl +
            `${
              scope === 'namespace' ? '/namespaces/:namespaceId' : ''
            }/${urlPath}?` +
            toSearchParamsString({
              resourceApiPath: api,
              hasDetailsView: !!cr.details,
            }),
          keepSelectedForChildren: true,
          navigationContext: urlPath,
          context: {
            customResource: cr,
          },
          children: [
            {
              pathSegment: 'details',
              children: [
                {
                  pathSegment: `:${urlPath}Name`,
                  resourceType: resource.kind.toLowerCase(),
                  viewUrl:
                    config.coreUIModuleUrl +
                    `${
                      scope === 'namespace' ? '/namespaces/:namespaceId' : ''
                    }/${urlPath}/:${urlPath}Name?` +
                    toSearchParamsString({
                      resourceApiPath: api,
                    }),
                },
              ],
            },
          ],
        };
      }) || [];
  } catch (e) {
    console.error('An error occured while creating custom paths:', e);
  }
  return customPaths || [];
};

export const getCustomPaths = (customResources, scope) => {
  const getScopedCrs = (crs, scope) => {
    const scopedCrs = crs?.filter(cr => {
      const crScope = cr.general?.scope;
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
      const { resource, urlPath } = cr.general || {};
      const isValidCr =
        resource &&
        typeof urlPath === 'string' &&
        typeof resource.kind === 'string' &&
        typeof resource.version === 'string';
      if (!isValidCr) {
        console.error(
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
