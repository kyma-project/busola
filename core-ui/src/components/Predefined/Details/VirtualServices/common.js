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
    />
  );
}

export function CommonMatchAttributes({ match }) {
  const { t } = useTranslation();

  return (
    <>
      {match.port && (
        <div>
          {t('virtualservices.http-routes.match.port')} = {match.port}
        </div>
      )}
      {match.sourceLabels &&
        Object.entries(match.sourceLabels).map(([label, value]) => (
          <div>
            {t('virtualservices.http-routes.match.source-label', { label })} ={' '}
            {value}
          </div>
        ))}
      {match.gateways && (
        <div>
          {t('virtualservices.http-routes.match.gateways')}{' '}
          {match.gateways.join(', ')}
        </div>
      )}
      {match.sourceNamespace && (
        <div>
          {t('virtualservices.http-routes.match.source-namespace')} ={' '}
          {match.sourceNamespace}
        </div>
      )}
    </>
  );
}
