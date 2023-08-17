import { Button, MessageBox } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { extensionsState } from 'state/navigation/extensionsAtom';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import pluralize from 'pluralize';
import { useUrl } from 'hooks/useUrl';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { useNotification } from 'shared/contexts/NotificationContext';

export function IncorrectPath({ to, title = '', message = '' }) {
  const { t } = useTranslation();
  const { namespace, namespaceUrl, clusterUrl } = useUrl();
  const notificationManager = useNotification();
  const navigate = useNavigate();
  const extensions = useRecoilValue(extensionsState);

  title = title || t('components.incorrect-path.title.default');
  message = message || t('components.incorrect-path.message.default');

  const resourceUrl = `/apis/apiextensions.k8s.io/v1/customresourcedefinitions`;
  const { namespaceResourceType = '', namespaceResourceName = '' } =
    useMatch({
      path:
        '/cluster/:cluster/namespaces/:namespace/:namespaceResourceType/:namespaceResourceName',
      end: false,
    })?.params ?? {};

  const { clusterResourceType = '', clusterResourceName = '' } =
    useMatch({
      path: '/cluster/:cluster/:clusterResourceType/:clusterResourceName',
      end: false,
    })?.params ?? {};

  const resourceType = namespace ? namespaceResourceType : clusterResourceType;
  const resourceName = namespace ? namespaceResourceName : clusterResourceName;

  const { data, loading } = useGetList(
    crd => pluralize(crd.spec.names.kind.toLowerCase()) === resourceType,
  )(resourceUrl, { skip: !extensions?.length });

  if (!extensions?.length && extensions?.length !== 0) return null;

  if (!data && loading) {
    return <Spinner />;
  }

  if (data?.length !== 0 && data !== null) {
    const crdGroup = data[0]?.spec?.group;

    const path = `customresources/${resourceType}.${crdGroup}/${resourceName}`;

    const link = namespace ? namespaceUrl(path) : clusterUrl(path);

    if (link && crdGroup) {
      notificationManager.notifySuccess({
        content: t('components.incorrect-path.message.extensions'),
      });
      navigate(link);
    }
  }

  return (
    <MessageBox
      type="Warning"
      titleText={title}
      className="ui5-content-density-compact"
      actions={[
        <Button
          design="Attention"
          onClick={() => navigate(to)}
        >
          {t('common.buttons.ok')}
        </Button>,
      ]}
      open={true}
      onClose={() => {}}
    >
      <p>{message}</p>
    </MessageBox>
  );
}
