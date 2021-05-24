import React, { useState, useEffect, useRef, useCallback } from 'react';

import { MessageStrip } from 'fundamental-react';

import {
  ResourceNameInput,
  LabelsInput,
  DropdownInput,
  FormInput,
} from 'components/Lambdas/components';

import { useCreateLambda } from 'components/Lambdas/hooks';

import { validateResourceName } from 'components/Lambdas/helpers/misc';
import { randomNameGenerator, useMicrofrontendContext } from 'react-shared';

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

  useEffect(() => {
    if (isValid && errors.length) {
      setInvalidModalPopupMessage(LAMBDAS_LIST.CREATE_MODAL.ERRORS.INVALID);
      setValid(false);
    } else if (!isValid && !errors.length) {
      setInvalidModalPopupMessage('');
      setValid(true);
    }
  }, [isValid, errors, setValid, setInvalidModalPopupMessage]);

  useEffect(() => {
    if (sourceType) {
      if (!repositories.length) {
        addError(ERRORS.REPOSITORY_URL);
        setInvalidModalPopupMessage(
          LAMBDAS_LIST.CREATE_MODAL.ERRORS.NO_REPOSITORY_FOUND,
        );
      }
    } else if (errors && errors.length) {
      removeError(ERRORS.REPOSITORY_URL, ERRORS.REFERENCE, ERRORS.BASE_DIR);
    }
  }, [
    errors,
    sourceType,
    setInvalidModalPopupMessage,
    repositories,
    addError,
    removeError,
  ]);

  function validateName(name) {
    setName(name);
    const validationMessage = validateResourceName(
      name,
      LAMBDAS_LIST.CREATE_MODAL.INPUTS.NAME.ERRORS,
    );
    if (validationMessage) {
      setNameStatus(validationMessage);
      // addError(ERRORS.NAME);
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
      key: lang,
      value: runtime,
    }),
  );
  const sourceTypeOptions = LAMBDAS_LIST.CREATE_MODAL.INPUTS.SOURCE_TYPE.OPTIONS.map(
    sourceType => ({
      key: sourceType.KEY,
      value: sourceType.VALUE,
    }),
  );
  const repositoryOptions = repositories?.map(repository => ({
    key: `${repository.metadata.name} (${repository.spec.url})`,
    value: repository.metadata.name,
  }));

  return (
    <form
      ref={formElementRef}
      style={{ width: '30em' }}
      onChange={onChange}
      onSubmit={handleSubmit}
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

      <DropdownInput
        label={LAMBDAS_LIST.CREATE_MODAL.INPUTS.RUNTIME.LABEL}
        inlineHelp={LAMBDAS_LIST.CREATE_MODAL.INPUTS.RUNTIME.INLINE_HELP}
        options={runtimeOptions}
        id="runtime"
        defaultValue={runtime}
        onChange={e => setRuntime(e.target.value)}
      />

      <DropdownInput
        label={LAMBDAS_LIST.CREATE_MODAL.INPUTS.SOURCE_TYPE.LABEL}
        inlineHelp={LAMBDAS_LIST.CREATE_MODAL.INPUTS.SOURCE_TYPE.INLINE_HELP}
        options={sourceTypeOptions}
        defaultValue={sourceType}
        id="sourceType"
        onChange={e => setSourceType(e.target.value)}
      />

      {sourceType &&
        (!repositories.length ? (
          <MessageStrip dismissible={false} type="information">
            {LAMBDAS_LIST.CREATE_MODAL.ERRORS.NO_REPOSITORY_FOUND}
          </MessageStrip>
        ) : (
          <>
            <DropdownInput
              label={LAMBDAS_LIST.CREATE_MODAL.INPUTS.REPOSITORY.LABEL}
              inlineHelp={
                LAMBDAS_LIST.CREATE_MODAL.INPUTS.REPOSITORY.INLINE_HELP
              }
              options={repositoryOptions}
              id="repositoryName"
              defaultValue={repositoryName}
              onChange={e => setRepositoryName(e.target.value)}
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
