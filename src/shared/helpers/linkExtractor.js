import { Trans } from 'react-i18next';
import { ExternalLink } from 'shared/components/ExternalLink/ExternalLink';

// TODO: change the name to something like: insertLinksToTranslation
export const processTranslation = text => {
  let matches = [];
  let result = getI18nVarLink(text);
  matches = matches.concat(result.matches);
  text = result.text;

  result = getMdLink(text, matches.length);
  text = result.text;
  matches = matches.concat(result.matches);

  result = getHTMLLinks(text, matches.length);
  matches = matches.concat(result.matches);
  text = result.text;

  return { matches: matches ? matches : [], trans: text };
};

const getI18nVarLink = text => {
  const i18VarRegex = /{{.*?}}/g;
  let matchesIterator = text?.matchAll(i18VarRegex);
  let matches = matchesIterator ? [...matchesIterator].flat() : null;

  if (matches?.length) {
    matches = matches.map((link, index) => {
      const linkReplacement = processLink(link, index);
      text = text.replace(link, linkReplacement);
      return link.replace('{{', '').replace('}}', '');
    });
  }
  return { matches, text };
};

const getMdLink = (text, globalIdx) => {
  const mdLinkRegex = /\[([^\]]*)]\(([^)]*)\)/g;
  let matchesIterator = text?.matchAll(mdLinkRegex);
  let matches = matchesIterator ? [...matchesIterator] : null;

  if (matches?.length) {
    matches = matches.map((link, index) => {
      const localIdx = index + globalIdx;
      const linkReplacement = `<${localIdx}>${link[1]}</${localIdx}>`;
      text = text.replace(link[0], linkReplacement);
      return `(${link[2]})`;
    });
  }
  return { matches, text };
};

const getHTMLLinks = (text, globalIdx) => {
  const httpRegex = /\bhttps?:\/\/\S*\b/g;
  let matchesIterator = text?.matchAll(httpRegex);
  let matches = matchesIterator ? [...matchesIterator].flat() : null;

  if (matches?.length) {
    matches = matches.map((link, index) => {
      const idx = index + globalIdx;
      const linkReplacement = `<${idx}>${link}</${idx}>`;
      text = text.replace(link, linkReplacement);
      return `(${link})`;
    });
  }
  return { matches, text };
};

export const createTranslationTextWithLinks = (text, t, i18n) => {
  // const { t, i18n } = useGetTranslation();
  const { matches, trans: processedTrans } = processTranslation(text);
  if (matches.length) {
    return (
      <Trans
        i18nKey={processedTrans}
        i18n={i18n}
        t={t}
        components={matches.map((result, idx) => {
          const url = result.match(/\((.*?)\)/)[1];

          return <ExternalLink url={url} key={idx} />;
        })}
      />
    );
  } else {
    return processedTrans;
  }
};

const processLink = (link, index) => {
  let linkText;
  if (link.match(/\[(.*?)]/)) {
    linkText = link.match(/\[(.*?)]/)[1];
  } else {
    linkText = link.match(/\((.*?)\)/)[1];
  }
  return `<${index}>${linkText}</${index}>`;
};
