import CodePanel from 'components/KymaCompanion/components/Chat/messages/CodePanel';
import { Link, Text, Title } from '@ui5/webcomponents-react';
import TitleLevel from '@ui5/webcomponents/dist/types/TitleLevel';

export const UI5Renderer = {
  code(tokens: string, lang: string) {
    return <CodePanel text={tokens} />;
  },

  codespan(tokens: string) {
    return <Text className="text highlighted">{tokens}</Text>;
  },

  strong(tokens: string) {
    return <Text className="text bold">{tokens}</Text>;
  },

  heading(tokens: string, depth: number) {
    const level = `H${depth}` as TitleLevel;
    return (
      <Title level={level} size={level}>
        {tokens}
      </Title>
    );
  },
  link(href: string, title: string) {
    return (
      <Link href={href} target="_blank">
        {title}
      </Link>
    );
  },
};
