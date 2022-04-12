import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList } from 'shared/components/GenericList/GenericList';

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
      {match.sourceLabels && (
        <>
          <dd>{t('virtualservices.matches.source-labels')}</dd>
          {Object.entries(match.sourceLabels).map(([label, value]) => (
            <dt>{value}</dt>
          ))}
        </>
      )}
      {match.gateways && (
        <>
          <dd>{t('virtualservices.matches.gateways')}</dd>
          {match.gateways.map(gateway => (
            <dt>{gateway}</dt>
          ))}
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
