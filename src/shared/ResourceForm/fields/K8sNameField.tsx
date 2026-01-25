import { Label } from '../components/Label';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';
import { K8sNameInput } from 'shared/components/K8sNameInput/K8sNameInput';

import { useCreateResourceDescription } from 'components/Extensibility/helpers';
import { Ui5CustomEvent } from '@ui5/webcomponents-react-base';
import { InputDomRef } from '@ui5/webcomponents-react';

type K8sNameFieldProps = {
  kind: string;
  value?: string;
  setValue: (value: string) => void;
  className?: string;
  pattern?: string;
  showHelp?: boolean;
  inputInfo?: {
    title: string;
    description: string;
    link?: {
      url: string;
      text: string;
    };
  };
  tooltipContent?: React.ReactNode | string;
  required?: boolean;
  readOnly?: boolean;
  [key: string]: any;
};

export function K8sNameField({
  kind,
  value,
  setValue,
  className,
  pattern,
  showHelp = true,
  inputInfo,
  tooltipContent,
  required = true,
  readOnly,
  ...props
}: K8sNameFieldProps) {
  const { t } = useTranslation();
  const inputInfoLink = useCreateResourceDescription(inputInfo);

  const setValueOnChange = (event: Ui5CustomEvent<InputDomRef>) => {
    setValue(event.target.value);
  };

  return (
    <ResourceForm.FormField
      required={required}
      className={className}
      propertyPath="$.metadata.name"
      label={t('common.labels.name')}
      inputInfo={inputInfoLink}
      tooltipContent={tooltipContent}
      input={() => {
        return (
          <>
            <div className="bsl-col-md--12">
              {/*@ts-expect-error Type mismatch between js and ts*/}
              <K8sNameInput
                kind={kind}
                compact
                required={required}
                showLabel={false}
                onChange={setValueOnChange}
                onInput={setValueOnChange}
                value={value}
                readOnly={readOnly}
                pattern={pattern}
                {...props}
              />
            </div>
            {showHelp && inputInfo === undefined ? (
              <Label wrappingType="Normal" style={{ marginTop: '5px' }}>
                {t('common.tooltips.k8s-name-input')}
              </Label>
            ) : null}
          </>
        );
      }}
    />
  );
}
