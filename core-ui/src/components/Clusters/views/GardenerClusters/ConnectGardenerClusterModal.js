import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';
import jsyaml from 'js-yaml';
import { Modal } from 'shared/components/Modal/Modal';
import { useTranslation } from 'react-i18next';
import { base64Decode } from 'shared/helpers';
import { Button } from 'fundamental-react';
import { addCluster } from 'components/Clusters/shared';
import { useConfig } from 'shared/contexts/ConfigContext';
import { baseUrl } from 'shared/hooks/BackendAPI/config';

async function GARDENER_LOGIN(kubeconfigText, setReport, backendUrl) {
  setReport('Performing SSR...');
  const kubeconfig = jsyaml.load(kubeconfigText);

  const clusterUrl = kubeconfig.clusters[0].cluster.server;
  const authorization = `Bearer ${kubeconfig.users[0].user.token}`;

  const ssrr = {
    typeMeta: {
      kind: 'SelfSubjectRulesReview',
      aPIVersion: 'authorization.k8s.io/v1',
    },
    spec: { namespace: '*' },
  };

  const ssrUrl = `${backendUrl}/apis/authorization.k8s.io/v1/selfsubjectrulesreviews`;
  const ssrResponse = await fetch(ssrUrl, {
    method: 'POST',
    body: JSON.stringify(ssrr),
    headers: {
      'Content-Type': 'application/json',
      'X-Cluster-Url': clusterUrl,
      'X-K8s-Authorization': authorization,
    },
  });
  const ssrResult = await ssrResponse.json();
  console.log('CLUSTERWIDE RESOURCE RULES', ssrResult.status.resourceRules);
  const availableProjects = [
    ...new Set(
      ssrResult.status.resourceRules
        .filter(
          r =>
            r.apiGroups.includes('core.gardener.cloud') &&
            r.resources.includes('projects') &&
            r.resourceNames,
        )
        .flatMap(r => r.resourceNames),
    ),
  ];
  console.log('AVAILABLE PROJECTS', availableProjects);

  const kubeconfigs = [];

  for (const project of availableProjects) {
    setReport('Fetching shoots in ' + project);
    const url = `${backendUrl}/apis/core.gardener.cloud/v1beta1/namespaces/garden-${project}/shoots`;
    const shootsResponse = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cluster-Url': clusterUrl,
        'X-K8s-Authorization': authorization,
      },
    });
    const shoots = await shootsResponse.json();
    console.log('SHOOTS IN ', project, shoots.items);

    for (const [index, shoot] of shoots.items.entries()) {
      setReport(
        'Fetching shoots in ' +
          project +
          ' (' +
          (index + 1) +
          ' / ' +
          shoots.items.length +
          ')',
      );
      const payload = {
        apiVersion: 'authentication.gardener.cloud/v1alpha1',
        kind: 'AdminKubeconfigRequest',
        spec: {
          expirationSeconds: 60 * 60,
        },
      };

      const kubeconfigUrl = `${backendUrl}/apis/core.gardener.cloud/v1beta1/namespaces/garden-${project}/shoots/${shoot.metadata.name}/adminkubeconfig`;
      const kubeconfigResponse = await fetch(kubeconfigUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          'X-Cluster-Url': clusterUrl,
          'X-K8s-Authorization': authorization,
        },
      });
      const res = await kubeconfigResponse.json();
      kubeconfigs.push(jsyaml.load(base64Decode(res.status.kubeconfig)));
    }
  }

  kubeconfigs.forEach(kubeconfig => {
    const contextName = kubeconfig['current-context'];
    const context =
      kubeconfig.contexts?.find(ctx => ctx.name === contextName) ||
      kubeconfig.contexts?.[0];
    const currentContext = {
      cluster: kubeconfig.clusters.find(
        c => c.name === context.context.cluster,
      ),
      user: kubeconfig.users.find(u => u.name === context.context.user),
    };
    addCluster(
      {
        kubeconfig,
        currentContext,
      },
      false,
    );
  });

  setReport('Clusters added!');
  LuigiClient.sendCustomMessage({
    id: 'busola.reloadNavigation',
  });
}

export function ConnectGardenerClusterModal({ modalOpeningComponent }) {
  const [kubeconfigText, setKubeconfigText] = useState('');
  const [report, setReport] = useState('');
  const { t } = useTranslation();
  const { fromConfig } = useConfig();
  const backendUrl = baseUrl(fromConfig);

  return (
    <Modal
      actions={onClose => [
        <Button onClick={onClose} key="close">
          {t('common.buttons.cancel')}
        </Button>,
      ]}
      title={t('clusters.gardener.title')}
      modalOpeningComponent={modalOpeningComponent}
    >
      <p className="fd-has-color-status-4 fd-has-font-style-italic">
        {t('clusters.gardener.enter-kubeconfig')}
      </p>
      <textarea
        onChange={e => setKubeconfigText(e.target.value)}
        value={kubeconfigText}
        style={{ minHeight: '200px', width: '70vw', marginTop: '0.5rem' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          disabled={!kubeconfigText}
          option="emphasized"
          onClick={async () => {
            try {
              await GARDENER_LOGIN(kubeconfigText, setReport, backendUrl);
            } catch (e) {
              console.log(e);
              setReport('error: ' + e.message);
            }
            return false;
          }}
        >
          {t('clusters.gardener.connect')}
        </Button>
      </div>
      <div>{report}</div>
    </Modal>
  );
}
