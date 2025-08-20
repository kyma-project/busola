import { useEffect } from 'react';
import pluralize from 'pluralize';
import { useTranslation } from 'react-i18next';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { usePrepareListProps } from 'resources/helpers';
import { prettifyKind } from 'shared/utils/helpers';
import { ExtensibilityErrBoundary } from 'components/Extensibility/ExtensibilityErrBoundary';
import { useGetSchema } from 'hooks/useGetSchema';
import { getExtensibilityPath } from 'components/Extensibility/helpers/getExtensibilityPath';

import { useGetCRbyPath } from './useGetCRbyPath';
import ExtensibilityCreate from './ExtensibilityCreate';
import {
  applyFormula,
  getResourceDescAndUrl,
  getTextSearchProperties,
  TranslationBundleContext,
  useCreateResourceDescription,
  useGetTranslation,
} from './helpers';
import { sortBy } from './helpers/sortBy';
import { Widget } from './components/Widget';
import { DataSourcesContextProvider } from './contexts/DataSources';
import { useJsonata } from './hooks/useJsonata';
import { useFeature } from 'hooks/useFeature';
import { createPortal } from 'react-dom';
import YamlUploadDialog from 'resources/Namespaces/YamlUpload/YamlUploadDialog';

import '../../web-components/eventListenerTracker';
import { configFeaturesNames } from 'state/types';

export const ExtensibilityListCore = ({
  resMetaData,
  filterFunction,
  rawResourceType,
  ...props
}) => {
  const { t, widgetT, exists } = useGetTranslation();
  const { t: tBusola } = useTranslation();
  const jsonata = useJsonata({});

  const { resource, description, features, filter: generalFilter } =
    resMetaData?.general ?? {};

  const { disableCreate, disableDelete } = features?.actions ?? {
    disableCreate: props.disableCreate,
    disableDelete: props.disableDelete,
  };

  const dataSources = resMetaData?.dataSources || {};
  const { schema } = useGetSchema({
    resource,
  });

  const listProps = usePrepareListProps({
    resourceCustomType: getExtensibilityPath(resMetaData?.general),
    resourceI18Key: 'name',
    apiGroup: resource?.group,
    apiVersion: resource?.version,
    hasDetailsView: !!resMetaData?.details,
  });

  const resourceTitle = resMetaData?.general?.name;
  listProps.resourceTitle = exists('name')
    ? t('name')
    : resourceTitle || pluralize(prettifyKind(resource?.kind || ''));

  if (resource?.kind) {
    listProps.resourceUrl = listProps.resourceUrl?.replace(
      /[a-z0-9-]+\/?$/,
      pluralize(resource.kind).toLowerCase(),
    );
  }
  listProps.createFormProps = { resourceSchema: resMetaData };

  listProps.description = useCreateResourceDescription(description);

  listProps.customColumns = Array.isArray(resMetaData?.list)
    ? resMetaData?.list.map((column, i) => ({
        header: widgetT(column),
        value: resource => (
          <Widget
            key={i}
            value={resource}
            structure={column}
            schema={schema}
            dataSources={dataSources}
            originalResource={resource}
            inlineContext={true}
          />
        ),
      }))
    : [];

  const isFilterAString =
    typeof resMetaData?.resource?.filter === 'string' ||
    typeof generalFilter === 'string';

  const filterFn = async value =>
    await applyFormula(
      value,
      resMetaData?.resource?.filter || generalFilter,
      tBusola,
    );

  listProps.filter = isFilterAString ? filterFn : filterFunction;

  const sortOptions = (resMetaData?.list || []).filter(element => element.sort);
  const searchOptions = (resMetaData?.list || []).filter(
    element => element.search,
  );

  const textSearchProperties = getTextSearchProperties({
    searchOptions,
    defaultSearch: true,
  });

  const {
    description: subtitleText,
    url: emptyListUrl,
  } = getResourceDescAndUrl(description);

  return (
    <ResourcesList
      {...listProps}
      {...props}
      rawResourceType={rawResourceType}
      displayLabelForLabels
      disableCreate={disableCreate}
      disableDelete={disableDelete}
      createResourceForm={ExtensibilityCreate}
      sortBy={defaultSortOptions =>
        sortBy(jsonata, sortOptions, t, defaultSortOptions)
      }
      searchSettings={{
        textSearchProperties: async defaultSearchProperties =>
          await textSearchProperties(defaultSearchProperties),
      }}
      emptyListProps={{
        subtitleText: subtitleText,
        url: emptyListUrl,
      }}
    />
  );
};

const ExtensibilityList = ({ overrideResMetadata, ...props }) => {
  const defaultResMetadata = useGetCRbyPath();
  const resMetaData = overrideResMetadata || defaultResMetadata;
  const { urlPath, defaultPlaceholder } = resMetaData?.general ?? {};
  const { isEnabled: isExtensibilityCustomComponentsEnabled } = useFeature(
    configFeaturesNames.EXTENSIBILITY_CUSTOM_COMPONENTS,
  );

  useEffect(() => {
    const customElement = resMetaData?.general?.customElement;
    const customScript = resMetaData?.customScript;

    if (
      isExtensibilityCustomComponentsEnabled &&
      customElement &&
      customScript &&
      !customElements.get(customElement)
    ) {
      const script = document.createElement('script');
      script.type = 'module';
      const scriptBlob = new Blob([customScript], {
        type: 'application/javascript',
      });
      const blobURL = URL.createObjectURL(scriptBlob);
      script.src = blobURL;

      // Clean up the Blob URL after the script loads
      script.onload = () => {
        URL.revokeObjectURL(blobURL);
      };

      script.onerror = e => {
        console.error('Script loading or execution error:', e);
      };
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [resMetaData, isExtensibilityCustomComponentsEnabled]);

  return (
    <TranslationBundleContext.Provider
      value={{
        translationBundle: getExtensibilityPath(resMetaData?.general),
        defaultResourcePlaceholder: defaultPlaceholder,
      }}
    >
      <DataSourcesContextProvider dataSources={resMetaData?.dataSources || {}}>
        <ExtensibilityErrBoundary key={urlPath}>
          {isExtensibilityCustomComponentsEnabled && resMetaData?.customHtml ? (
            <>
              <div
                id="custom-html"
                dangerouslySetInnerHTML={{ __html: resMetaData.customHtml }}
              ></div>
              {createPortal(<YamlUploadDialog />, document.body)}
            </>
          ) : (
            <ExtensibilityListCore resMetaData={resMetaData} {...props} />
          )}
        </ExtensibilityErrBoundary>
      </DataSourcesContextProvider>
    </TranslationBundleContext.Provider>
  );
};

export default ExtensibilityList;
