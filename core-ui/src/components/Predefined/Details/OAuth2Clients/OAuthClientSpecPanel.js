import React from 'react';
import PropTypes from 'prop-types';

import { LayoutPanel, Token, FormItem, FormLabel } from 'fundamental-react';
import { EMPTY_TEXT_PLACEHOLDER } from 'react-shared';
import {
  GrantTypes,
  ResponseTypes,
} from 'components/Predefined/Create/OAuthClients/helpers';
import { useTranslation } from 'react-i18next';

import './OAuthClientSpecPanel.scss';

OAuthClientSpecPanel.propTypes = { spec: PropTypes.object.isRequired };

const Tokens = ({ tokens }) => (
  <div>
    {tokens.length
      ? tokens.map(scope => (
          <Token
            key={scope}
            style={{ marginTop: '4px' }}
            buttonLabel=""
            className="y-fd-token y-fd-token--no-button y-fd-token--gap fd-margin-end--tiny"
            readOnly={true}
          >
            {scope}
          </Token>
        ))
      : EMPTY_TEXT_PLACEHOLDER}
  </div>
);

export default function OAuthClientSpecPanel({ spec }) {
  const { t } = useTranslation();

  return (
    <LayoutPanel className="fd-margin--md oauth-client-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Configuration" />
      </LayoutPanel.Header>
      <FormItem>
        <FormLabel>{t('oauth2-clients.labels.response-types')}</FormLabel>
        <Tokens
          tokens={(spec.responseTypes || []).map(v =>
            t(`oauth2-clients.response-types.${v}`),
          )}
        />
      </FormItem>
      <FormItem>
        <FormLabel>{t('oauth2-clients.labels.grant-types')}</FormLabel>
        <Tokens
          tokens={spec.grantTypes.map(v =>
            t(`oauth2-clients.grant-types.${v}`),
          )}
        />
      </FormItem>
      <FormItem>
        <FormLabel>{t('oauth2-clients.labels.scope')}</FormLabel>
        <Tokens tokens={spec.scope.split(/ +/).filter(scope => scope)} />
      </FormItem>
    </LayoutPanel>
  );
}
