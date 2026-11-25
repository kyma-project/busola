import { useTranslation } from 'react-i18next';
import { GoToDetailsLink } from 'shared/components/ControlledBy/ControlledBy';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { FormGroup } from '@ui5/webcomponents-react';
import { useAtomValue } from 'jotai';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { useUrl } from 'hooks/useUrl';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';
import { Link } from 'shared/components/Link/Link';

interface PortProps {
  serviceName: string;
  port: any;
  services: any[] | null;
}

const Port = ({ serviceName, port, services }: PortProps) => {
  const { namespaceUrl } = useUrl();

  const serviceLink = services?.find(
    ({ metadata }: any) => metadata.name === serviceName,
  ) ? (
    <Link url={namespaceUrl(`services/${serviceName}`)}>{serviceName}</Link>
  ) : (
    <span>{serviceName || EMPTY_TEXT_PLACEHOLDER}</span>
  );

  // A service backend refers to its port either by number or by name.
  const portValue = port?.number ?? port?.name;
  if (!portValue) {
    return EMPTY_TEXT_PLACEHOLDER;
  }

  return (
    <>
      {serviceLink}:{portValue}
    </>
  );
};

interface RulesProps {
  rules: any[];
}

export const Rules = ({ rules }: RulesProps) => {
  const { t } = useTranslation();
  const namespace = useAtomValue(activeNamespaceIdAtom);

  const { data: services } = useGetList()(
    `/api/v1/namespaces/${namespace}/services`,
  ) as { data: any[] | null };

  const Backend = ({
    backend,
    services,
  }: {
    backend: any;
    services: any[] | null;
  }) => {
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
              apiVersion={backend.resource.apiGroup}
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
    <UI5Card
      title={t('ingresses.labels.rules')}
      accessibleName={t('ingresses.accessible-name.rules')}
    >
      {/* One column: each rule's group holds its paths table. */}
      <ResourceDetailsForm layout="S1 M1 L1 XL1">
        {rules.map((rule, i) => (
          // A rule without a host matches every host; kubectl shows it as *.
          <FormGroup key={`rule-${i}`} headerText={rule.host ?? '*'}>
            <GenericList
              title={t('ingresses.labels.paths')}
              headerRenderer={() => [
                t('ingresses.labels.path'),
                t('ingresses.labels.path-type'),
                t('ingresses.labels.backend'),
              ]}
              rowRenderer={(path: any) => [
                path.path,
                path.pathType,
                <Backend
                  key={path.path}
                  backend={path.backend}
                  services={services}
                />,
              ]}
              entries={rule?.http?.paths}
              searchSettings={{
                showSearchField: false,
              }}
            />
          </FormGroup>
        ))}
      </ResourceDetailsForm>
    </UI5Card>
  );
};
