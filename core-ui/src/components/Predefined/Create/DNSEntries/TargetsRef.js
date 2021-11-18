import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Switch, FormInput } from 'fundamental-react';
import classnames from 'classnames';
import { useGetList, Spinner } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { Label } from 'shared/ResourceForm/components/FormComponents';

import './TargetsRef.scss';

export function TargetsInput({
  value,
  setValue,
  toInternal,
  toExternal,
  inputs,
}) {
  const { t } = useTranslation();
  const [internalValue, setInternalValue] = useState([]);

  useEffect(() => {
    if (
      !internalValue.length ||
      internalValue[internalValue.length - 1]?.target
    ) {
      setInternalValue([...internalValue, null]);
    }
  }, [internalValue]);

  useEffect(() => {
    setInternalValue([...toInternal(value), null]);
  }, [value, toInternal]);

  const isLast = index => index === internalValue.length - 1;

  const updateValue = val => setValue(toExternal(val));

  const removeValue = index => {
    internalValue.splice(index, 1);
    setInternalValue([...internalValue]);
    updateValue(internalValue);
  };

  const setEntry = (newVal, index) => {
    setInternalEntry(newVal, index);
    updateValue(internalValue);
  };

  const setInternalEntry = (newVal, index) => {
    internalValue[index] = newVal;
    setInternalValue([...internalValue]);
  };

  return (
    <div className="fd-row form-field multi-input">
      <div className="fd-col fd-col-md--3">
        <Label required tooltipContent={t('dnsentries.tooltips.target')}>
          {t('dnsentries.labels.target')}
        </Label>
      </div>
      <ul className="text-array-input__list fd-col fd-col-md--8">
        {internalValue.map((entry, index) => (
          <li key={index}>
            {inputs.map((input, i) =>
              input({
                index: i,
                value: entry,
                setValue: entry => setEntry(entry, index),
                setInternalValue: entry => setInternalEntry(entry, index),
              }),
            )}
            <Button
              compact
              className={classnames({ hidden: isLast(index) })}
              glyph="delete"
              type="negative"
              onClick={() => removeValue(index)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

const getExternalIPs = loadBalancer => {
  if (loadBalancer.status.loadBalancer?.ingress) {
    return loadBalancer.status.loadBalancer?.ingress.map(endpoint => ({
      key: endpoint.ip || endpoint.hostname,
      text: `${endpoint.ip || endpoint.hostname} (${
        loadBalancer.metadata.name
      })`,
    }));
  } else if (loadBalancer.spec.externalIPs?.length) {
    return loadBalancer.spec.externalIPs.map(ip => ({
      key: ip,
      text: `${ip} (${loadBalancer.metadata.name})`,
    }));
  }
};

export function TargetsRef({ dnsEntry, setTargets, setDnsEntry }) {
  const { t } = useTranslation();
  const { data: services, loading } = useGetList()(`/api/v1/services`);
  if (loading) return <Spinner />;

  const targets = dnsEntry?.spec.targets || [];
  console.log(services);
  const loadBalancers = services?.filter(
    service =>
      service.spec.type === 'LoadBalancer' &&
      (service.status.loadBalancer?.ingress ||
        service.spec.externalIPs?.length),
  );
  console.log(loadBalancers);

  const IPs = (loadBalancers || []).flatMap(lb => getExternalIPs(lb));
  console.log(IPs);

  const isCname = value => {
    return !!IPs?.find(ip => value === ip.key);
  };

  return (
    <ResourceForm.CollapsibleSection
      title={t('dnsentries.labels.targets')}
      required
      defaultOpen
      resource={dnsEntry}
      setResource={setDnsEntry}
      propertyPath="$.spec.targets"
      className="targets-ref"
    >
      <TargetsInput
        toInternal={value =>
          value?.map(target => ({ target, isCname: isCname(target) })) || []
        }
        toExternal={value =>
          value
            ?.filter(v => !!v)
            .map(target => target.target)
            .filter(t => !!t)
        }
        value={targets}
        setValue={setTargets}
        inputs={[
          ({ value, index, setInternalValue }) => (
            <div className="fd-col fd-col-md--3" key={index}>
              <div className="fd-row form-field multi-input__row">
                <Label
                  tooltipContent={
                    value?.isCname
                      ? t('dnsentries.tooltips.use-a')
                      : t('dnsentries.tooltips.use-cname')
                  }
                >
                  {t('dnsentries.labels.use-cname')}
                </Label>
                <div>
                  <Switch
                    key={`targets-switch-${index}`}
                    compact
                    onChange={e =>
                      setInternalValue({ ...value, isCname: !value?.isCname })
                    }
                    checked={value?.isCname}
                  />
                </div>
              </div>
            </div>
          ),
          ({ value, setValue, index }) => {
            if (value?.isCname) {
              return (
                <div className="fd-col fd-col-md--9" key={index}>
                  <FormInput
                    key={`targets-input-${index}`}
                    compact
                    value={value?.target?.value || ''}
                    placeholder={t('dnsentries.placeholders.target-cname')}
                    onChange={e =>
                      setValue({ ...value, target: e.target.value })
                    }
                  />
                </div>
              );
            } else {
              return (
                <div className="fd-col fd-col-md--9" key={index}>
                  <ResourceForm.ComboboxInput
                    key={`targets-select-${index}`}
                    options={IPs}
                    defaultKey={value?.target?.key}
                    typedValue={value?.target?.value}
                    placeholder={t('dnsentries.placeholders.target-a')}
                    selectionType="manual"
                    setValue={key => setValue({ ...value, target: key })}
                  />
                </div>
              );
            }
          },
        ]}
      />
    </ResourceForm.CollapsibleSection>
  );
}
