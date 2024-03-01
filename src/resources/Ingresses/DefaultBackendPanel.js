import { useTranslation } from 'react-i18next';
import { GoToDetailsLink } from 'shared/components/ControlledBy/ControlledBy';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useUrl } from 'hooks/useUrl';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { Link } from 'shared/components/Link/Link';

export const DefaultBackendPanel = ({ backend, namespace }) => {
  const { t } = useTranslation();
  const { namespaceUrl } = useUrl();
  const { data: services } = useGetList()(
    `/api/v1/namespaces/${namespace}/services`,
  );

  return (
    <UI5Panel title={t('ingresses.labels.default-backend')}>
      {backend.service && (
        <>
          {backend.service.name && (
            <LayoutPanelRow
              name={t('ingresses.labels.service-name')}
              value={
                services?.find(
                  ({ metadata }) => metadata.name === backend?.service.name,
                ) ? (
                  <Link url={namespaceUrl(`services/${backend?.service.name}`)}>
                    {backend?.service.name}
                  </Link>
                ) : (
                  <p>{backend?.service.name || EMPTY_TEXT_PLACEHOLDER}</p>
                )
              }
            />
          )}
          {backend.service?.port && (
            <>
              <LayoutPanelRow
                name={t('ingresses.labels.port-name')}
                value={backend?.service.port.name || EMPTY_TEXT_PLACEHOLDER}
              />
              <LayoutPanelRow
                name={t('ingresses.labels.port-number')}
                value={backend?.service.port.number || EMPTY_TEXT_PLACEHOLDER}
              />
            </>
          )}
        </>
      )}

      {backend.resource && (
        <>
          <LayoutPanelRow
            name={t('ingresses.labels.apiGroup')}
            value={backend.resource.apiGroup || EMPTY_TEXT_PLACEHOLDER}
          />
          <LayoutPanelRow
            name={t('ingresses.labels.kind')}
            value={backend.resource.kind || EMPTY_TEXT_PLACEHOLDER}
          />
          <LayoutPanelRow
            name={t('common.labels.name')}
            value={
              services?.find(
                ({ metadata }) => metadata.name === backend.resource.name,
              ) ? (
                <GoToDetailsLink
                  kind={backend.resource.kind}
                  name={backend.resource.name}
                  noBrackets
                />
              ) : (
                <p>{backend.resource.name || EMPTY_TEXT_PLACEHOLDER}</p>
              )
            }
          />
        </>
      )}
    </UI5Panel>
  );
};
