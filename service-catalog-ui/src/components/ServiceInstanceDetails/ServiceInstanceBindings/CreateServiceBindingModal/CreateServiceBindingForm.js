import React, { useState, useEffect, useRef } from 'react';
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

  return data && data.length ? (
    <optgroup label={kindResource.kind}>
      {data.map(res => (
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
  ) : null;
};

export default function CreateServiceBindingForm({
  serviceInstance,
  usageKinds = [],
  serviceBindings = [],
  setPopupModalMessage = () => void 0,
  onChange,
  formElementRef,
  // setValidity = () => void 0,
  setCustomValid = () => void 0,
}) {
  const createServiceBindingUsageSet = useCreateServiceBindingUsage({
    successMessage: SERVICE_BINDINGS_PANEL.CREATE_BINDING_USAGE.SUCCESS_MESSAGE,
    errorMessage: SERVICE_BINDINGS_PANEL.CREATE_BINDING_USAGE.ERROR_MESSAGE,
  });

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [envPrefix, setEnvPrefix] = useState('');

  const [createBinding, setCreateBinding] = useState(true);
  const [existingBindings, setExistingBindings] = useState('');

  useEffect(() => {
    setCustomValid(false);
  }, [setCustomValid]);

  useEffect(() => {
    if (!selectedApplication) {
      setEnvPrefix('');
      setCreateBinding(true);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApplication]);

  useEffect(() => {
    console.log(selectedApplication);
    if (!selectedApplication) {
      console.log('!selectedApplication');
      setPopupModalMessage(
        SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .NO_APP_SELECTED,
      );
      setCustomValid(false);
      return;
    }

    if (!createBinding && !existingBindings) {
      console.log('!createBinding && !existingBindings');
      setPopupModalMessage(
        SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .NO_BINDING_SELECTED,
      );
      setCustomValid(false);
      return;
    }
    setCustomValid(true);
  }, [
    selectedApplication,
    createBinding,
    existingBindings,
    setCustomValid,
    setPopupModalMessage,
  ]);

  useEffect(() => setExistingBindings(''), [
    selectedApplication,
    createBinding,
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
      onChange={e => {
        console.log('dropdown onchange', JSON.parse(e.target.value));
        setSelectedApplication(JSON.parse(e.target.value));
      }}
      required
    >
      <option value="" />
      {usageKinds.map((u, index) => (
        <ResourceKindOptgroup
          key={u.metadata.uid}
          kindResource={u.spec.resource}
          namespace={serviceInstance.metadata.namespace}
        />
      ))}
    </select>
  );

  const noServiceBindingsFound = (
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
          <FormItem key="createBinding">
            <Checkbox
              name="createBinding"
              value="Create new Service Binding"
              inputProps={checkBoxInputProps}
              initialChecked={true}
              onChange={(_, value) => setCreateBinding(value)}
            />
          </FormItem>
          {!createBinding && serviceBindings.length ? (
            <FormItem key="existingBindings">
              <FormLabel htmlFor="existingBindings">Service Bindings</FormLabel>
              <select
                id="existingBindings"
                value={existingBindings}
                onChange={e => setExistingBindings(e.target.value)}
                required
              >
                <option value=""></option>
                {serviceBindings.map(b => (
                  <option value={b.metadata.name} key={b.metadata.uid}>
                    {b.metadata.name}
                  </option>
                ))}
              </select>
            </FormItem>
          ) : null}
          {!createBinding && !serviceBindings.length
            ? noServiceBindingsFound
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
