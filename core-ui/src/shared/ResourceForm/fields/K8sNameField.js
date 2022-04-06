import React, { useEffect } from 'react';
import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import { ResourceForm } from 'shared/ResourceForm/components/ResourceForm';
import { K8sNameInput } from 'shared/components/K8sNameInput/K8sNameInput';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { randomNamesGenerator } from 'shared/utils/randomNamesGenerator/randomNamesGenerator';
import './K8sNameField.scss';

export function K8sNameField({
  kind,
  value,
  setValue,
  className,
  prefix,
  ...props
}) {
  const { t, i18n } = useTranslation();
  const { isAdvanced, propertyPath, validate, readOnly, ...inputProps } = props;

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
      required
      className={className}
      propertyPath="$.metadata.name"
      label={t('common.labels.name')}
      tooltipContent={t('common.tooltips.k8s-name-input')}
      input={() => {
        return (
          <div className="k8s-name-field">
            <K8sNameInput
              kind={kind}
              compact
              required
              showHelp={false}
              showLabel={false}
              onChange={e => setValue(e.target.value)}
              value={value}
              i18n={i18n}
              readOnly={readOnly}
              {...inputProps}
            />
            <Tooltip
              className="actions-tooltip"
              content={t('common.tooltips.generate-name')}
            >
              <Button
                compact
                className="k8s-name-field-action"
                onClick={generateName}
                glyph="synchronize"
                ariaLabel="Generate name button"
                disabled={readOnly}
                {...inputProps}
              />
            </Tooltip>
          </div>
        );
      }}
    />
  );
}
