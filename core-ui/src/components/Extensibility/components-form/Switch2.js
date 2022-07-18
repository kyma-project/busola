import * as Inputs from 'shared/ResourceForm/inputs';
import { ResourceForm } from 'shared/ResourceForm';
import React from 'react';
import { useGetTranslation } from 'components/Extensibility/helpers';

export const Switch2 = ({
  onChange,
  onKeyDown,
  value,
  schema,
  // storeKeys,
  required,
  compact,
  setValue,
  propertyPath,
  label,
  ...props
}) => {
  const { t } = useGetTranslation();

  return (
    <ResourceForm.FormField
      advanced
      propertyPath="$.spec.enableUnsupportedPlugins"
      label={t(label || propertyPath)}
      input={Inputs.Switch}
      setValue={setValue}
      value={value}

      // onChange={setValue}
    />
    // <ResourceForm.FormField
    //   value={value}
    //   onChange={props.setValue}
    //   // setValue={value => {
    //   //   console.log(value, onChange, props);
    //   // onChange({
    //   //   storeKeys,
    //   //   scopes: ['value'],
    //   //   type: 'set',
    //   //   schema,
    //   //   required,
    //   //   data: { value },
    //   // });
    //   // }}
    //   label={'test label'}
    //   input={Inputs.Switch}
    //   compact={compact}
    // />
  );
};
