import React from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from './TableElements/Input';
import { Row } from './TableElements/Row';

import { ErrorMessage, inputClassName, inputNames } from './shared';

export default function FunctionReplicas({ disabledForm, register, errors }) {
  const { t } = useTranslation();
  const panels = [
    {
      title: t('functions.details.title.minimum-replicas'),
      description: t('functions.details.descriptions.minimum-replicas'),
      action: (
        <>
          <Input
            className={inputClassName}
            name={inputNames.replicas.min}
            id={inputNames.replicas.min}
            disabled={disabledForm}
            type="number"
            {...register(inputNames.replicas.min, {
              valueAsNumber: true,
            })}
            min="0"
          />
          <ErrorMessage errors={errors} field={inputNames.replicas.min} />
        </>
      ),
    },
    {
      title: t('functions.details.title.maximum-replicas'),
      description: t('functions.details.descriptions.maximum-replicas'),
      action: (
        <>
          <Input
            className={inputClassName}
            disabled={disabledForm}
            id={inputNames.replicas.max}
            min="0"
            name={inputNames.replicas.max}
            type="number"
            {...register(inputNames.replicas.max, {
              valueAsNumber: true,
            })}
          />
          <ErrorMessage errors={errors} field={inputNames.replicas.max} />
        </>
      ),
    },
  ];

  return (
    <div style={{ display: 'grid', gridAutoColumns: '1fr' }}>
      {panels.map(panel => (
        <Row
          key={panel.title}
          title={panel.title}
          description={panel.description}
          action={panel.action}
        ></Row>
      ))}
    </div>
  );
}
