import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  FormItem,
  FormLabel,
  FormInput,
  MessageStrip,
} from 'fundamental-react';
import {
  Checkbox,
  useGetList,
  useCreateServiceBindingUsage,
  Dropdown,
} from 'react-shared';

import { SERVICE_BINDINGS_PANEL } from '../constants';

const checkBoxInputProps = {
  style: {
    marginRight: '6px',
  },
};

const ApplicationsDropdown = ({
  usageKinds,
  serviceInstance,
  selectedResource,
  setSelectedResource,
  selectedUsageKind,
  setSelectedUsageKind,
}) => {
  const { data: resources } = useGetList()(
    `/apis/${selectedUsageKind.spec.resource.group}/${selectedUsageKind.spec.resource.version}/namespaces/${serviceInstance.metadata.namespace}/${selectedUsageKind.spec.resource.kind}s`,
    {},
  );

  useEffect(() => {
    if (resources?.length) {
      setSelectedResource(resources[0]);
    }
  }, [resources, setSelectedResource]);

  return (
    <>
      <Dropdown
        id="usage-kinds-dropdown"
        label="Usage Kind"
        options={usageKinds?.map(
          u =>
            ({
              key: u.metadata.name,
              text: u.metadata.name,
            } || []),
        )}
        selectedKey={selectedUsageKind.metadata.name}
        onSelect={(_, selected) => {
          setSelectedUsageKind(
            usageKinds.find(u => u.metadata.name === selected.key),
          );
        }}
      />
      {selectedResource && (
        <Dropdown
          id="resources-dropdown"
          label="Application"
          options={resources?.map(
            selectedResource =>
              ({
                key: selectedResource.metadata.name,
                text: selectedResource.metadata.name,
              } || []),
          )}
          selectedKey={selectedResource.metadata.name}
          onSelect={(_, selected) => {
            setSelectedResource(
              resources.find(r => r.metadata.name === selected.key),
            );
          }}
        />
      )}
    </>
  );
};

export default function CreateServiceBindingForm({
  serviceInstance,
  usageKinds = [],
  serviceBindings = [],
  setPopupModalMessage = () => void 0,
  onChange,
  formElementRef,
  setCustomValid = () => void 0,
}) {
  const createServiceBindingUsageSet = useCreateServiceBindingUsage();

  const [envPrefix, setEnvPrefix] = useState('');

  const [createBinding, setCreateBinding] = useState(true);
  const [existingBindings, setExistingBindings] = useState('');

  const [selectedUsageKind, setSelectedUsageKind] = useState(usageKinds[0]);
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    if (!selectedResource) {
      setEnvPrefix('');
      setCreateBinding(true);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResource]);

  useEffect(() => {
    if (!selectedResource) {
      setPopupModalMessage(
        SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .NO_APP_SELECTED,
      );
      setCustomValid(false);
      return;
    }

    if (!createBinding && !existingBindings) {
      setPopupModalMessage(
        SERVICE_BINDINGS_PANEL.CREATE_MODAL.CONFIRM_BUTTON.POPUP_MESSAGES
          .NO_BINDING_SELECTED,
      );
      setCustomValid(false);
      return;
    }
    setCustomValid(true);
  }, [
    selectedResource,
    createBinding,
    existingBindings,
    setCustomValid,
    setPopupModalMessage,
  ]);

  useEffect(() => setExistingBindings(''), [selectedResource, createBinding]);

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
        name: selectedResource.metadata.name,
        kind: selectedUsageKind.metadata.name,
      },
      existingCredentials: existingBindings || undefined,
    };

    await createServiceBindingUsageSet(parameters);
  }

  const noServiceBindingsFound = (
    <MessageStrip dismissible={false} type="information">
      {SERVICE_BINDINGS_PANEL.FORM.NO_BINDINGS_FOUND}
    </MessageStrip>
  );

  return (
    <form
      ref={formElementRef}
      style={{ width: '30em' }}
      onChange={onChange}
      onSubmit={handleFormSubmit}
    >
      <FormItem>
        <ApplicationsDropdown
          usageKinds={usageKinds}
          serviceInstance={serviceInstance}
          selectedResource={selectedResource}
          setSelectedResource={setSelectedResource}
          selectedUsageKind={selectedUsageKind}
          setSelectedUsageKind={setSelectedUsageKind}
        />
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

      {selectedResource && (
        <>
          <FormItem key="createBinding">
            <Checkbox
              name="createBinding"
              value="Create new Service Binding"
              inputProps={checkBoxInputProps}
              initialChecked={true}
              onChange={(_, value) => setCreateBinding(value)}
            >
              Create new Service Binding
            </Checkbox>
          </FormItem>
          {!createBinding && serviceBindings.length ? (
            <FormItem key="existingBindings">
              <FormLabel htmlFor="existingBindings">Service Bindings</FormLabel>
              <select
                id="existingBindings"
                className="fd-form-select"
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
  setCustomValid: PropTypes.func,
  formElementRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
};
