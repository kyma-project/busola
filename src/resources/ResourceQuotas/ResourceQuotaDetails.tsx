import { Fragment } from 'react';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ResourceDescription } from '.';
import ResourceQuotaCreate from './ResourceQuotaCreate';
import ResourceQuotaLimits from './ResourceQuotaLimits';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useTranslation } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';
import { Text, Title } from '@ui5/webcomponents-react';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import {
  mapLimitsAndRequestsToChartsData,
  mapUsagesToChartsData,
} from './support';
import { usePodsMetricsQuery } from 'resources/Pods/podQueries';

export type ResourceQuota = {
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
  const { podsMetrics } = usePodsMetricsQuery(props.namespace);

  const customComponents = [
    (resource: ResourceQuota) => (
      <Fragment key="resource-quota-details">
        {(resource.spec.scopes || resource.spec.scopeSelector) && (
          <UI5Panel
            title={t('common.headers.specification')}
            accessibleName={t('common.accessible-name.specification')}
          >
            {resource.spec?.scopes && (
              <LayoutPanelRow
                name={t('resource-quotas.headers.scopes')}
                value={<Tokens tokens={resource.spec.scopes} />}
              />
            )}
            {resource.spec?.scopeSelector && (
              <UI5Panel
                title={t('resource-quotas.headers.scope-selectors')}
                accessibleName={`${t('resource-quotas.headers.scope-selectors')} panel`}
              >
                {resource.spec.scopeSelector?.matchExpressions?.map((scope) => (
                  <Fragment key={scope.scopeName}>
                    <Title
                      level="H6"
                      size="H6"
                      className="resource-quota-spec-subheader sap-margin-small"
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
                  </Fragment>
                ))}
              </UI5Panel>
            )}
          </UI5Panel>
        )}
      </Fragment>
    ),
    (resource: ResourceQuota) => {
      const monitoringCharts = [
        ...mapUsagesToChartsData(podsMetrics),
        ...mapLimitsAndRequestsToChartsData(resource),
      ];

      return (
        <Fragment key="resource-quota-limits">
          {!!monitoringCharts.length && (
            <div className="cluster-stats sap-margin-tiny">
              {monitoringCharts.map((chartData, index) => (
                <div
                  key={`${chartData.headerTitle}-${index}`}
                  className="item-wrapper card-tall"
                >
                  <UI5RadialChart
                    color={chartData.color}
                    value={chartData.value}
                    max={chartData.max}
                    titleText={t(chartData.headerTitle)}
                    additionalInfo={chartData.additionalInfo}
                    accessibleName={t(chartData.headerTitle)}
                  />
                </div>
              ))}
            </div>
          )}
          <ResourceQuotaLimits resource={resource} />
        </Fragment>
      );
    },
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
