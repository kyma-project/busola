import CodePanel from 'components/KymaCompanion/components/Chat/messages/CodePanel';

export const UI5Renderer = {
  code(text: string, lang: string) {
    return <CodePanel code={text} language={lang} />;
  },

  codespan(tokens: string) {
    return <code className="code-border">{tokens}</code>;
  },

  table(table: JSX.Element[]) {
    return (
      <div
        className={'markdown'}
        style={{
          overflowX: 'auto',
        }}
      >
        {table}
      </div>
    );
  },
};
