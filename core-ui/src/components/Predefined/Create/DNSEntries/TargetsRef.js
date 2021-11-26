import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Switch, FormInput, ComboboxInput } from 'fundamental-react';
import classnames from 'classnames';
import { useGetList, Spinner } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm';

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
        <ResourceForm.Label
          required
          tooltipContent={t('dnsentries.tooltips.target')}
        >
          {t('dnsentries.labels.target')}
        </ResourceForm.Label>
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

let memoizedServices = null;
export function TargetsRef({ resource: dnsEntry, setResource: setDnsEntry }) {
  const { t } = useTranslation();

  const { data, loading } = useGetList()(`/api/v1/services`);
  useEffect(() => {
    if (data) {
      memoizedServices = data;
    }
  }, [data]);
  const services = memoizedServices || data;
  if (loading && !services) return <Spinner />;

  const loadBalancers = services?.filter(
    service =>
      service.spec.type === 'LoadBalancer' &&
      (service.status.loadBalancer?.ingress ||
        service.spec.externalIPs?.length),
  );

  const IPs = (loadBalancers || []).flatMap(lb => getExternalIPs(lb));

  const isCname = value => {
    return !IPs?.find(ip => value === ip.key);
  };

  return (
    <ResourceForm.CollapsibleSection
      title={t('dnsentries.labels.targets')}
      required
      defaultOpen
      resource={dnsEntry}
      setResource={setDnsEntry}
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
        propertyPath="$.spec.targets"
        inputs={[
          ({ value, index, setInternalValue }) => (
            <div className="fd-col fd-col-md--3" key={index}>
              <div className="fd-row form-field multi-input__row">
                <ResourceForm.Label
                  tooltipContent={
                    value?.isCname
                      ? t('dnsentries.tooltips.use-a')
                      : t('dnsentries.tooltips.use-cname')
                  }
                >
                  {t('dnsentries.labels.use-cname')}
                </ResourceForm.Label>
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
                    value={value?.target || ''}
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
                  <ComboboxInput
                    compact
                    id={'targets-ref'}
                    ariaLabel="Combobox input"
                    arrowLabel={t('dnsentries.placeholders.target-a')}
                    showAllEntries
                    searchFullString
                    options={IPs}
                    selectedKey={value?.target}
                    selectionType="manual"
                    placeholder={t('dnsentries.placeholders.target-a')}
                    onSelectionChange={(_, selected) => {
                      if (selected.key !== -1) {
                        setValue({ ...value, target: selected.key });
                      } else {
                        setValue({ ...value, target: selected.text });
                      }
                    }}
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
