import TitleLevel from '@ui5/webcomponents/dist/types/TitleLevel';
import { Title } from '@ui5/webcomponents-react';
import {
  Matcher,
  MatcherFactory,
  MatchResult,
} from 'components/KymaCompanion/components/Chat/messages/formatter/TextFormatter';

type MatcherFactoryProps = {
  startToken?: string;
  stopToken?: string;
  desiredStartTokens?: number;
  titleLevel?: TitleLevel;
  titleSize?: TitleLevel;
};

export class HeaderMatcherFactory implements MatcherFactory {
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
    if (this.allStartedTokensAchieved()) {
      if (this.isStopToken(token)) {
        return MatchResult.DONE;
      }
      if (this.isStartToken(token)) {
        return MatchResult.UNMATCHED;
      }
      this.content += token;
      return MatchResult.MATCHED;
    }
    if (this.isStartToken(token)) {
      this.matchedTokens += 1;
      return MatchResult.MATCHED;
    }

    return MatchResult.UNMATCHED;
  }

  allStartedTokensAchieved(): boolean {
    return this.matchedTokens >= this.desiredStartTokens;
  }

  isStopToken(token: string): boolean {
    return this.stopToken === token;
  }

  isStartToken(token: string): boolean {
    return this.startToken === token;
  }
}
