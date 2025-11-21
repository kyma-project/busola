import { useEffect, useRef, useState } from 'react';
import { editor, Uri } from 'monaco-editor';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { themeAtom } from 'state/preferences/themeAtom';

export const getEditorTheme = (theme) => {
  switch (theme) {
    case 'sap_horizon_dark':
      return 'vs-dark';
    case 'sap_horizon_hcb':
      return 'hc-black';
    case 'light_dark':
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'vs-dark'
        : 'vs';
    default:
      return 'vs';
  }
};

export const useCreateEditor = ({
  value,
  options,
  setAutocompleteOptions,
  language,
  readOnly,
}) => {
  const theme = useAtomValue(themeAtom);
  const editorTheme = getEditorTheme(theme);
  const descriptor = useRef(new Uri());
  const divRef = useRef(null);
  const { t } = useTranslation();

  const [editorInstance, setEditorInstance] = useState(null);

  useEffect(() => {
    // setup Monaco editor and pass value updates to parent

    // calling this function sets up autocompletion
    const { modelUri } = setAutocompleteOptions();
    descriptor.current = modelUri;

    const model =
      editor.getModel(modelUri) ||
      editor.createModel(value, language, modelUri);

    // create editor and assign model with value and autocompletion
    const instance = editor.create(divRef.current, {
      model: model,
      automaticLayout: true,
      language: language,
      theme: editorTheme,
      fixedOverflowWidgets: true,
      readOnly: readOnly,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
      },
      accessibilityPageSize: 10,
      ariaLabel: 'Code editor',
      ...options,
    });

    if (divRef.current) {
      const minimapElement = divRef.current.querySelector('.minimap');
      if (minimapElement) {
        minimapElement.setAttribute(
          'title',
          t('common.ariaLabel.code-preview'),
        );
      }
    }

    setEditorInstance(instance);

    return () => {
      editor.getModel(descriptor.current)?.dispose();
      instance.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    descriptor,
    editorTheme,
    setAutocompleteOptions,
    setEditorInstance,
    language,
    t,
    readOnly,
    options,
  ]);

  return { editorInstance, divRef, descriptor };
};
