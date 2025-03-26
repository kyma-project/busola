import {
  BoldMatcherFactory,
  HeadersMatcherFactory,
  TickMatcherFactory,
} from 'components/KymaCompanion/components/Chat/messages/formatter/HeaderMatcher';

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
  ['headers', new HeadersMatcherFactory()],
  ['bold', new BoldMatcherFactory()],
  ['tickMatcher', new TickMatcherFactory()],
]);

export function TextFormatter({
  text,
  disable,
}: {
  text: string;
  disable?: boolean;
}): JSX.Element {
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
      console.log('token', token, 'matchery', this.matchers);
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
              this.matchers = new Map();
              console.log('DONE', this.matchers);
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
    console.log('New matcher');
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
