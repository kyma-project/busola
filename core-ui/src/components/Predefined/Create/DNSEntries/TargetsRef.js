import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetList } from 'react-shared';
import { Button, MessageStrip, Switch } from 'fundamental-react';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

function SingleTargetSection({ target, setTarget, IPs }) {
  const [withCNAME, setWithCNAME] = useState(false);
  const { t } = useTranslation();

  return (
    <ResourceForm.Wrapper resource={target} setResource={setTarget}>
      <ResourceForm.FormField
        required
        label={t('common.headers.name')}
        propertyPath={''}
        input={() => (
          <>
            <ResourceForm.FormField
              label={t('dnsentries.labels.use-cname')}
              input={() => (
                <Switch
                  compact
                  onChange={() => setWithCNAME(!withCNAME)}
                  checked={withCNAME}
                />
              )}
            />
            {withCNAME ? (
              <ResourceForm.FormField
                required
                label={t('dnsentries.labels.target')}
                tooltipContent={t('dnsentries.labels.target')}
                placeholder={t('dnsentries.placeholders.target')}
                setValue={value => {
                  setTarget(value);
                }}
                input={Inputs.Text}
              />
            ) : (
              <ResourceForm.FormField
                required
                label={t('dnsentries.labels.target')}
                value={target}
                setValue={value => {
                  setTarget(value);
                }}
                input={props => (
                  <ResourceForm.Select options={IPs} {...props} />
                )}
              />
            )}
          </>
        )}
      />
    </ResourceForm.Wrapper>
  );
}

export function TargetsRef({ value: dnsEntry, setValue: setTargets }) {
  const { t } = useTranslation();
  const { data: services } = useGetList()(`/api/v1/services`);

  const targets = dnsEntry.spec.targets || [];
  const loadBalancers = (services || []).filter(
    service => service.spec.type === 'LoadBalancer',
  );
  const IPs = (loadBalancers || []).map(lb => ({
    key: lb.spec.clusterIP,
    text: `${lb.spec.clusterIP} (${lb.metadata.name})`,
  }));

  const removeTarget = index => {
    setTargets(targets.filter((_, i) => index !== i));
  };

  if (!targets.length) {
    return (
      <MessageStrip type="warning">
        {t('deployments.create-modal.advanced.one-target-required')}
      </MessageStrip>
    );
  }

  if (targets.length === 1) {
    return (
      <SingleTargetSection
        IPs={IPs}
        target={targets[0]}
        setTarget={newTarget => {
          targets.splice(0, 1, newTarget);
          setTargets(targets);
        }}
      />
    );
  }

  return targets.map((target, i) => (
    <ResourceForm.CollapsibleSection
      defaultOpen
      key={i}
      title={t('deployments.create-modal.advanced.target-header', {
        name: target || i + 1,
      })}
      actions={
        <Button
          glyph="delete"
          type="negative"
          compact
          onClick={() => removeTarget(i)}
        />
      }
    >
      <SingleTargetSection
        IPs={IPs}
        target={target || {}}
        setTarget={newTarget => {
          targets.splice(i, 1, newTarget);
          setTargets(targets);
        }}
      />
    </ResourceForm.CollapsibleSection>
  ));
}
