import { Button, MessageBox } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useMatch, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { extensionsState } from 'state/navigation/extensionsAtom';

import './IncorrectPath.scss';
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

  const { data } = useGetList(
    crd => pluralize(crd.spec.names.kind.toLowerCase()) === resourceType,
  )(resourceUrl, { skip: !extensions?.length });

  if (!extensions?.length && extensions?.length !== 0) return null;

  if (!data && data !== null) {
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
      type="warning"
      title={title}
      className="incorrect-path-message-box"
      actions={[
        <Button
          data-testid="delete-confirmation"
          type="attention"
          compact
          onClick={() => navigate(to)}
        >
          {t('common.buttons.ok')}
        </Button>,
      ]}
      show={true}
    >
      <p>{message}</p>
    </MessageBox>
  );
}
