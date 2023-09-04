import React from 'react';
import { Tokens } from 'shared/components/Tokens';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { LabelSelector } from './LabelSelector';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { Panel, Title, Toolbar } from '@ui5/webcomponents-react';

export const NetworkPolicyPeers = ({ peers, title }) => {
  const { t } = useTranslation();
  if (!peers?.length) return null;

  return peers.map((peer, idx) => {
    return (
      <div key={idx}>
        {peer.ipBlock ? (
          <Panel
            fixed
            className="fd-margin--md"
            header={
              <Toolbar>
                <Title level="H5" className="header">
                  {title || t('network-policies.headers.ip-block')}
                </Title>
              </Toolbar>
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
          </Panel>
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
