import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageStrip } from 'fundamental-react';
import {
  randomNameGenerator,
  useMicrofrontendContext,
  Dropdown,
} from 'react-shared';

import {
  ResourceNameInput,
  LabelsInput,
  FormInput,
} from 'components/Lambdas/components';
import { useCreateLambda } from 'components/Lambdas/hooks';
import { validateResourceName } from 'components/Lambdas/helpers/misc';
import {
  functionAvailableLanguages,
  nodejs14,
} from 'components/Lambdas/helpers/runtime';
import { LAMBDAS_LIST } from 'components/Lambdas/constants';

const ERRORS = {
  NAME: 'name',
  REPOSITORY_URL: 'repositoryUrl',
  REFERENCE: 'reference',
  BASE_DIR: 'baseDir',
};

export default function CreateLambdaForm({
  onChange,
  formElementRef,
  isValid = true,
  setValid = () => void 0,
  setInvalidModalPopupMessage = () => void 0,
  repositories = [],
}) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const createLambda = useCreateLambda({ redirect: true });

  const [errors, setErrors] = useState([]);
  const [nameStatus, setNameStatus] = useState('');
  const [name, setName] = useState(randomNameGenerator());
  const [labels, setLabels] = useState({});
  const [runtime, setRuntime] = useState(nodejs14);
  const [sourceType, setSourceType] = useState('');
  const [repositoryName, setRepositoryName] = useState(
    repositories.length ? repositories[0].metadata.name : '',
  );

  const referenceRef = useRef('');
  const baseDirRef = useRef('');

  const addError = useCallback(
    (...newErrors) => setErrors(oldErrors => [...oldErrors, ...newErrors]),
    [setErrors],
  );
  const removeError = useCallback(
    (...newErrors) =>
      setErrors(oldErrors => oldErrors.filter(err => !newErrors.includes(err))),
    [setErrors],
  );

  const { t } = useTranslation();
  useEffect(() => {
    if (isValid && errors.length) {
      setInvalidModalPopupMessage(t('functions.create-view.errors.invalid'));
      setValid(false);
    } else if (!isValid && !errors.length) {
      setInvalidModalPopupMessage('');
      setValid(true);
    }
  }, [isValid, errors, setValid, setInvalidModalPopupMessage, t]);

  useEffect(() => {
    if (sourceType) {
      if (!repositories.length) {
        addError(ERRORS.REPOSITORY_URL);
        setInvalidModalPopupMessage(
          t('functions.create-view.errors.no-repository-found'),
        );
      }
    } else {
      removeError(ERRORS.REPOSITORY_URL, ERRORS.REFERENCE, ERRORS.BASE_DIR);
    }
  }, [
    sourceType,
    setInvalidModalPopupMessage,
    repositories,
    addError,
    removeError,
    t,
  ]);

  function validateName(name) {
    setName(name);
    const validationMessage = validateResourceName(
      name,
      LAMBDAS_LIST.CREATE_MODAL.INPUTS.NAME.ERRORS,
      t,
    );
    if (validationMessage) {
      setNameStatus(validationMessage);
      addError(ERRORS.NAME);
      return;
    }
    setNameStatus('');
    removeError(ERRORS.NAME);
  }

  function validateReference(reference, setStatus) {
    if (!reference) {
      setStatus(LAMBDAS_LIST.CREATE_MODAL.INPUTS.REFERENCE.ERRORS.EMPTY);
      addError(ERRORS.REFERENCE);
      return;
    }
    setStatus('');
    removeError(ERRORS.REFERENCE);
  }

  function validateBaseDir(baseDir, setStatus) {
    if (!baseDir) {
      setStatus(LAMBDAS_LIST.CREATE_MODAL.INPUTS.BASE_DIR.ERRORS.EMPTY);
      addError(ERRORS.BASE_DIR);
      return;
    }
    setStatus('');
    removeError(ERRORS.BASE_DIR);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let inputData = {
      labels,
      runtime,
    };
    if (sourceType) {
      let reference = referenceRef?.current?.value || null;
      if (typeof reference === 'string') {
        reference = reference.trim();
      }

      let baseDir = baseDirRef?.current?.value || null;
      if (typeof baseDir === 'string') {
        baseDir = baseDir.trim();
      }

      inputData = {
        ...inputData,
        type: sourceType,
        source: repositoryName,
        reference,
        baseDir,
      };
    }

    await createLambda({
      name: name,
      namespace,
      inputData,
    });
  }

  const runtimeOptions = Object.entries(functionAvailableLanguages).map(
    ([runtime, lang]) => ({
      key: runtime,
      text: lang,
    }),
  );
  const sourceTypeOptions = LAMBDAS_LIST.CREATE_MODAL.INPUTS.SOURCE_TYPE.OPTIONS.map(
    sourceType => ({
      key: sourceType.KEY,
      text: t(sourceType.VALUE),
    }),
  );
  const repositoryOptions = repositories?.map(repository => ({
    key: repository.metadata.name,
    text: `${repository.metadata.name} (${repository.spec.url})`,
  }));

  return (
    <form
      ref={formElementRef}
      style={{ width: '30em' }}
      onChange={onChange}
      onSubmit={handleSubmit}
      noValidate
    >
      <ResourceNameInput
        id="lambdaName"
        kind="Function"
        value={name}
        onChange={e => validateName(e.target.value)}
        nameStatus={nameStatus}
      />

      <LabelsInput
        labels={labels}
        onChange={newLabels => setLabels(newLabels)}
      />

      <Dropdown
        id="function-runtime-dropdown"
        label={t('functions.create-view.labels.runtime')}
        options={runtimeOptions}
        selectedKey={runtimeOptions[0].key}
        onSelect={(_, selected) => setRuntime(selected.key)}
        inlineHelp={t('functions.create-view.inline-help.runtime')}
      />

      <Dropdown
        id="function-source-dropdown"
        label={t('functions.create-view.labels.source-type')}
        options={sourceTypeOptions}
        selectedKey={sourceTypeOptions[0].key}
        onSelect={(_, selected) => setSourceType(selected.key)}
        inlineHelp={t('functions.create-view.inline-help.source-type')}
      />

      {sourceType &&
        (!repositories.length ? (
          <MessageStrip dismissible={false} type="information">
            {t('functions.create-view.errors.no-repository-found')}
          </MessageStrip>
        ) : (
          <>
            <Dropdown
              id="function-repos-dropdown"
              label={t('functions.create-view.labels.repository')}
              options={repositoryOptions}
              selectedKey={repositoryOptions[0].key}
              onSelect={(_, selected) => setRepositoryName(selected.key)}
              inlineHelp={t('functions.create-view.inline-help.repository')}
            />

            <FormInput
              _ref={referenceRef}
              required={true}
              label={LAMBDAS_LIST.CREATE_MODAL.INPUTS.REFERENCE.LABEL}
              inlineHelp={
                LAMBDAS_LIST.CREATE_MODAL.INPUTS.REFERENCE.INLINE_HELP
              }
              id="reference"
              firstValue={'main'}
              placeholder={
                LAMBDAS_LIST.CREATE_MODAL.INPUTS.REFERENCE.PLACEHOLDER
              }
              validate={validateReference}
            />

            <FormInput
              _ref={baseDirRef}
              required={true}
              label={LAMBDAS_LIST.CREATE_MODAL.INPUTS.BASE_DIR.LABEL}
              inlineHelp={LAMBDAS_LIST.CREATE_MODAL.INPUTS.BASE_DIR.INLINE_HELP}
              id="baseDir"
              firstValue={'/'}
              placeholder={
                LAMBDAS_LIST.CREATE_MODAL.INPUTS.BASE_DIR.PLACEHOLDER
              }
              validate={validateBaseDir}
            />
          </>
        ))}
    </form>
  );
}
