import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { LayoutPanel, Button } from 'fundamental-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { useTranslation } from 'react-i18next';

import LambdaReplicas from './LambdaReplicas';
import LambdaResources from './LambdaResources';

import { useUpdateLambda, UPDATE_TYPE } from 'components/Lambdas/hooks';
import { parseCpu } from 'components/Lambdas/helpers/resources';
import { CONFIG } from 'components/Lambdas/config';
import {
  prepareSchema,
  inputNames,
  checkReplicasPreset,
  checkResourcesPreset,
} from './shared';

import './ResourceManagement.scss';

function getDefaultFormValues(lambda) {
  return {
    [inputNames.replicas.preset]: checkReplicasPreset(
      lambda.spec.minReplicas,
      lambda.spec.maxReplicas,
      CONFIG.functionReplicasPresets,
    ),
    [inputNames.replicas.min]:
      lambda.spec.minReplicas || CONFIG.functionMinReplicas,
    [inputNames.replicas.max]:
      lambda.spec.maxReplicas || CONFIG.functionMinReplicas,

    [inputNames.function.preset]: checkResourcesPreset(
      lambda.spec.resources,
      CONFIG.functionResourcesPresets,
    ),
    [inputNames.function.requests.cpu]: parseCpu(
      lambda.spec.resources.requests.cpu || '',
    ),
    [inputNames.function.limits.cpu]: parseCpu(
      lambda.spec.resources.limits.cpu || '',
    ),
    [inputNames.function.requests.memory]:
      lambda.spec.resources.requests.memory || '',
    [inputNames.function.limits.memory]:
      lambda.spec.resources.limits.memory || '',

    [inputNames.buildJob.preset]: checkResourcesPreset(
      lambda.spec.buildResources,
      CONFIG.buildJobResourcesPresets,
    ),
    [inputNames.buildJob.requests.cpu]: parseCpu(
      lambda.spec.buildResources.requests.cpu || '',
    ),
    [inputNames.buildJob.limits.cpu]: parseCpu(
      lambda.spec.buildResources.limits.cpu || '',
    ),
    [inputNames.buildJob.requests.memory]:
      lambda.spec.buildResources.requests.memory || '',
    [inputNames.buildJob.limits.memory]:
      lambda.spec.buildResources.limits.memory || '',
  };
}

export default function ResourcesManagement({ lambda }) {
  const defaultValues = getDefaultFormValues(lambda);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm({
    resolver: yupResolver(prepareSchema(t)),
    mode: 'onChange',
    defaultValues,
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const updateLambda = useUpdateLambda({
    lambda,
    type: UPDATE_TYPE.RESOURCES_AND_REPLICAS,
  });

  useEffect(() => {
    if (!isEditMode) {
      updateFields(getDefaultFormValues(lambda));
    }
    // it is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lambda]);

  function updateFields(data) {
    Object.entries(data).forEach(
      ([name, val]) => setValue && setValue(name, val),
    );
  }

  async function onSubmit(data) {
    const callback = ({ ok }) => {
      if (!ok) {
        updateFields(defaultValues);
      }
    };

    if (!isEditMode) {
      updateLambda(
        {
          ...lambda,
          spec: {
            ...lambda.spec,
            minReplicas: data.minReplicas,
            maxReplicas: data.maxReplicas,
            resources: {
              requests: {
                cpu: data.functionRequestsCpu,
                memory: data.functionRequestsMemory,
              },
              limits: {
                cpu: data.functionLimitsCpu,
                memory: data.functionLimitsMemory,
              },
            },
            buildResources: {
              requests: {
                cpu: data.buildRequestsCpu,
                memory: data.buildRequestsMemory,
              },
              limits: {
                cpu: data.buildLimitsCpu,
                memory: data.buildLimitsMemory,
              },
            },
          },
        },
        callback,
      );
    }
  }

  function renderCancelButton() {
    if (!isEditMode) {
      return null;
    }

    return (
      <Button
        glyph="sys-cancel"
        type="negative"
        className="fd-margin-end--tiny"
        onClick={async () => {
          updateFields(defaultValues);
          setIsEditMode(false);
        }}
      >
        {t('common.buttons.cancel')}
      </Button>
    );
  }

  const saveText = t('common.buttons.save');
  const editText = t('functions.details.buttons.edit-configuration');
  const popupMessage = t('functions.create-view.errors.one-field-invalid');

  function renderConfirmButton() {
    const disabled = isEditMode && !isValid;
    const button = (
      <Button
        glyph={isEditMode ? 'save' : 'edit'}
        option={isEditMode ? 'emphasized' : 'transparent'}
        typeAttr="submit"
        onClick={() => setIsEditMode(prev => !prev)}
        disabled={isEditMode && !isValid}
      >
        {isEditMode ? saveText : editText}
      </Button>
    );

    if (disabled) {
      return (
        <Tooltip
          content={popupMessage}
          position="top"
          trigger="mouseenter"
          tippyProps={{
            distance: 16,
          }}
        >
          {button}
        </Tooltip>
      );
    }
    return button;
  }

  return (
    <LayoutPanel className="fd-margin--md lambda-resources-management">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <LayoutPanel.Header>
          <LayoutPanel.Head
            title={t('functions.details.title.resources-replicas')}
          />
          <LayoutPanel.Actions>
            {renderCancelButton()}
            {renderConfirmButton()}
          </LayoutPanel.Actions>
        </LayoutPanel.Header>
        <div className="lambda-resources-management__panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={t('functions.details.title.scaling-options')}
            />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            <LambdaReplicas
              register={register}
              disabledForm={!isEditMode}
              errors={errors}
            />
          </LayoutPanel.Body>
        </div>
        <div className="lambda-resources-management__panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={t('functions.details.title.runtime-profile')}
              description={t('functions.details.descriptions.runtime-profile')}
            />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            <LambdaResources
              register={register}
              disabledForm={!isEditMode}
              errors={errors}
              setValue={setValue}
              type="function"
              defaultPreset={defaultValues[inputNames.function.preset]}
            />
          </LayoutPanel.Body>
        </div>
        <div className="lambda-resources-management__panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={t('functions.details.title.build-job')}
              description={t('functions.details.descriptions.build-job')}
            />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            <LambdaResources
              register={register}
              disabledForm={!isEditMode}
              errors={errors}
              setValue={setValue}
              type="buildJob"
              defaultPreset={defaultValues[inputNames.buildJob.preset]}
            />
          </LayoutPanel.Body>
        </div>
      </form>
    </LayoutPanel>
  );
}
