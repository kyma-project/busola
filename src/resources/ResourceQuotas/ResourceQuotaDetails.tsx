import { Fragment } from 'react';
import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ResourceDescription } from '.';
import ResourceQuotaCreate from './ResourceQuotaCreate';
import ResourceQuotaLimits from './ResourceQuotaLimits';
import { ResourceDetailsForm } from 'shared/components/ResourceDetails/ResourceDetailsForm';
import { ResourceDetailsFormItem } from 'shared/components/ResourceDetails/ResourceDetailsFormItem';
import { useTranslation } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';
import { FormGroup } from '@ui5/webcomponents-react';
import { UI5RadialChart } from 'shared/components/UI5RadialChart/UI5RadialChart';
import {
  mapLimitsAndRequestsToChartsData,
  mapUsagesToChartsData,
} from './support';
import { usePodsMetricsQuery } from 'resources/Pods/podQueries';
import { UI5Card } from 'shared/components/UI5Card/UI5Card';

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
          <UI5Card
            title={t('common.headers.specification')}
            accessibleName={t('common.accessible-name.specification')}
          >
            <ResourceDetailsForm>
              {resource.spec?.scopes && (
                <FormGroup>
                  <ResourceDetailsFormItem
                    label={t('resource-quotas.headers.scopes')}
                    value={<Tokens tokens={resource.spec.scopes} />}
                  />
                </FormGroup>
              )}
              {resource.spec.scopeSelector?.matchExpressions?.map((scope) => (
                <FormGroup key={scope.scopeName} headerText={scope.scopeName}>
                  <ResourceDetailsFormItem
                    label={t('resource-quotas.headers.operator')}
                    value={scope.operator}
                  />
                  {scope.values && (
                    <ResourceDetailsFormItem
                      label={t('resource-quotas.headers.values')}
                      value={<Tokens tokens={scope.values} />}
                    />
                  )}
                </FormGroup>
              ))}
            </ResourceDetailsForm>
          </UI5Card>
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
            <div className="cluster-stats">
              {monitoringCharts.map((chartData, index) => (
                <div
                  key={`${chartData.headerTitle}-${index}`}
                  className="item-wrapper card-tall"
                >
                  <UI5RadialChart
                    tooltipInfo={t(chartData.tooltipInfo)}
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
