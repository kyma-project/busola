import { useEffect, useRef, useState } from 'react';
import { isEqual } from 'lodash';
import { editor } from 'monaco-editor';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';
import { getEditorTheme } from './useCreateEditor';

export const useCreateDiffEditor = ({
  originalValue,
  modifiedValue,
  language,
}) => {
  const theme = useRecoilValue(themeState);
  const editorTheme = getEditorTheme(theme);
  const divRef = useRef(null);
  const { t } = useTranslation();

  const [editorInstance, setEditorInstance] = useState(null);

  useEffect(() => {
    const originalModel = editor.createModel(originalValue, language);
    const modifiedModel = editor.createModel(modifiedValue, language);

    const instance = editor.createDiffEditor(divRef.current, {
      readOnly: true,
      automaticLayout: true,
      theme: editorTheme,
      fixedOverflowWidgets: true,
      scrollbar: {
        alwaysConsumeMouseWheel: false,
      },
    });
    instance.setModel({
      original: originalModel,
      modified: modifiedModel,
    });

    setEditorInstance(instance);

    return () => {
      //   editor.getModel(descriptor.current)?.dispose();
      instance.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorTheme, setEditorInstance, language, t]);

  return { editorInstance, divRef };
};
