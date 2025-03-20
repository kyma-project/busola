import { HeaderMatcherFactory } from 'components/KymaCompanion/components/Chat/messages/formatter/HeaderMatcher';
import TitleLevel from '@ui5/webcomponents/dist/types/TitleLevel';

export enum MatchResult {
  MATCHED,
  UNMATCHED,
  DONE,
}

export interface Matcher {
  next(token: string): MatchResult;

  render(): JSX.Element;
}

export interface MatcherFactory {
  createIfMatch(token: string): Matcher | null;
}

const registeredMatchersFactories: Map<string, MatcherFactory> = new Map<
  string,
  MatcherFactory
>([
  ['3-hash', new HeaderMatcherFactory({})],
  [
    '4-hash',
    new HeaderMatcherFactory({
      desiredStartTokens: 4,
      titleLevel: TitleLevel.H4,
      titleSize: TitleLevel.H4,
    }),
  ],
]);

export function TextFormatter({
  text,
  disabled,
}: {
  text: string;
  disabled?: boolean;
}): JSX.Element {
  if (disabled) {
    return <>{text}</>;
  }

  const elements = [];
  let matchers = new Map<string, Matcher>();
  let content = '';
  for (let token of text) {
    registeredMatchersFactories.forEach((factory, key) => {
      if (matchers.has(key)) {
        return;
      }

      const newMatcher = factory.createIfMatch(token);
      if (!newMatcher) {
        return;
      }
      matchers.set(key, newMatcher);
    });
    if (matchers.size !== 0) {
      let matcherDone = false;
      matchers.forEach((matcher, key) => {
        const result = matcher.next(token);
        switch (result) {
          case MatchResult.DONE: {
            const result = matcher.render();
            elements.push(result);
            matcherDone = true;
            matchers = new Map<string, Matcher>();
            break;
          }
          case MatchResult.UNMATCHED: {
            matchers.delete(key);
            break;
          }
        }
      });
      content += token;
      if (matcherDone) {
        content = '';
      }
    } else {
      content += token;
    }
  }
  elements.push(content);
  return <>{elements}</>;
}
