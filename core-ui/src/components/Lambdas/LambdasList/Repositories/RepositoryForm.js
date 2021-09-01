import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import {
  randomNameGenerator,
  useMicrofrontendContext,
  Dropdown,
} from 'react-shared';

import { ResourceNameInput, FormInput } from 'components/Lambdas/components';
import { validateResourceName } from 'components/Lambdas/helpers/misc';
import { isGitUrl } from 'components/Lambdas/helpers/repositories';
import { REPOSITORIES_LIST } from 'components/Lambdas/constants';

export const FORM_TYPE = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
};

const ERRORS = {
  NAME: 'name',
  REPOSITORY_URL: 'repositoryUrl',
  SECRET_NAME: 'secretName',
};

export default function RepositoryForm({
  onChange,
  formElementRef,
  isValid = false,
  setValidity = () => void 0,
  setInvalidModalPopupMessage = () => void 0,
  repository = void 0,
  repositoryNames = [],
  onSubmitAction,
  formType = FORM_TYPE.CREATE,
}) {
  const { namespaceId: namespace } = useMicrofrontendContext();
  const [errors, setErrors] = useState(
    repository ? [] : [ERRORS.REPOSITORY_URL],
  );

  const [name, setName] = useState(randomNameGenerator());
  const [nameStatus, setNameStatus] = useState('');

  const [showSecretName, setShowSecretName] = useState(!!repository?.spec.auth);

  const urlRef = useRef('');
  const authTypeRef = useRef('');
  const secretNameRef = useRef('');

  const { t } = useTranslation();

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
      setInvalidModalPopupMessage(t('functions.create-view.errors.invalid'));
      setValidity(false);
    }
  }, [isValid, errors, setValidity, setInvalidModalPopupMessage, t]);

  useEffect(() => {
    if (showSecretName) {
      if (!(secretNameRef.current && secretNameRef.current.value)) {
        addError(ERRORS.SECRET_NAME);
      }
    } else {
      removeError(ERRORS.SECRET_NAME);
    }
  }, [showSecretName, addError, removeError]);

  useEffect(() => {
    const validationMessage = validateResourceName(
      name,
      REPOSITORIES_LIST.MODAL_INPUTS.NAME.ERRORS,
      t,
    );
    if (validationMessage) {
      setNameStatus(validationMessage);
      addError(ERRORS.NAME);
      return;
    }
    setNameStatus('');
    removeError(ERRORS.NAME);
  }, [setNameStatus, repositoryNames, name, addError, removeError, t]);

  useEffect(() => {
    if (errors.length) {
      setInvalidModalPopupMessage(t('functions.create-view.errors.invalid'));
      setValidity(false);
    } else {
      setInvalidModalPopupMessage('');
      setValidity(true);
    }
  }, [errors, setValidity, setInvalidModalPopupMessage, t]);

  function validateRepositoryUrl(url, setStatus) {
    if (!url) {
      setStatus(t('functions.repository-list.errors.req-name'));
      addError(ERRORS.REPOSITORY_URL);
      return;
    }

    const isCorrectUrl = isGitUrl(url);
    if (!isCorrectUrl) {
      setStatus(t('functions.repository-list.errors.invalid-url'));
      addError(ERRORS.REPOSITORY_URL);
      return;
    }

    setStatus('');
    removeError(ERRORS.REPOSITORY_URL);
  }

  function validateSecretName(secretName, setStatus) {
    const validationMessage = validateResourceName(
      secretName,
      REPOSITORIES_LIST.MODAL_INPUTS.SECRET_NAME.ERRORS,
      t,
    );
    if (validationMessage) {
      setStatus(validationMessage);
      addError(ERRORS.SECRET_NAME);
      return;
    }

    setStatus('');
    removeError(ERRORS.SECRET_NAME);
  }

  function updateName(event) {
    setName(event.target.value);
  }

  function updateAuthType(selected) {
    authTypeRef.current = selected.key;
    setShowSecretName(selected.key !== '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const spec = {
      url: urlRef.current.value.trim(),
      auth: null,
    };

    if (authTypeRef.current) {
      spec.auth = {
        type: authTypeRef.current,
        secretName: secretNameRef.current.value.trim(),
      };
    }

    if (formType === FORM_TYPE.CREATE) {
      await onSubmitAction({
        name: name,
        namespace,
        spec,
      });
    } else {
      await onSubmitAction(spec);
    }
  }

  const authTypeOptions = REPOSITORIES_LIST.MODAL_INPUTS.AUTH_TYPE.OPTIONS.map(
    option => ({
      key: option.KEY,
      text: option.VALUE,
    }),
  );

  return (
    <form
      ref={formElementRef}
      style={{ width: '30em' }}
      onChange={onChange}
      onSubmit={handleSubmit}
      noValidate
    >
      {!repository && (
        <ResourceNameInput
          id="repositoryName"
          kind="Repository"
          value={name}
          onChange={updateName}
          nameStatus={nameStatus}
        />
      )}

      <FormInput
        _ref={urlRef}
        required={true}
        label={t('functions.repository-list.labels.url')}
        inlineHelp={t('functions.repository-list.inline-help.url')}
        id="repositoryUrl"
        placeholder={REPOSITORIES_LIST.MODAL_INPUTS.URL.PLACEHOLDER}
        validate={validateRepositoryUrl}
        firstValue={repository?.spec.url}
      />

      <Dropdown
        label={t('functions.repository-list.labels.auth')}
        inlineHelp={t('functions.repository-list.inline-help.auth')}
        options={authTypeOptions}
        id="authType"
        onSelect={(_, selected) => updateAuthType(selected)}
        selectedKey={authTypeOptions[0].key}
      />

      {showSecretName && (
        <FormInput
          _ref={secretNameRef}
          required={true}
          label={t('functions.repository-list.labels.secret-name')}
          inlineHelp={'common.tooltips.k8s-name-input'}
          id="secretName"
          placeholder={REPOSITORIES_LIST.MODAL_INPUTS.SECRET_NAME.PLACEHOLDER}
          validate={validateSecretName}
          firstValue={repository?.spec.auth?.secretName}
        />
      )}
    </form>
  );
}
