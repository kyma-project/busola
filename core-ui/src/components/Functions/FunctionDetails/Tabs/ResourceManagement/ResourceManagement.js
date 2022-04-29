import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { LayoutPanel, Button } from 'fundamental-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { useTranslation } from 'react-i18next';

import FunctionReplicas from './FunctionReplicas';
import FunctionResources from './FunctionResources';

import { useUpdateFunction, UPDATE_TYPE } from 'components/Functions/hooks';
import { parseCpu } from 'components/Functions/helpers/resources';
import { CONFIG } from 'components/Functions/config';
import {
  prepareSchema,
  inputNames,
  checkReplicasPreset,
  checkResourcesPreset,
  areCPUsEqual,
  areMemoriesEqual,
} from './shared';

import './ResourceManagement.scss';

function getDefaultFormValues(func) {
  return {
    [inputNames.replicas.preset]: checkReplicasPreset(
      func.spec.minReplicas,
      func.spec.maxReplicas,
      CONFIG.functionReplicasPresets,
    ),
    [inputNames.replicas.min]:
      func.spec.minReplicas || CONFIG.functionMinReplicas,
    [inputNames.replicas.max]:
      func.spec.maxReplicas || CONFIG.functionMinReplicas,

    [inputNames.function.preset]: checkResourcesPreset(
      func.spec.resources,
      CONFIG.functionResourcesPresets,
    ),
    [inputNames.function.requests.cpu]: parseCpu(
      func.spec.resources?.requests?.cpu || '',
    ),
    [inputNames.function.limits.cpu]: parseCpu(
      func.spec.resources?.limits?.cpu || '',
    ),
    [inputNames.function.requests.memory]:
      func.spec.resources?.requests?.memory || '',
    [inputNames.function.limits.memory]:
      func.spec.resources?.limits?.memory || '',

    [inputNames.buildJob.preset]: checkResourcesPreset(
      func.spec.buildResources,
      CONFIG.buildJobResourcesPresets,
    ),
    [inputNames.buildJob.requests.cpu]: parseCpu(
      func.spec.buildResources?.requests?.cpu || '',
    ),
    [inputNames.buildJob.limits.cpu]: parseCpu(
      func.spec.buildResources?.limits?.cpu || '',
    ),
    [inputNames.buildJob.requests.memory]:
      func.spec.buildResources?.requests?.memory || '',
    [inputNames.buildJob.limits.memory]:
      func.spec.buildResources?.limits?.memory || '',
  };
}

export default function ResourcesManagement({ func }) {
  const defaultValues = getDefaultFormValues(func);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(prepareSchema(t)),
    mode: 'onChange',
    defaultValues,
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const updateFunction = useUpdateFunction({
    func,
    type: UPDATE_TYPE.RESOURCES_AND_REPLICAS,
  });

  useEffect(() => {
    if (!isEditMode) {
      updateFields(getDefaultFormValues(func));
    }
    // it is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [func]);

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
      updateFunction(
        {
          ...func,
          spec: {
            ...func.spec,
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

  function compareRuntimeProfileFormValues(preset, formValues) {
    return (
      areCPUsEqual(preset.limitCpu, formValues.functionLimitsCpu) &&
      areMemoriesEqual(preset.limitMemory, formValues.functionLimitsMemory) &&
      areMemoriesEqual(
        preset.requestMemory,
        formValues.functionRequestsMemory,
      ) &&
      areCPUsEqual(preset.requestCpu, formValues.functionRequestsCpu)
    );
  }
  function compareBuildJobProfileFormValues(preset, formValues) {
    return (
      areCPUsEqual(preset.limitCpu, formValues.buildLimitsCpu) &&
      areMemoriesEqual(preset.limitMemory, formValues.buildLimitsMemory) &&
      areMemoriesEqual(preset.requestMemory, formValues.buildRequestsMemory) &&
      areCPUsEqual(preset.requestCpu, formValues.buildRequestsCpu)
    );
  }

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
    <LayoutPanel className="fd-margin--md function-resources-management">
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
        <div className="function-resources-management__panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={t('functions.details.title.scaling-options')}
            />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            <FunctionReplicas
              register={register}
              disabledForm={!isEditMode}
              errors={errors}
            />
          </LayoutPanel.Body>
        </div>
        <div className="function-resources-management__panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={t('functions.details.title.runtime-profile')}
              description={t('functions.details.descriptions.runtime-profile')}
            />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            <FunctionResources
              register={register}
              disabledForm={!isEditMode}
              errors={errors}
              setValue={setValue}
              type="function"
              defaultPreset={defaultValues[inputNames.function.preset]}
              watch={watch}
              comparePresetWithFormValues={compareRuntimeProfileFormValues}
            />
          </LayoutPanel.Body>
        </div>
        <div className="function-resources-management__panel">
          <LayoutPanel.Header>
            <LayoutPanel.Head
              title={t('functions.details.title.build-job')}
              description={t('functions.details.descriptions.build-job')}
            />
          </LayoutPanel.Header>
          <LayoutPanel.Body>
            <FunctionResources
              register={register}
              disabledForm={!isEditMode}
              errors={errors}
              setValue={setValue}
              type="buildJob"
              defaultPreset={defaultValues[inputNames.buildJob.preset]}
              watch={watch}
              comparePresetWithFormValues={compareBuildJobProfileFormValues}
            />
          </LayoutPanel.Body>
        </div>
      </form>
    </LayoutPanel>
  );
}
