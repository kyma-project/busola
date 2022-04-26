import React, { useState, useEffect, useRef } from 'react';

import { LayoutPanel, Button } from 'fundamental-react';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { FormInput } from 'components/Functions/components';
import { useTranslation } from 'react-i18next';

import { useUpdateFunction, UPDATE_TYPE } from 'components/Functions/hooks';
import { REPOSITORY_CONFIG_PANEL } from 'components/Functions/constants';

import './RepositoryConfig.scss';

const ERRORS = {
  REFERENCE: 'reference',
  BASE_DIR: 'baseDir',
};

export default function RepositoryConfig({ func }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [errors, setErrors] = useState([]);
  const [editStatus, setEditStatus] = useState('');
  const updateFunction = useUpdateFunction({
    func,
    type: UPDATE_TYPE.REPOSITORY_CONFIG,
  });

  const referenceCompRef = useRef(null);
  const referenceRef = useRef('');

  const baseDirCompRef = useRef(null);
  const baseDirRef = useRef('');

  const { t } = useTranslation();

  function clearValues() {
    referenceCompRef.current &&
      typeof referenceCompRef.current.setFirstValue === 'function' &&
      referenceCompRef.current.setFirstValue();
    baseDirCompRef.current &&
      typeof baseDirCompRef.current.setFirstValue === 'function' &&
      baseDirCompRef.current.setFirstValue();
  }

  function addError(error) {
    setErrors([...errors, error]);
  }

  function removeError(error) {
    setErrors(errors.filter(err => err !== error));
  }

  useEffect(() => {
    if (errors.length) {
      setEditStatus(t('functions.create-view.errors.one-field-invalid'));
      setIsValid(false);
    } else {
      if (
        referenceRef?.current?.value === func.spec.reference &&
        baseDirRef?.current?.value === func.spec.baseDir
      ) {
        setEditStatus(t('functions.create-view.errors.no-changes'));
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    }
  }, [errors, setIsValid, setEditStatus, baseDirRef, referenceRef, func, t]);

  function validateReference(reference, setStatus) {
    if (!reference) {
      setStatus(t('functions.details.errors.req-reference'));
      addError(ERRORS.REFERENCE);
      return;
    }
    setStatus('');
    removeError(ERRORS.REFERENCE);
  }

  function validateBaseDir(baseDir, setStatus) {
    if (!baseDir) {
      setStatus(t('functions.details.errors.req-base-dir'));
      addError(ERRORS.BASE_DIR);
      return;
    }
    setStatus('');
    removeError(ERRORS.BASE_DIR);
  }

  function handleSave() {
    let reference = referenceRef?.current?.value || null;
    if (typeof reference === 'string') {
      reference = reference.trim();
    }

    let baseDir = baseDirRef?.current?.value || null;
    if (typeof baseDir === 'string') {
      baseDir = baseDir.trim();
    }

    updateFunction({
      spec: {
        ...func.spec,
        reference: reference,
        baseDir: baseDir,
      },
    });
    setEditStatus(t('functions.create-view.errors.no-changes'));
  }

  function renderCancelButton() {
    if (!isEditMode) {
      return null;
    }

    return (
      <Button
        glyph="sys-cancel"
        type="negative"
        onClick={async () => {
          setIsEditMode(false);
          setIsValid(true);
          clearValues();
        }}
      >
        {t('common.buttons.cancel')}
      </Button>
    );
  }

  function renderConfirmButton() {
    const saveText = t('common.buttons.save');
    const editText = t('functions.details.buttons.edit-configuration');
    const button = (
      <Button
        glyph={isEditMode ? 'save' : 'edit'}
        option={isEditMode ? 'emphasized' : 'transparent'}
        typeAttr="submit"
        onClick={() => {
          if (isEditMode) {
            handleSave();
          }
          setIsEditMode(prev => !prev);
        }}
        disabled={isEditMode && !isValid}
      >
        {isEditMode ? saveText : editText}
      </Button>
    );

    if (isEditMode && !isValid) {
      return (
        <Tooltip
          content={editStatus}
          position="top"
          trigger="mouseenter"
          tippyProps={{
            distance: 16,
          }}
        >
          {button}
        </Tooltip>
      );
    }
    return button;
  }

  return (
    <LayoutPanel className="fd-margin--md function-repository-config">
      <LayoutPanel.Header>
        <LayoutPanel.Head title={t('functions.repository.title')} />
        <LayoutPanel.Actions>
          {renderCancelButton()}
          {renderConfirmButton()}
        </LayoutPanel.Actions>
      </LayoutPanel.Header>
      <LayoutPanel.Body>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr ',
            gridGap: '1rem',
          }}
        >
          <LayoutPanel className="has-box-shadow-none">
            <LayoutPanel.Header className="has-padding-none has-none-border-bottom">
              <LayoutPanel.Head
                title={t('functions.create-view.labels.reference')}
                description={t(
                  'functions.details.inline-help.function-reference',
                )}
              />
            </LayoutPanel.Header>
            <LayoutPanel.Body className="has-padding-none">
              <FormInput
                ref={referenceCompRef}
                _ref={referenceRef}
                noLabel={true}
                disabled={!isEditMode}
                id="reference"
                placeholder={
                  REPOSITORY_CONFIG_PANEL.INPUTS.REFERENCE.PLACEHOLDER
                }
                validate={validateReference}
                firstValue={func.spec.reference}
              />
            </LayoutPanel.Body>
          </LayoutPanel>

          <LayoutPanel className="has-box-shadow-none">
            <LayoutPanel.Header className="has-padding-none has-none-border-bottom">
              <LayoutPanel.Head
                title={t('functions.create-view.labels.base-directory')}
                description={t(
                  'functions.create-view.inline-help.base-directory',
                )}
              />
            </LayoutPanel.Header>
            <LayoutPanel.Body className="has-padding-none">
              <FormInput
                ref={baseDirCompRef}
                _ref={baseDirRef}
                noLabel={true}
                disabled={!isEditMode}
                id="baseDir"
                placeholder={
                  REPOSITORY_CONFIG_PANEL.INPUTS.BASE_DIR.PLACEHOLDER
                }
                validate={validateBaseDir}
                firstValue={func.spec.baseDir}
              />
            </LayoutPanel.Body>
          </LayoutPanel>
        </div>
      </LayoutPanel.Body>
    </LayoutPanel>
  );
}
