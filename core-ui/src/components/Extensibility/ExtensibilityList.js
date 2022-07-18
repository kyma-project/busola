import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import pluralize from 'pluralize';

import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { usePrepareListProps } from 'resources/helpers';
import { ErrorBoundary } from 'shared/components/ErrorBoundary/ErrorBoundary';
import { prettifyKind } from 'shared/utils/helpers';

import { useGetCRbyPath } from './useGetCRbyPath';
import { ExtensibilityCreate } from './ExtensibilityCreate';
import { TranslationBundleContext, useGetTranslation } from './helpers';
import { Widget } from './components/Widget';
import { RelationsContextProvider } from './contexts/RelationsContext';
import { Link } from 'shared/components/Link/Link';

export const ExtensibilityListCore = ({ resMetaData }) => {
  const { t, widgetT, i18n } = useGetTranslation();

  const { path, kind } = resMetaData?.resource ?? {};

  const schema = resMetaData?.schema;
  const relations = resMetaData?.relations || {};

  const listProps = usePrepareListProps(path, 'name');

  if (kind) {
    listProps.resourceUrl = listProps.resourceUrl.replace(
      /[a-z0-9-]+\/?$/,
      pluralize(kind).toLowerCase(),
    );
  }
  listProps.createFormProps = { resourceSchema: resMetaData };

  listProps.resourceName = t('name', {
    defaultValue: pluralize(prettifyKind(kind)),
  });

  listProps.description = createResourceDescription({
    description: resMetaData?.resource?.description,
    translations: resMetaData?.translations,
    i18n,
  });

  listProps.customColumns = Array.isArray(resMetaData?.list)
    ? resMetaData.list.map((column, i) => ({
        header: widgetT(column),
        value: resource => (
          <Widget
            key={i}
            value={resource}
            structure={column}
            schema={schema}
            relations={relations}
          />
        ),
      }))
    : [];

  return (
    <ResourcesList
      createResourceForm={ExtensibilityCreate}
      allowSlashShortcut
      {...listProps}
    />
  );
};

export const ExtensibilityList = () => {
  const { t } = useTranslation();
  const resMetaData = useGetCRbyPath();
  const { path } = resMetaData.resource ?? {};

  return (
    <TranslationBundleContext.Provider
      value={{
        translationBundle: path,
        defaultResourcePlaceholder: resMetaData?.resource?.defaultPlaceholder,
      }}
    >
      <RelationsContextProvider relations={resMetaData?.relations || {}}>
        <ErrorBoundary
          customMessage={t('extensibility.error')}
          displayButton={false}
          key={path}
        >
          <ExtensibilityListCore resMetaData={resMetaData} />
        </ErrorBoundary>
      </RelationsContextProvider>
    </TranslationBundleContext.Provider>
  );
};

const createResourceDescription = ({ description, translations, i18n }) => {
  if (typeof description === 'object') {
    const { desc = '', links = [] } = description;
    return (
      <Trans
        i18nKey={desc}
        i18n={i18n}
        components={links.map((link, idx) => (
          <Link className="fd-link" url={link} key={idx} />
        ))}
      />
    );
  }
  if (typeof description === 'string') {
    const translation = translations?.[i18n.language]?.[description];

    if (!translation) return description;
    if (translation && typeof translation === 'string') return translation;
    if (translation && typeof translation === 'object')
      return createResourceDescription({ description: translation, i18n });
  }
};
