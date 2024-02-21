import { useTranslation, Trans } from 'react-i18next';
import { ServiceAccountTokenStatus } from 'shared/components/ServiceAccountTokenStatus';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import { ServiceAccountCreate } from './ServiceAccountCreate';

export function ServiceAccountList(props) {
  const { t } = useTranslation();
  const customColumns = [
    {
      header: t('service-accounts.headers.auto-mount-token'),
      value: value => (
        <ServiceAccountTokenStatus
          automount={value.automountServiceAccountToken}
        />
      ),
    },
  ];

  const description = (
    <Trans i18nKey="service-accounts.description">
      <ExternalLink
        className="bsl-link"
        url="https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      resourceTitle={t('service-accounts.title')}
      {...props}
      createResourceForm={ServiceAccountCreate}
      emptyListProps={{
        subtitleText: t('service-accounts.description'),
        url:
          'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/',
      }}
    />
  );
}

export default ServiceAccountList;
