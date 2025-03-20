import { HeaderParserFactory } from 'components/KymaCompanion/components/Chat/messages/formatter/HeaderMatcher';
import TitleLevel from '@ui5/webcomponents/dist/types/TitleLevel';

export enum matchResult {
  MATCHED,
  UNMATCHED,
  DONE,
}

export interface Matcher {
  next(token: string): matchResult;

  render(): JSX.Element;
}

export interface MatcherFactory {
  createIfMatch(token: string): Matcher | null;
}

const registeredMatchersFactories: Map<string, MatcherFactory> = new Map<
  string,
  MatcherFactory
>([
  ['3-hash', new HeaderParserFactory({})],
  [
    '4-hash',
    new HeaderParserFactory({
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
      console.log('register new matcher for: ', token, 'matcher', key);
      matchers.set(key, newMatcher);
    });
    if (matchers.size !== 0) {
      let matcherDone = false;
      matchers.forEach((matcher, key) => {
        const result = matcher.next(token);
        // console.log('result:', result, '| token:', token);
        switch (result) {
          case matchResult.DONE: {
            const result = matcher.render();
            console.log('Finish: ', key);
            elements.push(result);
            matcherDone = true;
            matchers = new Map<string, Matcher>();
            break;
          }
          case matchResult.MATCHED: {
            break;
          }
          case matchResult.UNMATCHED: {
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

    const factory = new HeaderParserFactory({});
    let matcher = null;

    // matcher = factory.createIfMatch(token);
    // if (matcher) {
    //   const result = matcher.next(token);
    //   // console.log('result:', result, '| token:', token);
    //   switch (result) {
    //     case matchResult.DONE: {
    //       const result = matcher.render();
    //       console.log(result);
    //       elements.push(result);
    //       content = '';
    //       matcher = null;
    //       break;
    //     }
    //     case matchResult.MATCHED: {
    //       content += token;
    //       break;
    //     }
    //     case matchResult.UNMATCHED: {
    //       content += token;
    //       elements.push(content);
    //       matcher = null;
    //       break;
    //     }
    //   }
    // } else {
    //   content += token;
    // }
  }
  elements.push(content);
  return <>{elements}</>;
}
