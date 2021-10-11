import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetList } from 'react-shared';
import { Button, Switch, FormInput } from 'fundamental-react';
import classnames from 'classnames';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { Label } from 'shared/ResourceForm/components/FormComponents';

export function TargetsInput({
  value,
  setValue,
  title,
  label,
  tooltipContent,
  toInternal,
  toExternal,
  inputs,
  className,
  isAdvanced,
  defaultOpen,
  ...props
}) {
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
    internalValue[index] = newVal;
    setInternalValue([...internalValue]);
    updateValue(internalValue);
  };

  return (
    <div className="fd-row form-field multi-input">
      <div className="fd-col fd-col-md--4">
        <Label tooltipContent={tooltipContent}>Use CNAME</Label>
      </div>
      <ul className="text-array-input__list fd-col fd-col-md--7">
        {internalValue.map((entry, index) => (
          <li key={index}>
            {inputs.map(input =>
              input({
                value: entry,
                setValue: entry => setEntry(entry, index),
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

export function TargetsRef({
  value: dnsEntry,
  setValue: setTargets,
  advanced,
}) {
  const { t } = useTranslation();
  const { data: services, loading } = useGetList()(`/api/v1/services`);
  if (loading) return <></>;

  const targets = dnsEntry.spec.targets || [];
  const loadBalancers = services?.filter(
    service => service.spec.type === 'LoadBalancer',
  );
  const IPs = (loadBalancers || []).map(lb => ({
    key: lb.spec.clusterIP,
    text: `${lb.spec.clusterIP} (${lb.metadata.name})`,
  }));

  const isCname = value => {
    return !IPs?.find(ip => value === ip.key);
  };

  return (
    <TargetsInput
      defaultOpen
      isAdvanced={false}
      toInternal={value =>
        value?.map(target => ({ target, isCname: isCname(target) })) || []
      }
      toExternal={value =>
        value
          ?.filter(v => !!v)
          .map(target => target.target)
          .filter(t => !!t)
      }
      // tooltipContent={'ddd'}
      value={targets}
      setValue={setTargets}
      inputs={[
        ({ value, setValue }) => (
          <>
            <Label></Label>
            <Switch
              compact
              onChange={e => setValue({ ...value, isCname: !value?.isCname })}
              checked={value?.isCname}
            />
          </>
        ),
        ({ value, setValue }) => {
          if (value?.isCname) {
            return (
              <FormInput
                key={`form-`}
                compact
                value={value?.target || ''}
                onChange={e => setValue({ ...value, target: e.target.value })}
              />
            );
          } else {
            return (
              <ResourceForm.Select
                options={IPs}
                value={value?.target}
                setValue={key => setValue({ ...value, target: key })}
              />
            );
          }
        },
      ]}
    />
  );
}
