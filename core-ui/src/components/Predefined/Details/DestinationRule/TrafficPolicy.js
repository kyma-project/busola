import React from 'react';
import { LayoutPanel } from 'fundamental-react';

import { ConnectionPoolTCP } from './ConnectionPoolTCP';
import { ConnectionPoolHTTP } from './ConnectionPoolHTTP';
import { LoadBalancer } from './LoadBalancer';
import { OutlierDetection } from './OutlierDetection';
import { TlsSettings } from './TlsSettings';

import { useTranslation } from 'react-i18next';

export const TrafficPolicyWidget = ({ trafficPolicy }) => {
  if (!trafficPolicy) {
    return null;
  }
  return (
    <>
      {trafficPolicy.connectionPool?.tcp ? (
        <ConnectionPoolTCP tcp={trafficPolicy.connectionPool.tcp} />
      ) : null}
      {trafficPolicy.connectionPool?.http ? (
        <ConnectionPoolHTTP http={trafficPolicy.connectionPool.http} />
      ) : null}
      {trafficPolicy.loadBalancer ? (
        <LoadBalancer loadBalancer={trafficPolicy.loadBalancer} />
      ) : null}
      {trafficPolicy.outlierDetection ? (
        <OutlierDetection outlierDetection={trafficPolicy.outlierDetection} />
      ) : null}
      {trafficPolicy.tls ? <TlsSettings tls={trafficPolicy.tls} /> : null}
    </>
  );
};

export const TrafficPolicy = destinationRule => {
  const { t } = useTranslation();

  const portTrafficPolicies = destinationRule.spec.trafficPolicy?.portLevelSettings?.map(
    portTrafficPolicy => (
      <LayoutPanel
        className="fd-margin--md"
        key={portTrafficPolicy.port.number}
      >
        <LayoutPanel.Header>
          <LayoutPanel.Head
            title={t('destination-rules.details.port-traffic-policy', {
              port: portTrafficPolicy.port.number,
            })}
          />
        </LayoutPanel.Header>
        <TrafficPolicyWidget trafficPolicy={portTrafficPolicy} />
      </LayoutPanel>
    ),
  );

  return destinationRule.spec.trafficPolicy ? (
    <LayoutPanel
      className="fd-margin--md"
      key={'destination-rules-traffic-policy'}
      data-testid={'traffic-policy'}
    >
      <LayoutPanel.Header>
        <LayoutPanel.Head
          title={t('destination-rules.details.traffic-policy')}
        />
      </LayoutPanel.Header>

      <TrafficPolicyWidget trafficPolicy={destinationRule.spec.trafficPolicy} />
      {portTrafficPolicies}
    </LayoutPanel>
  ) : null;
};
