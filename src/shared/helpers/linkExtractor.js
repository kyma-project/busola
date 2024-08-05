import { Trans } from 'react-i18next';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

export const createTranslationTextWithLinks = (text, t, i18n) => {
  const { processedText, components } = insert18nLinks(text);
  if (components.length) {
    return (
      <Trans
        i18nKey={processedText}
        i18n={i18n}
        t={t}
        components={components}
      />
    );
  } else {
    return text;
  }
};

export const createI18nLink = (linkText, idx) => {
  return `<${idx}>${linkText}</${idx}>`;
};

export const insert18nLinks = text => {
  const links = extractLinks(text);

  if (!links) {
    return text;
  }

  let processedText = text;
  const components = links.map((link, idx) => {
    const i18NLink = createI18nLink(link.urlText, idx);
    processedText = processedText.replace(link.matchedText, i18NLink);
    return <ExternalLink url={link.url} key={idx} />;
  });

  return { processedText, components };
};

export const extractLinks = text => {
  let processedText = text;
  let links = [];

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

const getI18nVarLink = text => {
  const i18VarRegex = /{{.*?}}/g;
  let matchesIterator = text?.matchAll(i18VarRegex);
  let matches = matchesIterator ? [...matchesIterator].flat() : [];
  let links = [];

  if (matches?.length) {
    links = matches.map(link => {
      const { links: mdLinks } = getMarkdownLinks(link);
      console.log(mdLinks);
      if (mdLinks?.length) {
        const { url, urlText } = mdLinks[0];
        text = text.replace(link, '<>');
        return {
          matchedText: link,
          url,
          urlText,
        };
      }
      return {};
    });
  }
  return { links, text };
};

const getMarkdownLinks = text => {
  const mdLinkRegex = /\[([^\]]*)]\(([^)]*)\)/g;
  let matchesIterator = text?.matchAll(mdLinkRegex);
  let matches = matchesIterator ? [...matchesIterator] : [];
  let links = [];

  if (matches?.length) {
    links = matches.map(link => {
      const url = link[2];
      const urlText = link[1];
      text = text.replace(link[0], '<>');
      return {
        matchedText: link[0],
        url,
        urlText,
      };
    });
  }
  return { links, text };
};

const getHTMLLinks = text => {
  const httpRegex = /\bhttps?:\/\/\S*\b/g;
  let matchesIterator = text?.matchAll(httpRegex);
  let matches = matchesIterator ? [...matchesIterator].flat() : [];
  let links = [];

  if (matches?.length) {
    links = matches.map((link, index) => {
      return {
        matchedText: link,
        url: link,
        urlText: link,
      };
    });
  }
  return { links, text };
};
