import React from 'react';
import { useTranslation } from 'react-i18next';
import { LayoutPanel } from 'fundamental-react';
import { GenericList } from 'react-shared';

import { RouteDestinations, CommonMatchAttributes } from './common';

function L4MatchAttributesItem({ match }) {
  const { t } = useTranslation();

  return (
    <>
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

function L4MatchAttributes({ matches }) {
  const { t } = useTranslation();

  return (
    <GenericList
      title={t('virtualservices.matches.title')}
      headerRenderer={() => ['']}
      rowRenderer={match => [<L4MatchAttributesItem match={match} />]}
      entries={matches}
      showHeader={false}
    />
  );
}

export function TcpRoutes(service) {
  const { t } = useTranslation();

  if (!service.spec.tcp) return null;

  return service.spec.tcp.map(rule => (
    <LayoutPanel className="fd-margin--md definition-list">
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('virtualservices.tcp-routes.title')}
          description={rule.name}
        />
      </LayoutPanel.Header>
      {rule.match && <L4MatchAttributes matches={rule.match} />}
      {rule.route && <RouteDestinations routes={rule.route} />}
    </LayoutPanel>
  ));
}
