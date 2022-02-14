import React from 'react';
import { Tokens } from 'shared/components/Tokens';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import { LayoutPanel } from 'fundamental-react';
import { LabelSelector } from './LabelSelector';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';

export const NetworkPolicyPeers = ({ peers, title }) => {
  const { t } = useTranslation();
  if (!peers?.length) return null;

  return peers.map((peer, idx) => {
    return (
      <div key={idx}>
        {peer.ipBlock ? (
          <LayoutPanel className="fd-margin--md">
            <LayoutPanel.Header>
              <LayoutPanel.Head
                title={title || t('network-policies.headers.ip-block')}
              />
            </LayoutPanel.Header>
            <LayoutPanel.Body>
              <LayoutPanelRow
                name={t('network-policies.headers.cidr')}
                value={peer.ipBlock.cidr || EMPTY_TEXT_PLACEHOLDER}
              />
              <LayoutPanelRow
                name={t('network-policies.headers.exceptions')}
                value={
                  peer.ipBlock.except ? (
                    <Tokens tokens={peer.ipBlock.except} />
                  ) : (
                    EMPTY_TEXT_PLACEHOLDER
                  )
                }
              />
            </LayoutPanel.Body>
          </LayoutPanel>
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
