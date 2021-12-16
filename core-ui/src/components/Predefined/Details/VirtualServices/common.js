import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList } from 'react-shared';

export function Destination({ destination }) {
  const portString = destination.port ? `:${destination.port.number}` : '';
  const subsetString = destination.subset ? ` (${destination.subset})` : '';
  return `${destination.host}${portString}${subsetString}`;
}

export function RouteDestinations({
  routes,
  headerRenderer = () => [],
  rowRenderer = () => [],
}) {
  const { t } = useTranslation();

  return (
    <GenericList
      title={t('virtualservices.routes')}
      headerRenderer={() => [
        t('virtualservices.route.destination'),
        t('virtualservices.route.weight'),
        ...headerRenderer(),
      ]}
      rowRenderer={route => [
        <Destination destination={route.destination} />,
        route.weight || '100',
        ...rowRenderer(route),
      ]}
      entries={routes}
      showSearchField={false}
    />
  );
}

export function CommonMatchAttributes({ match }) {
  const { t } = useTranslation();

  return (
    <>
      {match.port && (
        <>
          <dd>{t('virtualservices.matches.port')}</dd>
          <dt>{match.port}</dt>
        </>
      )}
      {match.sourceLabels &&
        Object.entries(match.sourceLabels).map(([label, value]) => (
          <>
            <dd>{t('virtualservices.matches.source-label', { label })}</dd>
            <dt>{value}</dt>
          </>
        ))}
      {match.gateways && (
        <>
          <dd>{t('virtualservices.matches.gateways')}</dd>
          <dt>{match.gateways.join(', ')}</dt>
        </>
      )}
      {match.sourceNamespace && (
        <>
          <dd>{t('virtualservices.matches.source-namespace')}</dd>
          <dt>{match.sourceNamespace}</dt>
        </>
      )}
    </>
  );
}
