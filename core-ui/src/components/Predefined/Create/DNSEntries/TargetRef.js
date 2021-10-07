import React from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'fundamental-react';
import { useGetList } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { CollapsibleSection } from 'shared/ResourceForm/components/FormComponents';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

export function TargetRef({
  dnsEntry,
  required,
  setResource,
  withCNAME,
  setWithCNAME,
  onChange,
}) {
  const { t } = useTranslation();
  const { data: services } = useGetList()(`/api/v1/services`);

  const loadBalancers = (services || []).filter(
    service => service.spec.type === 'LoadBalancer',
  );
  const IPs = (loadBalancers || []).map(lb => ({
    key: lb.spec.clusterIP,
    text: `${lb.spec.clusterIP} (${lb.metadata.name})`,
  }));

  return (
    <CollapsibleSection
      title={t('dnsentries.labels.targets')}
      tooltipContent={t('dnsentries.labels.targets')}
      resource={dnsEntry}
      setResource={setResource}
      actions={[]}
      defaultOpen
      required
    >
      <ResourceForm.FormField
        label={t('dnsentries.labels.use-cname')}
        input={() => (
          <>
            <Switch
              compact
              onChange={() => setWithCNAME(!withCNAME)}
              checked={withCNAME}
            />
          </>
        )}
      />
      {withCNAME ? (
        <ResourceForm.FormField
          required
          label={t('dnsentries.labels.target')}
          tooltipContent={t('dnsentries.labels.target')}
          placeholder={t('dnsentries.placeholders.target')}
          propertyPath="$.spec.targets[0]"
          input={Inputs.Text}
        />
      ) : (
        <ResourceForm.FormField
          required
          label={t('dnsentries.labels.target')}
          propertyPath="$.spec.targets[0]"
          setValue={onChange}
          input={props => <ResourceForm.Select options={IPs} {...props} />}
        />
      )}
    </CollapsibleSection>
  );
}
