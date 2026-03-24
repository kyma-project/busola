import { Tokens } from 'shared/components/Tokens';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { LabelSelector, Selector } from './LabelSelector';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

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
          <UI5Panel
            title={title || t('network-policies.headers.ip-block')}
            accessibleName={
              title || t('network-policies.accessible-name.ip-block')
            }
          >
            <LayoutPanelRow
              name={t('network-policies.headers.cidr')}
              value={peer.ipBlock.cidr || EMPTY_TEXT_PLACEHOLDER}
            />
            <LayoutPanelRow
              name={t('network-policies.headers.exceptions')}
              value={<Tokens tokens={peer.ipBlock?.except} />}
            />
          </UI5Panel>
        ) : null}
        <LabelSelector
          selector={peer.namespaceSelector}
          title={t('network-policies.headers.namespace-selector')}
          accessibleName={t(
            'network-policies.accessible-name.namespace-selector',
          )}
        />
        <LabelSelector
          selector={peer.podSelector}
          title={t('network-policies.headers.pod-selector')}
          accessibleName={t('network-policies.accessible-name.pod-selector')}
        />
      </div>
    );
  });
};
