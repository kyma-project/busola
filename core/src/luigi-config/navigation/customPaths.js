import { config } from '../config';
import i18next from 'i18next';
import { coreUIViewGroupName } from './static-navigation-model';

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
        const translationBundle = cr.navigation?.path || 'extensibility';
        i18next.addResourceBundle(
          i18next.language,
          translationBundle,
          cr.translations?.[i18next.language] || {},
        );
        const { resource } = cr || {};
        const api = `/${resource?.group === 'core' ? 'api' : 'apis'}/${
          resource.group
        }/${resource.version.toLowerCase()}`;
        return {
          category: {
            label: i18next.t([
              `${translationBundle}:category`,
              'custom-resources.title',
            ]),
            collapsible: true,
            icon: cr.navigation?.icon || 'customize',
          },
          resourceType: resource.kind.toLowerCase(),
          pathSegment: cr.navigation?.path,
          label: i18next.t(`${translationBundle}:name`, {
            defaultValue: resource.kind,
          }),
          viewUrl:
            config.coreUIModuleUrl +
            `${scope === 'namespace' ? '/namespaces/:namespaceId' : ''}/${
              cr.navigation?.path
            }?` +
            toSearchParamsString({
              resourceApiPath: api,
              hasDetailsView: !!cr.details,
            }),
          keepSelectedForChildren: true,
          navigationContext: cr.navigation?.path,
          context: {
            customResource: cr,
          },
          children: [
            {
              pathSegment: 'details',
              children: [
                {
                  pathSegment: `:${cr.navigation?.path}Name`,
                  resourceType: resource.kind.toLowerCase(),
                  viewUrl:
                    config.coreUIModuleUrl +
                    `${
                      scope === 'namespace' ? '/namespaces/:namespaceId' : ''
                    }/${cr.navigation?.path}/:${cr.navigation?.path}Name?` +
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
      const crScope = cr.navigation?.scope;
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
        cr.navigation &&
        typeof cr.navigation?.path === 'string' &&
        cr.resource &&
        typeof cr.resource.kind === 'string' &&
        typeof cr.resource.group === 'string' &&
        typeof cr.resource.version === 'string';
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
