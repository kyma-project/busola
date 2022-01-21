import React, { useRef, useEffect } from 'react';
import classnames from 'classnames';
import jsyaml from 'js-yaml';
import { EditorActions } from 'react-shared';
import { useTranslation } from 'react-i18next';

import { ModeSelector } from './ModeSelector';
import { ResourceFormWrapper } from './Wrapper';
import { Presets } from './Presets';
import { Editor } from '../fields/Editor';
import { useCreateResource } from '../useCreateResource';

import './ResourceForm.scss';

export function ResourceForm({
  pluralKind, // used for the request path
  singularName,
  resource,
  initialResource,
  setResource,
  setCustomValid,
  onChange,
  formElementRef,
  children,
  renderEditor,
  createUrl,
  presets,
  onPresetSelected,
  afterCreatedFn,
  className,
  onlyYaml = false,
}) {
  const { i18n } = useTranslation();
  const createResource = useCreateResource({
    singularName,
    pluralKind,
    resource,
    initialResource,
    createUrl,
    afterCreatedFn,
  });

  const [mode, setMode] = React.useState(
    onlyYaml ? ModeSelector.MODE_YAML : ModeSelector.MODE_SIMPLE,
  );
  const [actionsEditor, setActionsEditor] = React.useState(null);
  const validationRef = useRef(true);

  useEffect(() => {
    if (setCustomValid) {
      setCustomValid(validationRef.current);
    }
    validationRef.current = true;
  }, [setCustomValid, resource, children]);

  const convertedResource = jsyaml.dump(resource);

  const presetsSelector = presets?.length && (
    <Presets
      presets={presets}
      onSelect={({ value }) => {
        if (onPresetSelected) {
          onPresetSelected(value);
        } else {
          setResource(value);
        }

        if (onChange) {
          onChange(new Event('input', { bubbles: true }));
        }
      }}
    />
  );

  let editor = (
    <Editor
      value={resource}
      setValue={setResource}
      editorDidMount={(_, e) => {
        setActionsEditor(e);
      }}
    />
  );
  editor = renderEditor
    ? renderEditor({ defaultEditor: editor, Editor })
    : editor;

  return (
    <section className={classnames('resource-form', className)}>
      {presetsSelector}
      {onlyYaml ? null : <ModeSelector mode={mode} setMode={setMode} />}
      <form ref={formElementRef} onSubmit={createResource}>
        {mode === ModeSelector.MODE_SIMPLE && (
          <div onChange={onChange} className="simple-form">
            <ResourceFormWrapper
              resource={resource}
              setResource={setResource}
              isAdvanced={false}
            >
              {children}
            </ResourceFormWrapper>
          </div>
        )}
        {mode === ModeSelector.MODE_YAML && (
          <>
            <EditorActions
              val={convertedResource}
              editor={actionsEditor}
              title={`${resource?.metadata?.name || singularName}.yaml`}
              saveHidden
              i18n={i18n}
            />
            {editor}
          </>
        )}
        {/* always keep the advanced form to ensure validation */}
        <div
          className="advanced-form"
          onChange={onChange}
          hidden={mode !== ModeSelector.MODE_ADVANCED}
        >
          <ResourceFormWrapper
            resource={resource}
            setResource={setResource}
            isAdvanced={true}
            validationRef={validationRef}
          >
            {children}
          </ResourceFormWrapper>
        </div>
      </form>
    </section>
  );
}
