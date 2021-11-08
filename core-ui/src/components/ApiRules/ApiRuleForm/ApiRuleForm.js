import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { createPatch } from 'rfc6902';
import LuigiClient from '@luigi-project/client';
import classNames from 'classnames';
import {
  FormItem,
  LayoutPanel,
  Button,
  FormInput,
  FormLabel,
  MessageStrip,
} from 'fundamental-react';
import { supportedMethodsList } from '../accessStrategyTypes';
import { useTranslation } from 'react-i18next';

import './ApiRuleForm.scss';
import ApiRuleFormHeader from './ApiRuleFormHeader/ApiRuleFormHeader';
import ServicesDropdown from './ServicesDropdown/ServicesDropdown';
import AccessStrategyForm from './AccessStrategyForm/AccessStrategyForm';
import { hasValidMethods } from 'components/ApiRules/accessStrategyTypes';
import {
  useGetList,
  useNotification,
  K8sNameInput,
  useGet,
  Tooltip,
  useMicrofrontendContext,
} from 'react-shared';
import { SERVICES_URL, API_RULE_URL } from '../constants';
import { formatMessage as injectVariables } from 'components/Lambdas/helpers/misc';
import { GatewayDropdown } from './GatewayDropdown';
import { HostnameDropdown } from './HostnameDropdown';

const getFirstAvailableHost = gateway => {
  return gateway.spec.servers[0].hosts[0];
};

const hasWildcard = hostname => {
  if (!hostname) return false;

  // hostname may contain optional namespace prefix ({namespace}/{hostname})
  if (hostname.includes('/')) {
    hostname = hostname.split('/')[1];
  }
  return hostname.includes('*');
};

const resolveFinalHost = (subdomain, hostname) => {
  // replace possible wildcard with lowest level domain
  const resolvedHost = hasWildcard(hostname)
    ? hostname.replace('*', subdomain)
    : hostname;

  // hostname may be prefixed with namespace - get rid of it
  return resolvedHost.includes('/')
    ? resolvedHost.substring(resolvedHost.lastIndexOf('/') + 1)
    : resolvedHost;
};

const EMPTY_ACCESS_STRATEGY = {
  path: '',
  methods: supportedMethodsList,
  accessStrategies: [
    {
      handler: 'allow',
      config: {},
    },
  ],
};

ApiRuleForm.propTypes = {
  apiRule: PropTypes.object.isRequired,
  sendRequest: PropTypes.func.isRequired,
  requestType: PropTypes.string,
  saveButtonText: PropTypes.string.isRequired,
  headerTitle: PropTypes.string.isRequired,
  breadcrumbItems: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      path: PropTypes.string,
    }),
  ),
};

export default function ApiRuleForm({
  apiRule,
  sendRequest,
  requestType,
  saveButtonText,
  headerTitle,
  breadcrumbItems,
}) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const notification = useNotification();
  const { serviceName, port, openedInModal = false } =
    LuigiClient.getNodeParams() || {};
  const openedInModalBool = openedInModal.toString().toLowerCase() === 'true';

  const defaultGatewayQuery = useGet(
    '/apis/networking.istio.io/v1beta1/namespaces/kyma-system/gateways/kyma-gateway',
  );

  const [gateway, setGateway] = React.useState(null);
  const [hostname, setHostname] = React.useState(null);

  React.useEffect(() => {
    if (defaultGatewayQuery.data) {
      setGateway(defaultGatewayQuery.data);
      setHostname(getFirstAvailableHost(defaultGatewayQuery.data));
    }
  }, [defaultGatewayQuery.data]);

  React.useEffect(() => handleFormChanged(), [hostname]);

  // as this modal uses refs instead of state, we can't rely on
  // rerender when the value changes - but we need to refresh the
  // MessageStrip when hostname is changed.
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  const [rules, setRules] = useState(
    apiRule.spec.rules.map(r => ({ ...r, renderKey: uuid() })),
  );
  const [isValid, setValid] = useState(false);
  const [methodsValid, setMethodsValid] = useState(true);

  if (serviceName && port) {
    apiRule.spec.service.name = serviceName;
    apiRule.spec.service.port = port;
  }

  const filterServices = service => {
    return true;
  };

  const { data: allServices, error, loading = true } = useGetList(
    filterServices,
  )(
    injectVariables(SERVICES_URL, {
      namespace: namespace,
    }),
    { pollingInterval: 4000 },
  );

  React.useEffect(() => setMethodsValid(rules.every(hasValidMethods)), [rules]);

  const formRef = useRef(null);
  const formValues = {
    name: useRef(null),
    hostname: useRef(null),
    runtime: useRef(null),
    service: useRef(null),
  };

  const { t, i18n } = useTranslation();

  function handleFormChanged(e) {
    setValid(formRef.current.checkValidity()); // general form validity
    if (!e) {
      return;
    }

    if (e.target.getAttribute('data-ignore-visual-validation')) {
      return;
    }

    // current element validity
    const isValid = e.target.checkValidity();
    e.target.classList.toggle('is-invalid', !isValid);
  }

  async function save() {
    if (!formRef.current.checkValidity()) {
      return;
    }
    const [serviceName, servicePort] = formValues.service.current.split(':');

    const variables = {
      metadata: {
        name: formValues.name.current.value,
        namespace: namespace,
        generation: apiRule?.metadata.generation || 1,
      },
      spec: {
        service: {
          host: resolveFinalHost(formValues.hostname.current.value, hostname),
          name: serviceName,
          port: parseInt(servicePort),
        },
        gateway: `${gateway.metadata.name}.${gateway.metadata.namespace}.svc.cluster.local`,
        rules: rules.map(({ renderKey, ...actualRule }) => actualRule),
      },
    };

    const newApiRule = {
      ...apiRule,
      ...variables,
      metadata: {
        ...apiRule.metadata,
        ...variables.metadata,
      },
      spec: {
        ...apiRule.spec,
        ...variables.spec,
      },
    };
    const data =
      requestType === 'create' ? newApiRule : createPatch(apiRule, newApiRule);

    try {
      await sendRequest(
        injectVariables(API_RULE_URL, {
          name: formValues.name.current.value,
          namespace: namespace,
        }),
        data,
      );

      const message =
        requestType === 'create'
          ? t('api-rules.messages.created')
          : t('api-rules.messages.updated');
      LuigiClient.sendCustomMessage({
        id: 'busola.showMessage',
        message,
        type: 'success',
      });
      LuigiClient.uxManager().closeCurrentModal();
    } catch (e) {
      notification.notifyError({
        title: t('api-rules.messages.create-failed'),
        content: e.message,
      });
    }
  }

  function addAccessStrategy() {
    setRules(rules => [
      ...rules,
      { ...EMPTY_ACCESS_STRATEGY, renderKey: uuid() },
    ]);
    setValid(false);
  }

  function removeAccessStrategy(index) {
    setRules(rules => [...rules.slice(0, index), ...rules.slice(index + 1)]);
    setTimeout(handleFormChanged);
  }

  return (
    <div
      className={classNames('api-rule-form', {
        'api-rule-form--in-modal': openedInModalBool,
      })}
    >
      <ApiRuleFormHeader
        isValid={isValid && methodsValid}
        handleSave={save}
        saveButtonText={saveButtonText}
        title={headerTitle}
        breadcrumbItems={breadcrumbItems}
        serviceName={serviceName}
        openedInModalBool={openedInModalBool}
      />
      <section className="api-rule-form__form">
        <form
          onSubmit={e => e.preventDefault()}
          onChange={e => handleFormChanged(e)}
          ref={formRef}
          noValidate
        >
          <LayoutPanel className="fd-margin-bottom--sm">
            <LayoutPanel.Header>
              <LayoutPanel.Head title={t('api-rules.general-settings.title')} />
            </LayoutPanel.Header>
            <LayoutPanel.Body>
              <FormItem>
                <K8sNameInput
                  _ref={formValues.name}
                  id="apiRuleName"
                  kind="API Rule"
                  showHelp={!apiRule?.metadata.name}
                  defaultValue={apiRule?.metadata.name}
                  disabled={!!apiRule?.metadata.name}
                  i18n={i18n}
                />
              </FormItem>
              <ServicesDropdown
                _ref={formValues.service}
                defaultValue={apiRule.spec.service}
                serviceName={serviceName}
                data={allServices}
                error={error}
                loading={loading}
              />
              <GatewayDropdown
                namespace={namespace}
                gateway={gateway}
                setGateway={gateway => {
                  setGateway(gateway);
                  setHostname(getFirstAvailableHost(gateway));
                }}
              />
              <HostnameDropdown
                gateway={gateway}
                hostname={hostname}
                setHostname={setHostname}
              />
              <FormItem>
                <FormLabel htmlFor="subdomain" required>
                  {t('api-rules.form.subdomain')}
                </FormLabel>
                <Tooltip content={t('common.tooltips.k8s-name-input')}>
                  <FormInput
                    disabled={!hasWildcard(hostname)}
                    id="subdomain"
                    placeholder={t('api-rules.form.subdomain-placeholder')}
                    required
                    pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$"
                    ref={formValues.hostname}
                    onChange={forceUpdate}
                  />
                </Tooltip>
              </FormItem>
              {hostname &&
                (!hasWildcard(hostname) ||
                  formValues.hostname.current?.value) && (
                  <MessageStrip type="success" className="fd-margin-top--sm">
                    {t('api-rules.messages.will-be-available-at', {
                      address:
                        'https://' +
                        resolveFinalHost(
                          formValues.hostname.current.value,
                          hostname,
                        ),
                    })}
                  </MessageStrip>
                )}
            </LayoutPanel.Body>
          </LayoutPanel>
          <LayoutPanel>
            <LayoutPanel.Header>
              <LayoutPanel.Head
                title={t('api-rules.access-strategies.title')}
              />
              <LayoutPanel.Actions>
                <Button
                  onClick={addAccessStrategy}
                  option="transparent"
                  glyph="add"
                  typeAttr="button"
                >
                  {t('api-rules.access-strategies.buttons.add')}
                </Button>
              </LayoutPanel.Actions>
            </LayoutPanel.Header>
            {!!rules.length && (
              <LayoutPanel.Body>
                {rules.map((rule, idx) => {
                  return (
                    <AccessStrategyForm
                      key={rule.renderKey}
                      strategy={rule}
                      setStrategy={newStrategy => {
                        setRules(rules => [
                          ...rules.slice(0, idx),
                          newStrategy,
                          ...rules.slice(idx + 1, rules.length),
                        ]);
                        setValid(false);
                        handleFormChanged();
                      }}
                      removeStrategy={() => removeAccessStrategy(idx)}
                      canDelete={rules.length > 1}
                      handleFormChanged={() => setTimeout(handleFormChanged)}
                    />
                  );
                })}
              </LayoutPanel.Body>
            )}
          </LayoutPanel>
        </form>
      </section>
    </div>
  );
}
