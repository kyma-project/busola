import { cloneDeep } from 'lodash';
import { extractApiGroupVersion } from 'resources/Roles/helpers';
import { useGetScope } from 'shared/hooks/BackendAPI/useGet';

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

    const isNamespaced = await getScope(
      group,
      version,
      currentModuleTemplateData?.kind,
    );
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
