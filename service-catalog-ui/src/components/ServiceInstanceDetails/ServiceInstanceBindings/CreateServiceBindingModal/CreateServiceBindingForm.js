import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormItem, FormLabel, FormInput, Alert } from 'fundamental-react';
import {
  Checkbox,
  useGetList,
  useCreateServiceBindingUsage,
} from 'react-shared';

import { SERVICE_BINDINGS_PANEL } from '../constants';

const checkBoxInputProps = {
  style: {
    marginRight: '6px',
  },
};

const ResourceKindOptgroup = ({ kindResource, namespace }) => {
  const { data } = useGetList()(
    `/apis/${kindResource.group}/${kindResource.version}/namespaces/${namespace}/${kindResource.kind}s`,
    {},
  );
  return (
    <optgroup label={kindResource.kind}>
      {data &&
        data.map(res => (
          <option
            value={JSON.stringify({
              kind: kindResource.kind,
              name: res.metadata.name,
            })}
            key={res.metadata.uid}
          >
            {res.metadata.name}
          </option>
        ))}
    </optgroup>
  );
};

export default function CreateServiceBindingForm({
  serviceInstance,
  usageKinds = [],
  serviceBindings = [],
  setPopupModalMessage = () => void 0,
  onChange,
  formElementRef,
  setValidity = () => void 0,
}) {
  const createServiceBindingUsageSet = useCreateServiceBindingUsage({
    successMessage: SERVICE_BINDINGS_PANEL.CREATE_BINDING_USAGE.SUCCESS_MESSAGE,
    errorMessage: SERVICE_BINDINGS_PANEL.CREATE_BINDING_USAGE.ERROR_MESSAGE,
  });

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [envPrefix, setEnvPrefix] = useState('');

  const [createCredentials, setCreateCredentials] = useState(true);
  const [existingBindings, setExistingBindings] = useState('');

  useEffect(() => {
    setValidity(false);
  }, [setValidity]);

  useEffect(() => {
    if (!selectedApplication) {
      setEnvPrefix('');
      setCreateCredentials(true);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApplication]);

  useEffect(() => {
    if (!selectedApplication) {
      setPopupModalMessage(
        SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .NO_APP_SELECTED,
      );
      setValidity(false);
      return;
    }

    if (!createCredentials && !existingBindings) {
      setPopupModalMessage(
        SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .NO_BINDING_SELECTED,
      );
      setValidity(false);
      return;
    }
    setValidity(true);
  }, [
    selectedApplication,
    createCredentials,
    existingBindings,
    setValidity,
    setPopupModalMessage,
  ]);

  useEffect(() => setExistingBindings(''), [
    selectedApplication,
    createCredentials,
  ]);

  async function handleFormSubmit(e) {
    e.preventDefault();
    const parameters = {
      namespace: serviceInstance.metadata.namespace,
      serviceInstanceName: serviceInstance.metadata.name,
      serviceBindingUsageParameters: envPrefix
        ? {
            envPrefix: {
              name: envPrefix,
            },
          }
        : undefined,
      usedBy: {
        name: selectedApplication.name,
        kind: selectedApplication.kind,
      },
      existingCredentials: existingBindings || undefined,
    };

    await createServiceBindingUsageSet(parameters);
  }

  const applicationsDropdown = (
    <select
      id="applicationName"
      value={JSON.stringify(selectedApplication)}
      onChange={e => setSelectedApplication(JSON.parse(e.target.value))}
      required
    >
      {usageKinds.map(u => (
        <ResourceKindOptgroup
          key={u.metadata.uid}
          kindResource={u.spec.resource}
          namespace={serviceInstance.metadata.namespace}
        />
      ))}
    </select>
  );

  const noserviceBindingsFound = (
    <Alert dismissible={false} type="information">
      {SERVICE_BINDINGS_PANEL.FORM.NO_BINDINGS_FOUND}
    </Alert>
  );

  return (
    <form
      ref={formElementRef}
      style={{ width: '30em' }}
      onChange={onChange}
      onSubmit={handleFormSubmit}
    >
      <FormItem key="applicationName">
        <FormLabel htmlFor="applicationName">Application</FormLabel>
        {applicationsDropdown}
      </FormItem>

      <FormItem key="envPrefix">
        <FormLabel htmlFor="envPrefix">Prefix for injected variables</FormLabel>
        <FormInput
          id="envPrefix"
          placeholder="Set a prefix for variables (optional)"
          type="text"
          value={envPrefix}
          onChange={e => setEnvPrefix(e.target.value)}
        />
      </FormItem>

      {selectedApplication && (
        <>
          <FormItem key="createCredentials">
            <Checkbox
              name="createCredentials"
              value="Create new Secret"
              inputProps={checkBoxInputProps}
              initialChecked={true}
              onChange={(_, value) => setCreateCredentials(value)}
            />
          </FormItem>
          {!createCredentials && serviceBindings.length ? (
            <FormItem key="existingBindings">
              <FormLabel htmlFor="existingBindings">Service Bindings</FormLabel>
              <select
                id="existingBindings"
                value={existingBindings}
                onChange={e => setExistingBindings(e.target.value)}
                required
              >
                <option value=""></option>
                {serviceBindings.map(s => (
                  <option value={s.metadata.name} key={s.metadata.uid}>
                    {s.metadata.name}
                  </option>
                ))}
              </select>
            </FormItem>
          ) : null}
          {!createCredentials && !serviceBindings.length
            ? noserviceBindingsFound
            : null}
        </>
      )}
    </form>
  );
}

CreateServiceBindingForm.propTypes = {
  onChange: PropTypes.func,
  onCompleted: PropTypes.func,
  onError: PropTypes.func,
  formElementRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
};
