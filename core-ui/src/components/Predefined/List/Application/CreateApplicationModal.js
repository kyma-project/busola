import React from 'react';
import { Button, FormFieldset } from 'fundamental-react';
import {
  ModalWithForm,
  TextFormItem,
  LabelSelectorInput,
  usePost,
  Tooltip,
} from 'react-shared';
import { useTranslation } from 'react-i18next';
import { useIsSKR } from 'components/Predefined/Details/Application/useIsSKR';

export function createApplicationInput({ name, description, labels }) {
  return {
    apiVersion: 'applicationconnector.kyma-project.io/v1alpha1',
    kind: 'Application',
    metadata: {
      name,
      labels,
    },
    spec: {
      accessLabel: name,
      description,
      services: [],
    },
  };
}

export function CreateApplicationForm({
  formElementRef,
  onChange,
  onCompleted,
  onError,
}) {
  const { i18n, t } = useTranslation();
  // https://github.com/kubernetes/kubernetes/blob/v1.10.1/staging/src/k8s.io/apimachinery/pkg/util/validation/validation.go
  const applicationNameRegex =
    '^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$';

  const [application, setApplication] = React.useState({});

  const postRequest = usePost();

  async function handleFormSubmit(e) {
    e.preventDefault();
    try {
      const applicationInput = createApplicationInput(application);
      await postRequest(
        '/apis/applicationconnector.kyma-project.io/v1alpha1/applications',
        applicationInput,
      );
      onCompleted(
        t('applications.messages.created', {
          applicationName: application.name,
        }),
      );
    } catch (e) {
      console.warn(e);
      onError(
        t('applications.messages.cannot-create'),
        `${t('common.tooltips.error')} ${e.message}`,
      );
    }
  }

  return (
    <form
      onChange={onChange}
      ref={formElementRef}
      onSubmit={handleFormSubmit}
      noValidate
    >
      <FormFieldset>
        <TextFormItem
          inputKey="name"
          required
          inputProps={{ pattern: applicationNameRegex }}
          label={t('common.headers.name')}
          placeholder={t('applications.placeholders.name')}
          onChange={e =>
            setApplication({ ...application, name: e.target.value })
          }
        />
        <TextFormItem
          inputKey="description"
          label={t('applications.labels.description')}
          placeholder={t('applications.placeholders.description')}
          onChange={e =>
            setApplication({ ...application, description: e.target.value })
          }
        />
        <LabelSelectorInput
          labels={application.labels || {}}
          onChange={labels => setApplication({ ...application, labels })}
          i18n={i18n}
        />
      </FormFieldset>
    </form>
  );
}

export default function CreateApplicationModal() {
  const { i18n, t } = useTranslation();
  const isSKR = useIsSKR();

  let modalOpeningComponent = (
    <Button glyph="add" disabled={isSKR}>
      {t('applications.buttons.create-app')}
    </Button>
  );

  if (isSKR) {
    modalOpeningComponent = (
      <Tooltip delay={0} content={t('applications.messages.create-disabled')}>
        {modalOpeningComponent}
      </Tooltip>
    );
  }

  return (
    <ModalWithForm
      title={t('applications.subtitle.create-app')}
      modalOpeningComponent={modalOpeningComponent}
      confirmText={t('common.buttons.create')}
      renderForm={props => <CreateApplicationForm {...props} />}
      i18n={i18n}
    />
  );
}
