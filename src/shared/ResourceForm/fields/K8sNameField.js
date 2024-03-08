import React, { useEffect } from 'react';
import { Button, Label } from '@ui5/webcomponents-react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';
import { K8sNameInput } from 'shared/components/K8sNameInput/K8sNameInput';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { randomNamesGenerator } from 'shared/utils/randomNamesGenerator/randomNamesGenerator';

import { useCreateResourceDescription } from 'components/Extensibility/helpers';

export function K8sNameField({
  kind,
  value,
  setValue,
  className,
  prefix,
  pattern,
  showHelp = true,
  inputInfo,
  tooltipContent,
  required = true,
  ...props
}) {
  const { t } = useTranslation();
  const { isAdvanced, propertyPath, validate, readOnly, ...inputProps } = props;
  const inputInfoLink = useCreateResourceDescription(inputInfo);
  const generateName = () => {
    const name = randomNamesGenerator();
    setValue(prefix ? `${prefix}-${name}` : name);
  };

  useEffect(() => {
    if (prefix) generateName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <div className="bsl-col bsl-col-md--10">
              <K8sNameInput
                kind={kind}
                compact
                required={required}
                showLabel={false}
                onChange={e => setValue(e.target.value)}
                onInput={e => setValue(e.target.value)}
                value={value}
                readOnly={readOnly}
                pattern={pattern}
                {...inputProps}
              />
            </div>
            <div className="bsl-col bsl-col-md--2">
              <Tooltip content={t('common.tooltips.generate-name')}>
                <Button
                  design="Transparent"
                  onClick={generateName}
                  aria-label="Generate name button"
                  disabled={readOnly}
                >
                  {t('common.buttons.generate-name')}
                </Button>
              </Tooltip>
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
