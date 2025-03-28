import CodePanel from 'components/KymaCompanion/components/Chat/messages/CodePanel';
import { Link, Text } from '@ui5/webcomponents-react';

export const UI5Renderer = {
  code(text: string, lang: string) {
    return <CodePanel code={text} language={lang} />;
  },

  blockquote(tokens: string) {
    return (
      <blockquote
        style={{
          fontStyle: 'italic',
          borderLeft: '1px dashed black',
          margin: '1em 0',
          paddingLeft: '1em',
        }}
      >
        {tokens}
      </blockquote>
    );
  },

  text(tokens: string) {
    return <Text className="text">{tokens}</Text>;
  },

  list(items: any[]) {
    return (
      <>
        <ul
          className="sap-margin-begin-tiny sap-padding-x-tiny"
          style={{
            lineHeight: 1.5,
            listStyleType: 'disc',
          }}
        >
          {items}
        </ul>
      </>
    );
  },

  codespan(tokens: string) {
    return <Text className="text highlighted">{tokens}</Text>;
  },

  strong(tokens: string) {
    return <Text className="text bold">{tokens}</Text>;
  },

  link(href: string, title: string) {
    return (
      <Link href={href} target="_blank">
        {title}
      </Link>
    );
  },
};
