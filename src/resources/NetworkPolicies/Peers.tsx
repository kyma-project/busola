import { Tokens } from 'shared/components/Tokens';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { LabelSelector, Selector } from './LabelSelector';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Title } from '@ui5/webcomponents-react';

export type NetworkPolicyPeersProps = {
  title: string;
  peers: {
    ipBlock: {
      cidr: string;
      except: any;
    };
    namespaceSelector: Selector;
    podSelector: Selector;
  }[];
};

export const NetworkPolicyPeers = ({
  peers,
  title,
}: NetworkPolicyPeersProps) => {
  const { t } = useTranslation();
  if (!peers?.length) return null;

  return peers.map((peer, idx) => {
    return (
      <div key={idx}>
        {peer.ipBlock ? (
          <>
            <Title className="sap-margin-x-small" size="H6">
              {title || t('network-policies.headers.ip-block')}
            </Title>
            <LayoutPanelRow
              name={t('network-policies.headers.cidr')}
              value={peer.ipBlock.cidr || EMPTY_TEXT_PLACEHOLDER}
            />
            <LayoutPanelRow
              name={t('network-policies.headers.exceptions')}
              value={<Tokens tokens={peer.ipBlock?.except} />}
            />
          </>
        ) : null}
        <LabelSelector
          selector={peer.namespaceSelector}
          title={t('network-policies.headers.namespace-selector')}
        />
        <LabelSelector
          selector={peer.podSelector}
          title={t('network-policies.headers.pod-selector')}
        />
      </div>
    );
  });
};
