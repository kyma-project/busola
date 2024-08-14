import { Trans } from 'react-i18next';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';
import * as React from 'react';

const coveredLinkSign = '<>';

export const createTranslationTextWithLinks = (
  text: string,
  t: any,
  i18n: any,
): string | React.ReactElement => {
  const { processedText, components } = insert18nLinks(text);
  if (components?.length) {
    return (
      <Trans
        i18nKey={processedText}
        i18n={i18n}
        t={t}
        components={components}
      />
    );
  }
  return text;
};

export const createI18nLink = (linkText: string, idx: number): string => {
  return `<${idx}>${linkText}</${idx}>`;
};

export type ProcessedTranslation = {
  components?: React.ReactElement[];
  processedText: string;
};

export function insert18nLinks(text: string): ProcessedTranslation {
  const links = extractLinks(text);

  if (!links) {
    return { processedText: text };
  }

  let processedText = text;
  const components = links.map(
    (link, idx): React.ReactElement => {
      const i18NLink = createI18nLink(link.urlText, idx);
      processedText = processedText.replace(link.matchedText, i18NLink);
      return <ExternalLink url={link.url} key={idx} />;
    },
  );

  return { processedText, components };
}

export type MatchedLink = {
  matchedText: string;
  url: string;
  urlText: string;
};

export const extractLinks = (text: string) => {
  let processedText = text;
  let links: MatchedLink[] = [];

  let result = getI18nVarLink(processedText);
  links = links.concat(result.links);
  processedText = result.text;

  result = result = getMarkdownLinks(processedText);
  links = links.concat(result.links);
  processedText = result.text;

  result = result = getHTMLLinks(processedText);
  links = links.concat(result.links);

  return links;
};

const getI18nVarLink = (text: string) => {
  const i18VarRegex = /{{.*?}}/g;
  let matchesIterator = text?.matchAll(i18VarRegex);
  let matches = matchesIterator ? [...matchesIterator].flat() : [];
  let links: MatchedLink[] = [];

  if (matches?.length) {
    links = matches.map(link => {
      const { links: mdLinks } = getMarkdownLinks(link);

      if (mdLinks?.length) {
        const { url, urlText } = mdLinks[0];
        text = text.replace(link, coveredLinkSign);
        return {
          matchedText: link,
          url,
          urlText,
        };
      }
      return {} as MatchedLink;
    });
  }
  return { links, text };
};

const getMarkdownLinks = (text: string) => {
  const mdLinkRegex = /\[([^\]]*)]\(([^)]*)\)/g;
  let matchesIterator = text?.matchAll(mdLinkRegex);
  let matches = matchesIterator ? [...matchesIterator] : [];
  let links: MatchedLink[] = [];

  if (matches?.length) {
    links = matches.map(link => {
      const url = link[2];
      const urlText = link[1];
      text = text.replace(link[0], coveredLinkSign);
      return {
        matchedText: link[0],
        url,
        urlText,
      };
    });
  }
  return { links, text };
};

const getHTMLLinks = (text: string) => {
  const httpRegex = /\bhttps?:\/\/\S*\b/g;
  let matchesIterator = text?.matchAll(httpRegex);
  let matches = matchesIterator ? [...matchesIterator].flat() : [];
  let links: MatchedLink[] = [];

  if (matches?.length) {
    links = matches.map((link, index) => {
      text = text.replace(link, coveredLinkSign);
      return {
        matchedText: link,
        url: link,
        urlText: link,
      };
    });
  }
  return { links, text };
};
