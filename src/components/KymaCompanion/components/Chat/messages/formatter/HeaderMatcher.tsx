import TitleLevel from '@ui5/webcomponents/dist/types/TitleLevel';
import { Title } from '@ui5/webcomponents-react';
import {
  Matcher,
  MatcherFactory,
  matchResult,
} from 'components/KymaCompanion/components/Chat/messages/formatter/TextFormatter';

type MatcherFactoryProps = {
  startToken?: string;
  stopToken?: string;
  desiredStartTokens?: number;
  titleLevel?: TitleLevel;
  titleSize?: TitleLevel;
};

export class HeaderParserFactory implements MatcherFactory {
  startToken;
  stopToken;
  desiredStartTokens;
  titleLevel: TitleLevel;
  titleSize: TitleLevel;

  constructor({
    startToken = '#',
    stopToken = `\n`,
    desiredStartTokens = 3,
    titleLevel = TitleLevel.H3,
    titleSize = TitleLevel.H3,
  }: MatcherFactoryProps) {
    this.startToken = startToken;
    this.stopToken = stopToken;
    this.desiredStartTokens = desiredStartTokens;
    this.titleLevel = titleLevel;
    this.titleSize = titleSize;
  }

  createIfMatch(token: string): any | null {
    if (token === '#') {
      return new HeadingParser({
        startToken: this.startToken,
        stopToken: this.stopToken,
        desiredStartTokens: this.desiredStartTokens,
        titleLevel: this.titleLevel,
        titleSize: this.titleSize,
      });
    }
    return null;
  }
}

class HeadingParser implements Matcher {
  matchedTokens;
  desiredStartTokens;
  startToken;
  stopToken;
  content;
  titleLevel: TitleLevel;
  titleSize: TitleLevel;

  constructor({
    startToken = '#',
    stopToken = `\n`,
    desiredStartTokens = 3,
    titleLevel = TitleLevel.H3,
    titleSize = TitleLevel.H3,
  }: MatcherFactoryProps) {
    this.startToken = startToken;
    this.stopToken = stopToken;
    this.desiredStartTokens = desiredStartTokens;
    this.titleLevel = titleLevel;
    this.titleSize = titleSize;
    this.matchedTokens = 0;
    this.content = '';
  }

  render(): JSX.Element {
    return (
      <Title level={this.titleLevel} size={this.titleSize}>
        {this.content}
      </Title>
    );
  }

  next(token: string): any {
    // Startowe tokeny zostały osiągniete
    if (this.matchedTokens >= this.desiredStartTokens) {
      //osiagnieto liczbe startowych tokenów, sprawdzmy czy to jest koniec
      if (token === this.stopToken) {
        return matchResult.DONE;
      }
      if (token === this.startToken) {
        return matchResult.UNMATCHED;
      }
      this.content += token;
      return matchResult.MATCHED;
    }
    // Looking for start token
    if (token === this.startToken) {
      this.matchedTokens += 1;
      return matchResult.MATCHED;
    }

    return matchResult.UNMATCHED;
  }
}
