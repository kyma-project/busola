import { FormGroup } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { Tokens } from 'shared/components/Tokens';
import { LabelSelector, Selector } from './LabelSelector';

export type NetworkPolicyPeersProps = {
  peers: {
    ipBlock?: {
      cidr: string;
      except?: string[];
    };
    namespaceSelector?: Selector;
    podSelector?: Selector;
  }[];
};

export const NetworkPolicyPeers = ({ peers }: NetworkPolicyPeersProps) => {
  const { t } = useTranslation();
  if (!peers?.length) return null;

  return (
    <ResourceDetailsForm>
      {peers.map((peer, idx) => (
        // A peer's selectors only match together, so they share one group.
        <FormGroup
          key={idx}
          headerText={`${t('network-policies.headers.peer')} #${idx + 1}`}
        >
          {peer.ipBlock && (
            <>
              <ResourceDetailsFormItem
                label={t('network-policies.headers.cidr')}
                value={peer.ipBlock.cidr}
              />
              <ResourceDetailsFormItem
                label={t('network-policies.headers.exceptions')}
                value={<Tokens tokens={peer.ipBlock.except} />}
              />
            </>
          )}
          {peer.namespaceSelector && (
            <ResourceDetailsFormItem
              label={t('network-policies.headers.namespace-selector')}
              value={<LabelSelector selector={peer.namespaceSelector} />}
            />
          )}
          {peer.podSelector && (
            <ResourceDetailsFormItem
              label={t('network-policies.headers.pod-selector')}
              value={<LabelSelector selector={peer.podSelector} />}
            />
          )}
        </FormGroup>
      ))}
    </ResourceDetailsForm>
  );
};
