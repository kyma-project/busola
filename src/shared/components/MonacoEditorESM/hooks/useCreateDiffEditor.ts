import { useEffect, useRef, useState } from 'react';
import { editor } from 'monaco-editor';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';
import { getEditorTheme } from './useCreateEditor';

type useCreateDiffEditorProps = {
  originalValue: string;
  modifiedValue: string;
  language: string;
};

export const useCreateDiffEditor = ({
  originalValue,
  modifiedValue,
  language,
}: useCreateDiffEditorProps) => {
  const theme = useRecoilValue(themeState);
  const editorTheme = getEditorTheme(theme);
  const divRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const [
    editorInstance,
    setEditorInstance,
  ] = useState<editor.IStandaloneDiffEditor | null>(null);

  useEffect(() => {
    if (!divRef.current) return;

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
      originalModel.dispose();
      modifiedModel.dispose();
      instance.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorTheme, setEditorInstance, language, t]);

  return { editorInstance, divRef };
};
