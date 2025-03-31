import CodePanel from 'components/KymaCompanion/components/Chat/messages/CodePanel';
import { Link, Text } from '@ui5/webcomponents-react';

export const UI5Renderer = {
  code(text: string, lang: string) {
    return <CodePanel code={text} language={lang} />;
  },

  codespan(tokens: string) {
    return <code className="code-border">{tokens}</code>;
  },
};
