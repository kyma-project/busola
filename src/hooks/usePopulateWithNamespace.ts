import { cloneDeep } from 'lodash';
import { extractApiGroupVersion } from 'resources/Roles/helpers';
import { useGetScope } from 'shared/hooks/BackendAPI/useGet';
import { HttpError } from 'shared/hooks/BackendAPI/config';

export const usePopulateWithNamespace = () => {
  const getScope = useGetScope();

  return async (resource: {
    apiVersion?: string;
    metadata?: { name: string; namespace?: string };
    kind?: string;
    spec?: { data: any };
  }) => {
    const currentModuleTemplateData = cloneDeep(resource);
    const { group, version } = extractApiGroupVersion(
      currentModuleTemplateData?.apiVersion,
    );

    let isNamespaced;
    try {
      isNamespaced = await getScope(
        group,
        version,
        currentModuleTemplateData?.kind,
      );
    } catch (e) {
      if (e instanceof HttpError && e.code === 404) {
        return false;
      }
      console.warn('error while getting scope of resource', resource, e);
      throw e;
    }

    return isNamespaced
      ? {
          ...currentModuleTemplateData,
          metadata: {
            ...currentModuleTemplateData?.metadata,
            namespace:
              currentModuleTemplateData?.metadata?.namespace || 'default',
          },
        }
      : currentModuleTemplateData;
  };
};
