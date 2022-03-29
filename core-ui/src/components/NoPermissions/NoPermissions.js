import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import { Button, FormInput, Icon } from 'fundamental-react';
import { useMicrofrontendContext } from 'react-shared';
import { useTranslation } from 'react-i18next';
import './NoPermissions.scss';
import { addCluster } from 'components/Clusters/shared';

// as Luigi docs say, "some special characters (<, >, ", ', /) in node parameters are HTML-encoded."
function decodeHTMLEncoded(str) {
  return str.replaceAll('&quot;', '"');
}

function NoPermissions() {
  const { t } = useTranslation();
  const [namespaceName, setNamespaceName] = useState('');
  const {
    currentCluster: { kubeconfig },
  } = useMicrofrontendContext();

  let { error } = LuigiClient.getNodeParams();
  if (error) {
    error = decodeHTMLEncoded(error);
  } else {
    error = t('common.errors.no-permissions');
  }

  const updateKubeconfig = () => {
    const contextName = kubeconfig['current-context'];
    const context =
      kubeconfig.contexts?.find(ctx => ctx.name === contextName) ||
      kubeconfig.contexts?.[0];

    context.context.namespace = namespaceName;

    addCluster({
      kubeconfig,
      currentContext: {
        cluster: kubeconfig.clusters.find(
          c => c.name === context.context.cluster,
        ),
        user: kubeconfig.users.find(u => u.name === context.context.user),
      },
    });
  };

  return (
    <section className="no-permissions">
      <Icon ariaLabel="no-permissions" glyph="locked" />
      <header>{t('common.errors.no-permissions-header')}</header>
      <p className="fd-margin-top--md">{error}</p>
      <p>{t('common.errors.no-permissions-message')}</p>
      <p className="fd-margin-top--md fd-margin-bottom--sm">
        {t('no-permissions.enter-namespace-name')}
      </p>
      <form className="fd-display-flex">
        <FormInput
          className="fd-margin-0"
          placeholder={t('no-permissions.enter-namespace-name-placeholder')}
          value={namespaceName}
          onChange={e => setNamespaceName(e.target.value)}
        />
        <Button
          option="emphasized"
          className="update-namespace-button"
          disabled={!namespaceName}
          onClick={updateKubeconfig}
        >
          Save
        </Button>
      </form>
    </section>
  );
}

export default NoPermissions;
