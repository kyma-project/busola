import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { navigateToResource } from 'shared/hooks/navigate';

import { LayoutPanel, FormItem, FormLabel, Link } from 'fundamental-react';
import { Tokens } from 'shared/components/Tokens';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

import './OAuthClientSpecPanel.scss';

OAuthClientSpecPanel.propTypes = {
  spec: PropTypes.object.isRequired,
  namespace: PropTypes.string.isRequired,
};

export default function OAuthClientSpecPanel({ spec, namespace }) {
  const { t } = useTranslation();

  const { data: secrets } = useGetList()(
    `/api/v1/namespaces/${namespace}/secrets`,
    {
      pollingInterval: 5000,
    },
  );

  const clientSecret = secrets?.find(
    ({ metadata }) => metadata.name === spec.secretName,
  );

  return (
    <LayoutPanel className="fd-margin--md oauth-client-panel">
      <LayoutPanel.Header>
        <LayoutPanel.Head title="Configuration" />
      </LayoutPanel.Header>
      {spec?.clientName ? (
        <FormItem>
          <FormLabel>{t('oauth2-clients.labels.client-name')}</FormLabel>
          {spec.clientName}
        </FormItem>
      ) : null}
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
      {spec?.audience ? (
        <FormItem>
          <FormLabel>{t('oauth2-clients.labels.audience')}</FormLabel>
          <Tokens tokens={spec.audience} />
        </FormItem>
      ) : null}
      {spec?.redirectUris ? (
        <FormItem>
          <FormLabel>{t('oauth2-clients.labels.redirect-uris')}</FormLabel>
          <Tokens tokens={spec.redirectUris} />
        </FormItem>
      ) : null}
      {spec?.postLogoutRedirectUris ? (
        <FormItem>
          <FormLabel>
            {t('oauth2-clients.labels.post-logout-redirect-uris')}
          </FormLabel>
          <Tokens tokens={spec.postLogoutRedirectUris} />
        </FormItem>
      ) : null}
      {spec?.secretName ? (
        <FormItem>
          <FormLabel>{t('oauth2-clients.labels.secret')}</FormLabel>
          {clientSecret ? (
            <Link onClick={() => navigateToResource(clientSecret)}>
              {spec.secretName}
            </Link>
          ) : (
            spec.secretName || EMPTY_TEXT_PLACEHOLDER
          )}
        </FormItem>
      ) : null}
      {spec?.tokenEndpointAuthMethod ? (
        <FormItem>
          <FormLabel>{t('oauth2-clients.labels.auth-method')}</FormLabel>
          {t(`oauth2-clients.auth-methods.${spec.tokenEndpointAuthMethod}`)}
        </FormItem>
      ) : null}
    </LayoutPanel>
  );
}
