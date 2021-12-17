import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel } from 'fundamental-react';
import { GenericList } from 'react-shared';

import { RouteDestinations, CommonMatchAttributes } from './common';

function TlsMatchAttributesItem({ match }) {
  const { t } = useTranslation();

  return (
    <dl>
      <dd>{t('virtualservices.matches.sni-hosts')}</dd>
      <dt>{match.sniHosts.join(', ')}</dt>
      {match.destinationSubnets && (
        <>
          <dd>{t('virtualservices.matches.destination-subnets')}</dd>
          <dt>{match.destinationSubnets.join(', ')}</dt>
        </>
      )}
      <CommonMatchAttributes match={match} />
    </dl>
  );
}

function TlsMatchAttributes({ matches }) {
  const { t } = useTranslation();

  return (
    <GenericList
      title={t('virtualservices.matches.title')}
      headerRenderer={() => ['']}
      rowRenderer={match => [<TlsMatchAttributesItem match={match} />]}
      entries={matches}
      showHeader={false}
    />
  );
}

export function TlsRoutes(service) {
  const { t } = useTranslation();

  if (!service.spec.tls) return null;

  return service.spec.tls.map(rule => (
    <LayoutPanel className="fd-margin--md definition-list virual-service-route">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('virtualservices.tls-routes.title')}
          description={rule.name}
        />
      </LayoutPanel.Header>
      {rule.match && <TlsMatchAttributes matches={rule.match} />}
      {rule.route && <RouteDestinations routes={rule.route} />}
    </LayoutPanel>
  ));
}
