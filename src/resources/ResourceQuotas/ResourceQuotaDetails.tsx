import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ResourceDescription } from '.';
import ResourceQuotaCreate from './ResourceQuotaCreate';
import ResourceQuotaLimits from './ResourceQuotaLimits';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useTranslation } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';
import { Text, Title } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';

export type ResourceQuotaProps = {
  kind: string;
  apiVersion: string;
  metadata: {
    name: string;
    namespace: string;
  };
  spec: {
    scopes?: string[];
    hard: {
      [key: string]: string;
    };
    scopeSelector?: {
      matchExpressions: {
        scopeName: string;
        operator: string;
        values?: string[];
      }[];
    };
  };
  status: {
    hard: {
      [key: string]: string;
    };
    used: {
      [key: string]: string;
    };
  };
};

export default function ResourceQuotaDetails(props: any) {
  const { t } = useTranslation();

  const customComponents = [
    (resource: ResourceQuotaProps) => {
      return (
        <>
          {(resource.spec.scopes || resource.spec.scopeSelector) && (
            <UI5Panel title={t('common.headers.specification')}>
              {resource.spec?.scopes && (
                <LayoutPanelRow
                  name={t('resource-quotas.headers.scopes')}
                  value={<Tokens tokens={resource.spec.scopes} />}
                />
              )}
              {resource.spec?.scopeSelector && (
                <UI5Panel title={t('resource-quotas.headers.scope-selectors')}>
                  {resource.spec.scopeSelector?.matchExpressions?.map(scope => (
                    <>
                      <Title
                        level="H6"
                        className="resource-quota-spec-subheader"
                        style={spacing.sapUiSmallMargin}
                      >
                        {scope.scopeName}
                      </Title>
                      <LayoutPanelRow
                        name={t('resource-quotas.headers.operator')}
                        value={<Text>{scope.operator}</Text>}
                      />
                      {scope.values && (
                        <LayoutPanelRow
                          name={t('resource-quotas.headers.values')}
                          value={<Tokens tokens={scope.values} />}
                        />
                      )}
                    </>
                  ))}
                </UI5Panel>
              )}
            </UI5Panel>
          )}
        </>
      );
    },
    (resource: ResourceQuotaProps) => (
      <ResourceQuotaLimits resource={resource} />
    ),
  ];

  return (
    <ResourceDetails
      description={ResourceDescription}
      createResourceForm={ResourceQuotaCreate}
      customComponents={customComponents}
      {...props}
    />
  );
}
