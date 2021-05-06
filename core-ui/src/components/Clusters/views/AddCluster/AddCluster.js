import React from 'react';
import './AddCluster.scss';

import { PageHeader } from 'react-shared';
import { KubeconfigUpload } from '../../components/KubeconfigUpload';
import { AuthForm } from 'components/Clusters/components/AuthForm/AuthForm';

export function AddCluster() {
  const [showNoAuth, setShowNoAuth] = React.useState(false);
  const [cluster, setCluster] = React.useState(null);

  const breadcrumbItems = [
    { name: 'Clusters', path: '/clusters', fromAbsolutePath: true },
  ];

  return (
    <>
      <PageHeader
        title="Add Cluster"
        description="Upload or paste your kubeconfig file"
        breadcrumbItems={breadcrumbItems}
      />
      <div className="add-cluster-form fd-margin-top--lg">
        {showNoAuth ? (
          <AuthForm cluster={cluster} setShowNoAuth={setShowNoAuth} />
        ) : (
          <KubeconfigUpload
            setShowNoAuth={setShowNoAuth}
            setCluster={setCluster}
          />
        )}
      </div>
    </>
  );
}
