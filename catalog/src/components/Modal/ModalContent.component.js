import React from 'react';
import Grid from 'styled-components-grid';

import styled from 'styled-components';
import {
  FieldWrapper,
  Input,
  Label,
  InputComponent,
  SelectComponent,
} from '../Form/fields';
import { JsonSchemaForm } from '../Form/JsonSchemaForm';

export const ModalContent = styled.div`
  flex-grow: 1;
  overflow: auto;
  border-bottom: 1px solid rgba(204, 204, 204, 0.3);
`;

const NoFormText = styled(Label)`
  padding: 20px;
  display: block;
  box-sizing: border-box;
`;

export const ModalContentFirstStep = ({
  plans,
  formData,
  onChangeNameInput,
  onChangePlans,
  onChangeLabels,
  checkNameExists,
  instanceNameErrorMessage,
}) => {
  const onBlur = e => checkNameExists(e.target.value);

  return (
    <div>
      <Grid>
        <Grid.Unit size={0.5}>
          <InputComponent
            labelName="Name"
            placeholder="Name of the Service Instance"
            value={formData.name}
            handleChange={onChangeNameInput}
            name="nameServiceInstances"
            required={true}
            onBlur={onBlur}
            errorMessage={instanceNameErrorMessage}
          />
        </Grid.Unit>
        <Grid.Unit size={0.5}>
          <SelectComponent
            labelName="Plan"
            handleChange={onChangePlans}
            name="selectedKind"
            current={formData.plan}
            mappedItems={plans}
            required={true}
          />
        </Grid.Unit>
      </Grid>
      <FieldWrapper>
        <Label>Labels</Label>
        <Input
          type="text"
          placeholder="Separate labels with comma"
          value={formData.label}
          onChange={onChangeLabels}
          name="nameServiceBindingUsage"
        />
      </FieldWrapper>
    </div>
  );
};

export const ModalContentSecondStep = ({
  instanceCreateParameterSchema,
  onChangeSchemaForm,
  onSubmitSchemaForm,
  formData,
  children,
  onError,
}) => {
  if (!instanceCreateParameterSchema) {
    return (
      <NoFormText>
        No further configuration for selected Service Plan is needed. You can
        submit the form and create the service instance.
      </NoFormText>
    );
  }

  return (
    <JsonSchemaForm
      schema={instanceCreateParameterSchema}
      onChange={onChangeSchemaForm}
      onSubmit={onSubmitSchemaForm}
      liveValidate={true}
      onError={onError}
      formData={formData}
    >
      {children}
    </JsonSchemaForm>
  );
};
