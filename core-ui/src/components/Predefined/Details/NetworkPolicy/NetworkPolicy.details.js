import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';
import { LayoutPanel } from 'fundamental-react';
import { LabelSelector } from './LabelSelector';
import { NetworkPolicyPorts } from './Ports';
import { NetworkPolicyPeers } from './Peers';

export function NetworkPoliciesDetails({ DefaultRenderer, ...otherParams }) {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('network-policies.headers.policy-types'),
      value: ({ spec }) => <Tokens tokens={spec.policyTypes || []} />,
    },
  ];

  const Ingresses = ({ spec }) => {
    if (!spec.ingress?.length) return null;

    return spec.ingress.map((ingress, idx) => (
      <LayoutPanel className="fd-margin--md" key={idx}>
        <LayoutPanel.Header>
          <LayoutPanel.Head
            title={t('network-policies.headers.ingress') + ` #${idx + 1}`}
          />
        </LayoutPanel.Header>
        <NetworkPolicyPeers
          peers={ingress.from}
          title={t('network-policies.headers.policy-peer')}
        />
        <NetworkPolicyPorts
          ports={ingress.ports}
          title={t('network-policies.headers.policy-port')}
        />
      </LayoutPanel>
    ));
  };

  const Egresses = ({ spec }) => {
    if (!spec.egress?.length) return null;

    return spec.egress.map((egress, idx) => (
      <LayoutPanel className="fd-margin--md" key={idx}>
        <LayoutPanel.Header>
          <LayoutPanel.Head
            title={t('network-policies.headers.egress') + ` #${idx + 1}`}
          />
        </LayoutPanel.Header>
        <NetworkPolicyPeers
          peers={egress.to}
          title={t('network-policies.headers.policy-peer')}
        />
        <NetworkPolicyPorts
          ports={egress.ports}
          title={t('network-policies.headers.policy-port')}
        />
      </LayoutPanel>
    ));
  };

  const customComponents = [
    r => (
      <div key="label-selector">
        <LabelSelector selector={r.spec?.podSelector} />
      </div>
    ),
    Ingresses,
    Egresses,
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={customComponents}
      {...otherParams}
    />
  );
}
