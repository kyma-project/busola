import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetList } from 'react-shared';
import { Button, Switch, FormInput } from 'fundamental-react';
import classnames from 'classnames';

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
      <ul className="text-array-input__list fd-col fd-col-md--12">
        {internalValue.map((entry, index) => (
          <li key={index}>
            {inputs.map(input =>
              input({
                index,
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

export function TargetsRef({ value: dnsEntry, setValue: setTargets }) {
  const { t } = useTranslation();
  const { data: services } = useGetList()(`/api/v1/services`);

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
        ({ value, setValue, index }) => (
          <div className="fd-col fd-col-md--4">
            <div className="fd-row form-field multi-input">
              <div className="fd-col fd-col-md--5">
                <Label tooltipContent={t('dnsentries.tooltips.use-cname')}>
                  {t('dnsentries.use-cname')}
                </Label>
              </div>
              <div className="fd-col fd-col-md--7">
                <Switch
                  key={`targets-switch-${index}`}
                  compact
                  onChange={e =>
                    setValue({ ...value, isCname: !value?.isCname })
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
              <div className="fd-col fd-col-md--7">
                <FormInput
                  key={`targets-input-${index}`}
                  compact
                  value={value?.target || ''}
                  onChange={e => setValue({ ...value, target: e.target.value })}
                />
              </div>
            );
          } else {
            return (
              <div className="fd-col fd-col-md--7">
                <ResourceForm.Select
                  key={`taregts-select-${index}`}
                  options={IPs}
                  value={value?.target}
                  setValue={key => setValue({ ...value, target: key })}
                />
              </div>
            );
          }
        },
      ]}
    />
  );
}
