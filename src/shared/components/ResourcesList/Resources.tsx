import { useEffect, useState } from 'react';
import { ResourceListRenderer } from './ResourceListRenderer';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useWindowTitle } from 'shared/hooks/useWindowTitle';
import { prettifyNamePlural } from 'shared/utils/helpers';
import { ResourceProps } from './types';

export function Resources({
  resourceTitle,
  resourceType,
  filter,
  resourceUrl,
  skipDataLoading,
  isCompact,
  ...props
}: ResourceProps) {
  useWindowTitle(prettifyNamePlural(resourceTitle, resourceType), {
    skip: isCompact,
  });

  const {
    loading,
    error,
    data: resources,
    silentRefetch,
  } = useGetList()(resourceUrl, {
    pollingInterval: 3000,
    skip: skipDataLoading,
  } as any);

  const [filteredResources, setFilteredResources] = useState<any[]>([]);

  useEffect(() => {
    if (!filter) {
      const timeoutId = setTimeout(() => {
        setFilteredResources(resources || []);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      Promise.all(
        (resources || []).map(async (resource) => {
          const passThroughFilter = await filter(resource);
          return passThroughFilter ? resource : false;
        }),
      ).then((results) => {
        setFilteredResources(results.filter(Boolean));
      });
    }
  }, [filter, resources]);

  return (
    <ResourceListRenderer
      loading={loading}
      error={error}
      silentRefetch={silentRefetch}
      resourceTitle={resourceTitle}
      resourceType={resourceType}
      resourceUrl={resourceUrl}
      isCompact={isCompact}
      {...props}
      resources={filteredResources}
    />
  );
}
