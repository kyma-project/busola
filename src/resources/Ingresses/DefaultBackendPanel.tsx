import { useTranslation } from 'react-i18next';
import { GoToDetailsLink } from 'shared/components/ControlledBy/ControlledBy';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { useUrl } from 'hooks/useUrl';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import { Link } from 'shared/components/Link/Link';

interface DefaultBackendPanelProps {
  backend: any;
  namespace: string;
}

export const DefaultBackendPanel = ({
  backend,
  namespace,
}: DefaultBackendPanelProps) => {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();
  const { data: services } = useGetList()(
    `/api/v1/namespaces/${namespace}/services`,
  ) as { data: any[] | null };

  return (
    <UI5Card
      title={t('ingresses.labels.default-backend')}
      accessibleName={t('ingresses.accessible-name.default-backend')}
    >
      <ResourceDetailsForm>
        {backend.service && (
          <>
            {backend.service.name && (
              <ResourceDetailsFormItem
                label={t('ingresses.labels.service-name')}
                value={
                  services?.find(
                    ({ metadata }: any) =>
                      metadata.name === backend?.service.name,
                  ) ? (
                    <Link
                      url={namespaceUrl(`services/${backend?.service.name}`)}
                    >
                      {backend?.service.name}
                    </Link>
                  ) : (
                    backend.service.name
                  )
                }
              />
            )}
            {backend.service?.port && (
              <>
                <ResourceDetailsFormItem
                  label={t('ingresses.labels.port-name')}
                  value={backend.service.port.name}
                />
                <ResourceDetailsFormItem
                  label={t('ingresses.labels.port-number')}
                  value={backend.service.port.number}
                />
              </>
            )}
          </>
        )}

        {backend.resource && (
          <>
            <ResourceDetailsFormItem
              label={t('ingresses.labels.apiGroup')}
              value={backend.resource.apiGroup}
            />
            <ResourceDetailsFormItem
              label={t('ingresses.labels.kind')}
              value={backend.resource.kind}
            />
            <ResourceDetailsFormItem
              label={t('common.labels.name')}
              value={
                services?.find(
                  ({ metadata }: any) =>
                    metadata.name === backend.resource.name,
                ) ? (
                  <GoToDetailsLink
                    kind={backend.resource.kind}
                    apiVersion={backend.resource.apiGroup}
                    name={backend.resource.name}
                    noBrackets
                  />
                ) : (
                  backend.resource.name
                )
              }
            />
          </>
        )}
      </ResourceDetailsForm>
    </UI5Card>
  );
};
