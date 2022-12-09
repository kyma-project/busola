import React from 'react';
import { useTranslation } from 'react-i18next';
import { GoToDetailsLink } from 'shared/components/ControlledBy/ControlledBy';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { LayoutPanel } from 'fundamental-react';
import { Link } from 'react-router-dom';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useRecoilValue } from 'recoil';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { useUrl } from 'hooks/useUrl';

const Port = ({ serviceName, port, services }) => {
  const { namespaceUrl } = useUrl();

  const serviceLink = services?.find(
    ({ metadata }) => metadata.name === serviceName,
  ) ? (
    <Link to={namespaceUrl(`services/${serviceName}`)}>{serviceName}</Link>
  ) : (
    <span>{serviceName || EMPTY_TEXT_PLACEHOLDER}</span>
  );

  if (port?.number) {
    return port.name ? (
      `${port.name}:${port.number}`
    ) : (
      <>
        {serviceLink}:{port.number}
      </>
    );
  } else {
    return EMPTY_TEXT_PLACEHOLDER;
  }
};

export const Rules = ({ rules }) => {
  const { t } = useTranslation();
  const namespace = useRecoilValue(activeNamespaceIdState);

  const { data: services } = useGetList()(
    `/api/v1/namespaces/${namespace}/services`,
  );

  const Backend = ({ backend, services }) => {
    if (backend.service) {
      return (
        <Port
          serviceName={backend?.service.name}
          port={backend?.service?.port}
          services={services}
        />
      );
    } else if (backend.resource) {
      return (
        <>
          <p>
            {t('ingresses.labels.apiGroup')}: {backend.resource.apiGroup}
          </p>
          <p>
            {t('ingresses.labels.kind')}: {backend.resource.kind}
          </p>
          <p>
            {t('common.labels.name')}:{' '}
            <GoToDetailsLink
              kind={backend.resource.kind}
              name={backend.resource.name}
              noBrackets
            />
          </p>
        </>
      );
    } else {
      return EMPTY_TEXT_PLACEHOLDER;
    }
  };

  return (
    <>
      {rules.map((rule, i) => (
        <LayoutPanel key={`rule.host${i}`} className="fd-margin--md rule-panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head title={t('ingresses.labels.rules')} />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            {rule.host && (
              <LayoutPanelRow
                name={t('ingresses.labels.host')}
                value={rule.host}
              />
            )}
          </LayoutPanel.Body>
          <GenericList
            className="fd-margin-top--none"
            key={`rules${i}`}
            title={t('ingresses.labels.paths')}
            headerRenderer={() => [
              t('ingresses.labels.path'),
              t('ingresses.labels.path-type'),
              t('ingresses.labels.backend'),
            ]}
            rowRenderer={path => [
              path.path,
              path.pathType,
              <Backend backend={path.backend} services={services} />,
            ]}
            entries={rule?.http?.paths}
            searchSettings={{
              showSearchField: false,
            }}
          />
        </LayoutPanel>
      ))}
    </>
  );
};
