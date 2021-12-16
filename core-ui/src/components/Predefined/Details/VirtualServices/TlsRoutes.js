import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel } from 'fundamental-react';
import { GenericList } from 'react-shared';

import { RouteDestinations, CommonMatchAttributes } from './common';

function TlsMatchAttributesItem({ match }) {
  const { t } = useTranslation();

  return (
    <>
      <div>
        {t('virtualservices.matches.sni-hosts')} {match.sniHosts.join(', ')}
      </div>
      {match.destinationSubnets && (
        <div>
          {t('virtualservices.matches.destination-subnets')}
          {match.destinationSubnets.join(', ')}
        </div>
      )}
      <CommonMatchAttributes match={match} />
    </>
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
    <LayoutPanel className="fd-margin--md definition-list">
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
