import { ResourceDetails } from 'shared/components/ResourceDetails/ResourceDetails';
import { ResourceDescription } from '.';
import ResourceQuotaCreate from './ResourceQuotaCreate';
import ResourceQuotaLimits, { ResourceQuotaProps } from './ResourceQuotaLimits';
import { UI5Panel } from 'shared/components/UI5Panel/UI5Panel';
import { LayoutPanelRow } from 'shared/components/LayoutPanelRow/LayoutPanelRow';
import { useTranslation } from 'react-i18next';
import { Tokens } from 'shared/components/Tokens';
import { GroupHeaderListItem, List, Text } from '@ui5/webcomponents-react';
import { spacing } from '@ui5/webcomponents-react-base';
import { ReactNode } from 'react';

function ResourceQuotaRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="resource-quota-spec-row" style={spacing.sapUiSmallMargin}>
      <Text className="resource-quota-spec-row-label bsl-has-color-status-4">
        {label + ':'}
      </Text>
      {value}
    </div>
  );
}

export default function ResourceQuotaDetails(props: any) {
  const { t } = useTranslation();

  const customComponents = [
    (resource: ResourceQuotaProps) => {
      return (
        <>
          {(resource.spec.scopes || resource.spec.scopeSelector) && (
            <UI5Panel
              title={t('common.headers.specification')}
              headerActions={null}
            >
              {resource.spec?.scopes && (
                <LayoutPanelRow
                  name={t('resource-quotas.headers.scopes')}
                  value={<Tokens tokens={resource.spec.scopes} />}
                />
              )}
              {resource.spec?.scopeSelector && (
                <List headerText={t('resource-quotas.headers.scope-selectors')}>
                  {resource.spec.scopeSelector?.matchExpressions?.map(scope => (
                    <>
                      <GroupHeaderListItem>
                        {scope.scopeName}
                      </GroupHeaderListItem>
                      <ResourceQuotaRow
                        label={t('resource-quotas.headers.operator')}
                        value={<Text>{scope.operator}</Text>}
                      />
                      {scope.values && (
                        <ResourceQuotaRow
                          label={t('resource-quotas.headers.values')}
                          value={<Tokens tokens={scope.values} />}
                        />
                      )}
                    </>
                  ))}
                </List>
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
