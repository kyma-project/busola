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
  disable,
}: {
  text: string;
  disable?: boolean;
}): JSX.Element {
  console.log(text);
  if (disable) {
    return <>{text}</>;
  }
  const formatter = new textFormatter();
  const elements = formatter.parseText(text);

  return <>{elements}</>;
}

class textFormatter {
  elements: any[];
  matchers: Map<string, Matcher>;
  content: string;

  constructor() {
    this.elements = [];
    this.matchers = new Map();
    this.content = '';
  }

  parseText(text: string): any[] {
    for (let token of text) {
      registeredMatchersFactories.forEach((factory, key) => {
        this.addMatcherIfTokenMatch(factory, key, token);
      });
      let matched = false;
      if (this.matchers.size !== 0) {
        this.matchers.forEach((matcher, key) => {
          const result = matcher.next(token);
          switch (result) {
            case MatchResult.DONE: {
              this.handleDone(matcher);
              matched = true;
              break;
            }
            case MatchResult.UNMATCHED: {
              this.handleUnmatched(key, token);
              break;
            }
          }
        });
      }
      if (!matched) {
        this.content += token;
      }
    }
    this.pushContent();
    return this.elements;
  }

  addMatcherIfTokenMatch(
    factory: MatcherFactory,
    matcherKey: string,
    token: string,
  ) {
    if (this.matchers.has(matcherKey)) {
      return;
    }

    const newMatcher = factory.createIfMatch(token);
    if (!newMatcher) {
      return;
    }
    this.pushContent();
    this.matchers.set(matcherKey, newMatcher);
  }

  handleDone(matcher: Matcher) {
    const result = matcher.render();
    this.elements.push(result);
    this.matchers = new Map<string, Matcher>();
    this.content = '';
  }

  handleUnmatched(matcherToDelete: string, token: string) {
    this.matchers.delete(matcherToDelete);
    if (this.matchers.size === 0) {
      this.content += token;
      this.pushContent();
    }
  }

  pushContent() {
    if (this.content === '') {
      return;
    }
    this.elements.push(this.content);
    this.content = '';
  }
}
