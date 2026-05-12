import { useTranslation } from 'react-i18next';

import { Tokens } from 'shared/components/Tokens';
import { Selector } from 'shared/components/Selector/Selector';
import {
  ResourceDetails,
  ResourceDetailsProps,
} from 'shared/components/ResourceDetails/ResourceDetails';

import { NetworkPolicyPorts } from './Ports';
import { NetworkPolicyPeers } from './Peers';
import NetworkPolicyCreate from './NetworkPolicyCreate';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { ResourceDescription } from 'resources/NetworkPolicies';
import { EventsList } from 'shared/components/EventsList';
import { filterByResource } from 'hooks/useMessageList';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

type Policy = {
  metadata: {
    namespace: string;
  };
  spec: {
    podSelector: {
      matchLabels: Record<string, string>;
      matchExpressions: any;
    };
  };
};

export function NetworkPolicyDetails({
  namespace,
  resourceName,
  ...props
}: Omit<ResourceDetailsProps, 'createResourceForm'>) {
  const { t } = useTranslation();

  const Events = () => (
    <EventsList
      key="events"
      namespace={namespace}
      filter={filterByResource('NetworkPolicy', resourceName)}
      hideInvolvedObjects={true}
    />
  );

  const Specification = ({
    spec,
  }: {
    spec: {
      policyTypes: string[];
    };
  }) => (
    <UI5Panel
      key="specification"
      title={t('common.headers.specification')}
      accessibleName={t('common.accessible-name.specification')}
      keyComponent="specification-panel"
    >
      <LayoutPanelRow
        name={t('network-policies.headers.policy-types')}
        value={<Tokens tokens={spec.policyTypes || []} />}
      />
    </UI5Panel>
  );

  const Ingresses = ({
    spec,
  }: {
    spec: {
      ingress: any[];
    };
  }) => {
    if (!spec.ingress?.length) return null;

    return spec.ingress.map((ingress, idx) => (
      <UI5Panel
        key={`ingress${idx}`}
        title={t('network-policies.headers.ingress') + ` #${idx + 1}`}
        accessibleName={`${t('network-policies.headers.ingress')} #${idx + 1} panel`}
        keyComponent={idx.toString()}
      >
        <NetworkPolicyPeers
          peers={ingress.from}
          title={t('network-policies.headers.policy-peer')}
        />
        <NetworkPolicyPorts
          ports={ingress.ports}
          title={t('network-policies.headers.policy-port')}
        />
      </UI5Panel>
    ));
  };

  const Egresses = ({
    spec,
  }: {
    spec: {
      egress: any[];
    };
  }) => {
    if (!spec.egress?.length) return null;

    return spec.egress.map((egress, idx) => (
      <UI5Panel
        key={`egress${idx}`}
        title={t('network-policies.headers.egress') + ` #${idx + 1}`}
        accessibleName={`${t('network-policies.headers.egress')} #${idx + 1} panel`}
        keyComponent={idx.toString()}
      >
        <NetworkPolicyPeers
          peers={egress.to}
          title={t('network-policies.headers.policy-peer')}
        />
        <NetworkPolicyPorts
          ports={egress.ports}
          title={t('network-policies.headers.policy-port')}
        />
      </UI5Panel>
    ));
  };

  const PodSelector = (policy: Policy) => {
    const { t } = useTranslation();

    return (
      <Selector
        key="pod-selector"
        namespace={policy.metadata.namespace}
        labels={policy.spec.podSelector?.matchLabels}
        expressions={policy.spec.podSelector?.matchExpressions}
        title={t('network-policies.headers.pod-selector')}
        selector={policy.spec.podSelector}
      />
    );
  };

  const customComponents = [
    Specification,
    Ingresses,
    Egresses,
    PodSelector,
    Events,
  ];

  return (
    <ResourceDetails
      customComponents={customComponents}
      description={ResourceDescription}
      createResourceForm={NetworkPolicyCreate}
      namespace={namespace}
      resourceName={resourceName}
      {...props}
    />
  );
}

export default NetworkPolicyDetails;
