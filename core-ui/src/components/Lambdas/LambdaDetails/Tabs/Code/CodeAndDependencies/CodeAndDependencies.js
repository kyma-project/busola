import React, { useState, useEffect } from 'react';
import { Button, Switch } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

import { Tooltip } from 'react-shared';
import { TabsWithActions } from 'components/Lambdas/components';

import Editor from './Editor';

import { useUpdateLambda, UPDATE_TYPE } from 'components/Lambdas/hooks';

import './CodeAndDependencies.scss';
import {
  runtimeToMonacoEditorLang,
  checkDepsValidity,
} from 'components/Lambdas/helpers/runtime';

const DISABLED_CAUSES = {
  VALID: 'VALID',
  EMPTY_SOURCE: 'EMPTY_SOURCE',
  INVALID_DEPS: 'INVALID_DEPS',
  NO_CHANGES: 'NO_CHANGES',
};

export default function CodeAndDependencies({ lambda }) {
  const { t } = useTranslation();
  const updateLambda = useUpdateLambda({
    lambda,
    type: UPDATE_TYPE.CODE_AND_DEPENDENCIES,
  });

  const [showDiff, setShowDiff] = useState(false);
  const [disabledCause, setDisabledCause] = useState(
    DISABLED_CAUSES.NO_CHANGES,
  );

  const [code, setCode] = useState(lambda.spec.source);
  const [controlledCode, setControlledCode] = useState(lambda.spec.source);

  const [dependencies, setDependencies] = useState(lambda.spec.deps);
  const [controllerDependencies, setControlledDependencies] = useState(
    lambda.spec.deps,
  );

  const [debouncedCallback] = useDebouncedCallback(() => {
    checkValidity();
  }, 150);

  useEffect(() => {
    checkValidity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function checkValidity() {
    const trimmedCode = (code || '').trim();
    if (!trimmedCode) {
      setDisabledCause(DISABLED_CAUSES.EMPTY_SOURCE);
      return;
    }

    const deps = (dependencies || '').trim();

    if (!checkDepsValidity(lambda.spec.runtime, deps)) {
      setDisabledCause(DISABLED_CAUSES.INVALID_DEPS);
      return;
    }

    const isDiff =
      lambda.spec.source !== code || lambda.spec.deps !== dependencies;
    if (!isDiff) {
      setDisabledCause(DISABLED_CAUSES.NO_CHANGES);
      return;
    }

    setDisabledCause(DISABLED_CAUSES.VALID);
  }

  function onChangeToggle() {
    setControlledCode(code);
    setControlledDependencies(dependencies);
    setShowDiff(prev => !prev);
  }

  function handleSave() {
    updateLambda({
      spec: {
        ...lambda.spec,
        source: code,
        deps: dependencies,
      },
    });
    setDisabledCause(DISABLED_CAUSES.NO_CHANGES);
  }

  function checkPopupMessage() {
    let message = '';
    switch (disabledCause) {
      case DISABLED_CAUSES.EMPTY_SOURCE: {
        message = t('functions.create-view.errors.empty-source');
        break;
      }
      case DISABLED_CAUSES.INVALID_DEPS: {
        message = t('functions.create-view.errors.invalid-deps');
        break;
      }
      case DISABLED_CAUSES.NO_CHANGES: {
        message = t('functions.create-view.errors.no-changes');
        break;
      }
      default:
        message = '';
    }
    return message;
  }

  const popupMessage = checkPopupMessage();
  const disabled = !!popupMessage;

  const button = (
    <Button
      glyph="save"
      compact
      option={disabled ? 'transparent' : 'emphasized'}
      typeAttr="button"
      disabled={disabled}
      onClick={handleSave}
    >
      {t('common.buttons.save')}
    </Button>
  );

  const saveButton = disabled ? (
    <Tooltip
      content={popupMessage}
      position="top"
      trigger="mouseenter"
      tippyProps={{
        distance: 16,
      }}
    >
      {button}
    </Tooltip>
  ) : (
    button
  );

  const toggle = (
    <Switch compact onChange={onChangeToggle}>
      {t('functions.details.buttons.diff_toggle')}
    </Switch>
  );
  const actions = (
    <>
      {toggle}
      {saveButton}
    </>
  );

  const {
    language: monacoEditorLang,
    dependencies: monacoEditorDeps,
  } = runtimeToMonacoEditorLang(lambda.spec.runtime);

  const tabsData = [
    {
      id: 'function-code',
      title: t('functions.variable.header.source'),
      body: (
        <Editor
          id="lambda-code"
          language={monacoEditorLang}
          showDiff={showDiff}
          originalValue={lambda.spec.source}
          value={code}
          controlledValue={controlledCode}
          setValue={setCode}
          setControlledValue={setControlledCode}
          debouncedCallback={debouncedCallback}
        />
      ),
    },
    {
      id: 'function-dependencies',
      title: t('functions.details.title.dependencies'),
      body: (
        <Editor
          id="lambda-dependencies"
          language={monacoEditorDeps}
          showDiff={showDiff}
          originalValue={lambda.spec.deps}
          value={dependencies}
          controlledValue={controllerDependencies}
          setValue={setDependencies}
          setControlledValue={setControlledDependencies}
          debouncedCallback={debouncedCallback}
        />
      ),
    },
  ];

  return (
    <TabsWithActions
      className="fd-margin--md lambda-code-and-deps"
      tabsData={tabsData}
      actions={actions}
    />
  );
}
