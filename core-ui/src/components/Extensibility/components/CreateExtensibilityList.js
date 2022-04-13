import React from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useTranslation } from 'react-i18next';

export const getResourceChild = (resPath, resource) =>
  resPath.split('.').reduce((prevRes, curr, idx) => {
    if (idx === 0) {
      return prevRes;
    }
    return prevRes?.[curr] ? prevRes[curr] : null;
  }, resource);

export const useGetTranslation = () => {
  const { customTranslations } = useMicrofrontendContext();

  const language = useTranslation().i18n.language; //en

  return translationPath => {
    if (!translationPath) {
      return '';
    }
    if (typeof translationPath === 'string') {
      return translationPath;
    }

    if (translationPath[language]) {
      return translationPath[language];
    }

    if (translationPath.id) {
      return (
        getResourceChild('$.' + translationPath.id, customTranslations)?.[
          language
        ] || ''
      );
    }
    return '';
  };
};

export const CreateExtensibilityList = metadata => {
  // const { customTranslations } = useMicrofrontendContext();
  const { title, headers, columns, resource: resPath } = metadata;

  ///
  const Element = res => {
    const result = getResourceChild(resPath, res);

    const translate = useGetTranslation();

    const headerRenderer = () =>
      headers.map(h => {
        return translate(h);
      });

    const rowRenderer = resource => {
      return (
        columns?.map(column =>
          column.split('.').reduce((prevRes, curr) => {
            return prevRes?.[curr] ? prevRes[curr] : null;
          }, resource),
        ) || []
      );
    };
    return (
      <GenericList
        key={translate(title)}
        title={translate(title)}
        showSearchField={false}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        entries={result || []}
      />
    );
  };

  return Element;
};
