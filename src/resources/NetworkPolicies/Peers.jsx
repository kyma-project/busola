import React from 'react';
import { Tokens } from 'shared/components/Tokens';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { LabelSelector } from './LabelSelector';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';

export const NetworkPolicyPeers = ({ peers, title }) => {
  const { t } = useTranslation();
  if (!peers?.length) return null;

  return peers.map((peer, idx) => {
    return (
      <div key={idx}>
        {peer.ipBlock ? (
          <UI5Panel title={title || t('network-policies.headers.ip-block')}>
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
        />
        <LabelSelector selector={peer.podSelector} />
      </div>
    );
  });
};
