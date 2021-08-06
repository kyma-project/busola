import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormFieldset, FormItem, FormLabel, Checkbox } from 'fundamental-react';

import {
  K8sNameInput,
  LabelSelectorInput,
  usePost,
  Tooltip,
} from 'react-shared';

import './CreateNamespace.scss';
import { formatNamespace, formatLimits, formatMemoryQuotas } from './helpers';
import { useTranslation } from 'react-i18next';

const LIMIT_REGEX =
  '^[+]?[0-9]*(.[0-9]*)?(([eE][-+]?[0-9]+(.[0-9]*)?)?|([MGTPE]i?)|Ki|k|m)?$';

const ISTIO_INJECTION_LABEL = 'istio-injection=disabled';

const DisableSidecarField = ({ onChange }) => {
  const { t } = useTranslation();
  return (
    <FormFieldset>
      <FormItem>
        <Tooltip content={t('namespaces.tooltips.create')}>
          <Checkbox
            id="disable-istio"
            onChange={e => onChange(e.target.checked)}
          >
            Disable side-car injection
          </Checkbox>
        </Tooltip>
      </FormItem>
    </FormFieldset>
  );
};

const MemoryQuotasCheckbox = ({ isCheckedRef, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(
    _ => {
      isCheckedRef.current = isExpanded;
    }, // eslint-disable-next-line
    [isExpanded],
  );

  const { t } = useTranslation();

  return (
    <FormFieldset>
      <FormItem>
        <Tooltip content={t('namespaces.tooltips.total-memory-limit')}>
          <Checkbox
            id="memory-quotas"
            onChange={e => setIsExpanded(e.target.checked)}
            aria-label="memory-quotas"
          >
            Apply Total Memory Quotas
          </Checkbox>
        </Tooltip>

        {isExpanded && children}
      </FormItem>
    </FormFieldset>
  );
};

const SectionRow = ({
  id,
  description,
  placeholder,
  pattern,
  reference,
  defaultValue,
  type = 'text',
  required = true,
}) => (
  <>
    <FormLabel htmlFor={id}>{description}</FormLabel>
    <input
      id={id}
      placeholder={placeholder}
      type={type}
      defaultValue={defaultValue}
      pattern={pattern}
      ref={reference}
      required={required}
      className="fd-input"
    />
  </>
);

const MemoryQuotasSection = ({ limitsRef, requestsRef }) => {
  const { t } = useTranslation();
  return (
    <FormFieldset className="input-fields" data-test-id="memory-quotas-section">
      <Tooltip
        content={t('namespaces.tooltips.memory-examples')}
        className="input-fields-tooltip"
      >
        <SectionRow
          id="memory-limit"
          reference={limitsRef}
          defaultValue="3Gi"
          pattern={LIMIT_REGEX}
          description="Memory limit *"
          placeholder="Memory limit"
        />
      </Tooltip>
      <Tooltip
        content={t('namespaces.tooltips.memory-examples')}
        className="input-fields-tooltip"
      >
        <SectionRow
          id="memory-requests"
          placeholder="Memory requests"
          type="text"
          defaultValue="2.8Gi"
          pattern={LIMIT_REGEX}
          reference={requestsRef}
          description="Memory requests *"
        />
      </Tooltip>
    </FormFieldset>
  );
};

const ContainerLimitsCheckbox = ({ isCheckedRef, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(
    _ => {
      isCheckedRef.current = isExpanded;
    }, // eslint-disable-next-line
    [isExpanded],
  );
  const { t } = useTranslation();

  return (
    <FormFieldset>
      <FormItem>
        <Tooltip
          content={t('namespaces.tooltips.container-memory-limit')}
          className="input-fields-tooltip"
        >
          <Checkbox
            id="container-limits"
            onChange={e => setIsExpanded(e.target.checked)}
          >
            Apply limits per container
          </Checkbox>
        </Tooltip>
        {isExpanded && children}
      </FormItem>
    </FormFieldset>
  );
};

const ContainerLimitSection = ({ maxRef, defaultRef, requestRef }) => {
  const { t } = useTranslation();
  return (
    <FormFieldset
      className="input-fields"
      data-test-id="container-limits-section"
    >
      <Tooltip
        content={t('namespaces.tooltips.memory-examples')}
        className="input-fields-tooltip"
      >
        <SectionRow
          id="container-max"
          placeholder="Max"
          type="text"
          defaultValue="1100Mi"
          pattern={LIMIT_REGEX}
          reference={maxRef}
          description="Max *"
        />
      </Tooltip>
      <Tooltip
        content={t('namespaces.tooltips.memory-examples')}
        className="input-fields-tooltip"
      >
        <SectionRow
          id="container-default"
          placeholder="Default"
          type="text"
          defaultValue="512Mi"
          pattern={LIMIT_REGEX}
          reference={defaultRef}
          description="Default *"
        />
      </Tooltip>
      <Tooltip
        content={t('workloads.tooltips.memory-examples')}
        className="input-fields-tooltip"
      >
        <SectionRow
          id="container-default-request"
          placeholder="Default request"
          type="text"
          defaultValue="32Mi"
          pattern={LIMIT_REGEX}
          reference={requestRef}
          description="Default request *"
        />
      </Tooltip>
    </FormFieldset>
  );
};

export const NamespacesCreate = ({
  formElementRef,
  onChange,
  onCompleted,
  onError,
  performManualSubmit,
  resourceUrl,
  refetchList,
}) => {
  const postRequest = usePost();
  const [labels, setLabels] = useState({});
  const [readonlyLabels, setReadonlyLabels] = useState({});

  const formValues = {
    name: useRef(null),
    memoryQuotas: {
      enableMemoryQuotas: useRef(null),
      memoryLimit: useRef(null),
      memoryRequests: useRef(null),
    },
    containerLimits: {
      enableContainerLimits: useRef(null),
      max: useRef(null),
      default: useRef(null),
      defaultRequest: useRef(null),
    },
  };
  useEffect(() => {
    const element = formValues.name.current;
    setImmediate(() => {
      if (element && typeof element.focus === 'function') element.focus();
    });
  }, [formValues.name]);

  function handleLabelsChanged(newLabels) {
    setLabels(newLabels);
  }

  function handleIstioChange(disableSidecar) {
    const [istioInjLabelKey, istioInjLabelValue] = ISTIO_INJECTION_LABEL.split(
      '=',
    );

    if (disableSidecar) {
      setReadonlyLabels({
        ...readonlyLabels,
        [istioInjLabelKey]: istioInjLabelValue,
      });
    } else {
      const newReadonlyLabels = { ...readonlyLabels };
      delete newReadonlyLabels[istioInjLabelKey];
      setReadonlyLabels(newReadonlyLabels);
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    const namespaceName = formValues.name.current.value;
    const limits = formValues.containerLimits.enableContainerLimits.current && {
      namespace: namespaceName,
      max: formValues.containerLimits.max.current.value,
      default: formValues.containerLimits.default.current.value,
      defaultRequest: formValues.containerLimits.defaultRequest.current.value,
    };
    const quotas = formValues.memoryQuotas.enableMemoryQuotas.current && {
      namespace: namespaceName,
      limits: formValues.memoryQuotas.memoryLimit.current.value,
      requests: formValues.memoryQuotas.memoryRequests.current.value,
    };

    const namespaceData = formatNamespace({
      name: namespaceName,
      labels: { ...labels, ...readonlyLabels },
    });

    try {
      await postRequest(resourceUrl, namespaceData);
      refetchList();
    } catch (e) {
      console.warn(e);
      onError('Cannot create Namespace', `Error: ${e.message}`);
      return;
    }

    const additionalRequests = [];
    if (limits) {
      additionalRequests.push(
        postRequest(
          `/api/v1/namespaces/${namespaceName}/limitranges`,
          formatLimits(limits),
        ),
      );
    }
    if (quotas) {
      additionalRequests.push(
        postRequest(
          `/api/v1/namespaces/${namespaceName}/resourcequotas`,
          formatMemoryQuotas(quotas),
        ),
      );
    }

    const additionalResults = await Promise.allSettled(additionalRequests);
    const rejectedRequest = additionalResults.find(
      result => result.status === 'rejected',
    );
    if (!rejectedRequest) {
      onCompleted(`Namespace ${namespaceName} created`);
    } else {
      onError(
        'Warning',
        `Your namespace ${namespaceName} was created successfully, however, Limit Range and/or Resource Quota creation failed. You have to create them manually later: ${rejectedRequest.reason}`,
        true,
      );
    }
  }

  const { i18n } = useTranslation();
  return (
    // although HTML spec assigns the role by default to a <form> element, @testing-library ignores it
    // eslint-disable-next-line jsx-a11y/no-redundant-roles
    <form
      role="form"
      onChange={onChange}
      ref={formElementRef}
      onSubmit={handleFormSubmit}
      noValidate
    >
      <div className="fd-form-group">
        <div className="fd-form-item">
          <K8sNameInput
            _ref={formValues.name}
            id="namespace-name"
            kind="Namespace"
            onKeyDown={e => {
              if (e.keyCode === 13) {
                performManualSubmit();
              }
            }}
          />
        </div>

        <LabelSelectorInput
          labels={labels}
          readonlyLabels={readonlyLabels}
          onChange={handleLabelsChanged}
          i18n={i18n}
        />

        <div className="fd-form-item">
          <DisableSidecarField onChange={handleIstioChange} />
        </div>
        <div className="fd-form-item">
          <MemoryQuotasCheckbox
            isCheckedRef={formValues.memoryQuotas.enableMemoryQuotas}
          >
            <MemoryQuotasSection
              limitsRef={formValues.memoryQuotas.memoryLimit}
              requestsRef={formValues.memoryQuotas.memoryRequests}
            />
          </MemoryQuotasCheckbox>

          <ContainerLimitsCheckbox
            isCheckedRef={formValues.containerLimits.enableContainerLimits}
          >
            <ContainerLimitSection
              maxRef={formValues.containerLimits.max}
              defaultRef={formValues.containerLimits.default}
              requestRef={formValues.containerLimits.defaultRequest}
            />
          </ContainerLimitsCheckbox>
        </div>
      </div>
    </form>
  );
};

NamespacesCreate.propTypes = {
  formElementRef: PropTypes.shape({ current: PropTypes.any }).isRequired, // used to store <form> element reference
  isValid: PropTypes.bool,
  onChange: PropTypes.func,
  onError: PropTypes.func, // args: title(string), message(string)
  onCompleted: PropTypes.func, // args: namespaceName(string)
  performManualSubmit: PropTypes.func, // no args
  resourceUrl: PropTypes.string.isRequired,
};
