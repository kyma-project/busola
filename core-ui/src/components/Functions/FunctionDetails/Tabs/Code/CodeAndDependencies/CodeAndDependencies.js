import React, { useState, useEffect } from 'react';
import { Button } from 'fundamental-react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import { TabsWithActions } from 'components/Functions/components';

import Editor from './Editor';

import { useUpdateFunction, UPDATE_TYPE } from 'components/Functions/hooks';

import './CodeAndDependencies.scss';
import {
  runtimeToMonacoEditorLang,
  checkDepsValidity,
} from 'components/Functions/helpers/runtime';

const DISABLED_CAUSES = {
  VALID: 'VALID',
  EMPTY_SOURCE: 'EMPTY_SOURCE',
  INVALID_DEPS: 'INVALID_DEPS',
  NO_CHANGES: 'NO_CHANGES',
};

export default function CodeAndDependencies({ func }) {
  const { t } = useTranslation();
  const updateFunction = useUpdateFunction({
    func,
    type: UPDATE_TYPE.CODE_AND_DEPENDENCIES,
  });

  const [disabledCause, setDisabledCause] = useState(
    DISABLED_CAUSES.NO_CHANGES,
  );

  const [code, setCode] = useState(func.spec.source);
  const [controlledCode, setControlledCode] = useState(func.spec.source);

  const [dependencies, setDependencies] = useState(func.spec.deps);
  const [controllerDependencies, setControlledDependencies] = useState(
    func.spec.deps,
  );

  const debouncedCallback = useDebouncedCallback(() => {
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

    if (!checkDepsValidity(func.spec.runtime, deps)) {
      setDisabledCause(DISABLED_CAUSES.INVALID_DEPS);
      return;
    }

    const isDiff = func.spec.source !== code || func.spec.deps !== dependencies;
    if (!isDiff) {
      setDisabledCause(DISABLED_CAUSES.NO_CHANGES);
      return;
    }

    setDisabledCause(DISABLED_CAUSES.VALID);
  }

  function handleSave() {
    updateFunction({
      spec: {
        ...func.spec,
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

  const actions = <>{saveButton}</>;

  const {
    language: monacoEditorLang,
    dependencies: monacoEditorDeps,
  } = runtimeToMonacoEditorLang(func.spec.runtime);

  const tabsData = [
    {
      id: 'function-code',
      title: t('functions.variable.header.source'),
      body: (
        <Editor
          id="function-code"
          language={monacoEditorLang}
          originalValue={func.spec.source}
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
          id="function-dependencies"
          language={monacoEditorDeps}
          originalValue={func.spec.deps}
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
      className="fd-margin--md function-code-and-deps"
      tabsData={tabsData}
      actions={actions}
    />
  );
}
