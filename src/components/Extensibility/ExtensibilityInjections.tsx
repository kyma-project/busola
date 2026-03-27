import { useEffect, useMemo, useState } from 'react';
import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';
import { useGetSchema } from 'hooks/useGetSchema';

import { DataSourcesContextProvider } from './contexts/DataSources';
import { useGetInjections } from './useGetInjection';
import { Widget } from './components/Widget';
import { TranslationBundleContext } from './helpers';
import { useJsonata } from './hooks/useJsonata';
import { usePrepareResourceUrl } from 'resources/helpers';
import pluralize from 'pluralize';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

type ExtensibilityInjectionCoreProps = {
  resMetaData: Record<string, any>;
  root?: Record<string, any> | Record<string, any>[];
};

export function ExtensibilityInjectionCore({
  resMetaData,
  root,
}: ExtensibilityInjectionCoreProps) {
  const isStatic = resMetaData?.general?.type === 'static';
  const staticResource = {
    kind: (root as Record<string, any>)?.kind || 'Namespace',
    version: (root as Record<string, any>)?.apiVersion || 'v1',
  };
  const { resource } = resMetaData?.general ?? {};
  const { schema } = useGetSchema({
    resource: isStatic ? staticResource : resource,
  } as any);

  const resourceUrl = usePrepareResourceUrl({
    apiGroup: resource?.group,
    apiVersion: resource?.version,
    resourceType: pluralize(resource?.kind || '').toLowerCase(),
  });

  const { data, loading } = useGet(resourceUrl, {
    pollingInterval: 3000,
    skip: !resourceUrl,
  } as any) as { data: Record<string, any> | null; loading: boolean };

  const [filteredItems, setFilteredItems] = useState([{}]);
  const jsonata = useJsonata({});

  const dataSources = resMetaData?.dataSources || {};
  const general = resMetaData?.general || {};
  const injection = resMetaData?.injection;
  const injectionName = injection?.name;
  const filter = injection?.target.filter || injection?.filter || null;
  const items = data?.items || [];

  const stableFilter = useMemo(() => filter, [filter]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableItems = useMemo(() => [...items], [items.length]);
  const stableRoot = useMemo(() => root, [root]);

  useEffect(() => {
    if (!resource && !isStatic) return;

    let canceled = false;

    const run = async () => {
      const results = await Promise.all(
        stableItems.map(async (item) => {
          if (stableFilter) {
            const [value] = await jsonata(stableFilter, {
              item,
              root: stableRoot,
            });
            return value ? item : false;
          }
          return item;
        }),
      );

      if (!canceled) setFilteredItems(results.filter(Boolean));
    };

    run();
    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, isStatic, stableFilter, stableItems, stableRoot]);

  if (loading && !data) {
    return null;
  }

  // there may be a moment when `resMetaData` is undefined (e.g. when switching the namespace)
  if (!resource && !isStatic) {
    return null;
  }

  return (
    <Widget
      key={injectionName}
      value={isStatic ? [{}] : filteredItems}
      structure={injection}
      schema={schema}
      dataSources={dataSources}
      general={general}
      originalResource={filteredItems}
      embedResource={root}
      inlineContext={true}
      context={injection.target}
    />
  );
}

type ExtensibilityInjectionsProps = {
  destination: string;
  slot: string;
  root?: Record<string, any> | Record<string, any>[];
};

export default function ExtensibilityInjections({
  destination,
  slot,
  root,
}: ExtensibilityInjectionsProps) {
  const injections = useGetInjections(destination, slot);

  return (injections || []).map((injection, index) => (
    <ExtensibilityInjection resMetaData={injection} root={root} key={index} />
  ));
}

const ExtensibilityInjection = ({
  resMetaData,
  root,
}: {
  resMetaData: Record<string, any>;
  root?: Record<string, any> | Record<string, any>[];
}) => {
  const { urlPath, defaultPlaceholder } = resMetaData?.general || {};

  const translationBundleValue = useMemo(
    () => ({
      translationBundle: urlPath || 'extensibility',
      defaultResourcePlaceholder: defaultPlaceholder,
    }),
    [urlPath, defaultPlaceholder],
  );

  return (
    <TranslationBundleContext.Provider value={translationBundleValue}>
      <DataSourcesContextProvider dataSources={resMetaData?.dataSources || {}}>
        <ExtensibilityErrBoundary>
          <ExtensibilityInjectionCore resMetaData={resMetaData} root={root} />
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
};
