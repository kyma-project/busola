import TitleLevel from '@ui5/webcomponents/dist/types/TitleLevel';
import { Text, Title } from '@ui5/webcomponents-react';
import {
  Matcher,
  MatcherFactory,
  MatchResult,
} from 'components/KymaCompanion/components/Chat/messages/formatter/TextFormatter';
import { JSX } from '@ui5/webcomponents-base';
import React from 'react';
import CodePanel from 'components/KymaCompanion/components/Chat/messages/CodePanel';

type MatcherProps = {
  startToken?: string;
  desiredStartTokens?: number;
  stopToken?: string;
  desiredStopTokens?: number;
  renderFn: (text: string) => JSX.Element;
};

export class BoldMatcherFactory implements MatcherFactory {
  createIfMatch(token: string): Matcher | null {
    if (token === '*') {
      return new SingleTokenParser({
        startToken: '*',
        desiredStartTokens: 2,
        stopToken: '*',
        desiredStopTokens: 2,
        renderFn: content => <Text className={'text bold'}>{content}</Text>,
      });
    }
    return null;
  }
}

export class HeadersMatcherFactory implements MatcherFactory {
  createIfMatch(token: string): Matcher | null {
    if (token === '#') {
      return new MultiTokenParser({
        startToken: '#',
        stopToken: '\n',
        flavours: [
          {
            name: 'H3',
            desiredStartTokens: 3,
            desiredStopTokens: 1,
            renderFn: content => (
              <Title level={TitleLevel.H3} size={TitleLevel.H3}>
                {content}
              </Title>
            ),
          },
          {
            name: 'H4',
            desiredStartTokens: 4,
            desiredStopTokens: 1,
            renderFn: content => (
              <Title level={TitleLevel.H4} size={TitleLevel.H4}>
                {content}
              </Title>
            ),
          },
        ],
      });
    }
    return null;
  }
}

export class TickMatcherFactory implements MatcherFactory {
  createIfMatch(token: string): Matcher | null {
    if (token === '`') {
      return new MultiTokenParser({
        startToken: '`',
        stopToken: '`',
        flavours: [
          {
            name: 'code',
            desiredStartTokens: 3,
            desiredStopTokens: 3,
            renderFn: content => <CodePanel text={content}></CodePanel>,
          },
          {
            name: 'highlight',
            desiredStartTokens: 1,
            desiredStopTokens: 1,
            renderFn: content => (
              <Text className={'text highlighted'}>{content}</Text>
            ),
          },
        ],
      });
    }
    return null;
  }
}

type MatcherFlavour = {
  name: string;
  desiredStartTokens: number;
  desiredStopTokens: number;
  renderFn: (text: string) => JSX.Element;
};

type NewMatcherProps = {
  startToken: string;
  stopToken: string;
  flavours: MatcherFlavour[];
};

type flavour = {
  name: string;
  matchedStartTokens: number;
  desiredStartTokens: number;
  desiredStopTokens: number;
  matchedStopTokens: number;
  allStartTokenCaught: boolean;
  renderFn: (text: string) => JSX.Element;
  state?: MatchResult;
};

class MultiTokenParser implements Matcher {
  startToken: string;
  stopToken;
  content = '';
  currentFlavour: flavour | null = null;
  flavours: flavour[];

  constructor({ startToken, stopToken, flavours }: NewMatcherProps) {
    this.flavours = flavours.map(flavour => {
      return {
        name: flavour.name,
        desiredStartTokens: flavour.desiredStartTokens,
        matchedStartTokens: 0,
        desiredStopTokens: flavour.desiredStopTokens,
        matchedStopTokens: 0,
        allStartTokenCaught: false,
        renderFn: flavour.renderFn,
      };
    });
    this.startToken = startToken;
    this.stopToken = stopToken;
  }

  render(): JSX.Element {
    console.log(this.currentFlavour);
    if (this.currentFlavour) {
      return this.currentFlavour.renderFn(this.content);
    }
    return <>SOMETHING WRONG</>;
  }

  next(token: string): any {
    this.flavours.forEach(flavour => {
      if (this.allStartedTokensAchieved(flavour)) {
        if (!flavour.allStartTokenCaught && this.isStartToken(token)) {
          flavour.state = MatchResult.UNMATCHED;
          return MatchResult.UNMATCHED;
        }
        flavour.allStartTokenCaught = true;
        if (this.isStopToken(token)) {
          flavour.matchedStopTokens += 1;

          if (flavour.desiredStopTokens === flavour.matchedStopTokens) {
            flavour.state = MatchResult.DONE;
            return;
          }
          flavour.state = MatchResult.MATCHED;
          return;
        }
        if (this.isStartToken(token)) {
          flavour.state = MatchResult.UNMATCHED;
          return;
        }
        this.content += token;
        flavour.state = MatchResult.MATCHED;
        return;
      }
      if (this.isStartToken(token)) {
        flavour.matchedStartTokens += 1;
        flavour.state = MatchResult.MATCHED;
        return;
      }
    });
    const tmp = this.flavours.filter(f => f.state === MatchResult.DONE);
    if (tmp.length !== 0) {
      this.currentFlavour = tmp[0];
    }

    if (tmp.length === 1) {
      return MatchResult.DONE;
    }

    this.flavours = this.flavours.filter(flavour => {
      return flavour.state !== MatchResult.UNMATCHED;
    });

    if (this.flavours.length === 0) {
      return MatchResult.UNMATCHED;
    }
    return MatchResult.MATCHED;
  }

  allStartedTokensAchieved(flavour: flavour): boolean {
    return flavour.matchedStartTokens === flavour.desiredStartTokens;
  }

  isStopToken(token: string): boolean {
    return this.stopToken === token;
  }

  isStartToken(token: string): boolean {
    return this.startToken === token;
  }
}

class SingleTokenParser implements Matcher {
  startToken;
  matchedStartTokens = 0;
  desiredStartTokens;
  allStartTokenCatched = false;

  stopToken;
  desiredStopTokens;
  matchedStopTokens = 0;

  content = '';
  renderFn;

  constructor({
    startToken,
    desiredStartTokens,
    stopToken,
    desiredStopTokens,
    renderFn,
  }: MatcherProps) {
    this.startToken = startToken;
    this.desiredStartTokens = desiredStartTokens;
    this.stopToken = stopToken;
    this.desiredStopTokens = desiredStopTokens;
    this.renderFn = renderFn;
  }

  render(): JSX.Element {
    return this.renderFn(this.content);
  }

  next(token: string): any {
    if (this.allStartedTokensAchieved()) {
      if (!this.allStartTokenCatched && this.isStartToken(token)) {
        return MatchResult.UNMATCHED;
      }
      this.allStartTokenCatched = true;
      if (this.isStopToken(token)) {
        this.matchedStopTokens += 1;

        if (this.desiredStopTokens === this.matchedStopTokens) {
          return MatchResult.DONE;
        }
        return MatchResult.MATCHED;
      }
      if (this.isStartToken(token)) {
        return MatchResult.UNMATCHED;
      }
      this.content += token;
      return MatchResult.MATCHED;
    }
    if (this.isStartToken(token)) {
      this.matchedStartTokens += 1;
      return MatchResult.MATCHED;
    }

    return MatchResult.UNMATCHED;
  }

  allStartedTokensAchieved(): boolean {
    return this.matchedStartTokens === this.desiredStartTokens;
  }

  isStopToken(token: string): boolean {
    return this.stopToken === token;
  }

  isStartToken(token: string): boolean {
    return this.startToken === token;
  }
}
