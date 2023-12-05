import { useFeature } from 'hooks/useFeature';
import { useTranslation } from 'react-i18next';
import { ConfigFeature } from 'state/types';

export type GetHelpLink = {
  label: string;
  link: string;
};

interface GetHelpLinksFeature extends ConfigFeature {
  config: Record<string, Record<string, string>>;
}

export const useGetHelpLinks = (): GetHelpLink[] => {
  const { t, i18n } = useTranslation();
  const getHelpLinksConfig = useFeature<GetHelpLinksFeature>('GET_HELP_LINKS')
    ?.config;

  if (!getHelpLinksConfig) return [];

  const getHelpLinks = Object.entries(getHelpLinksConfig).map(
    ([translationLabel, externalLink]) => {
      const label = t(`get-help.${translationLabel}`);
      const link = externalLink[i18n.language] || externalLink['default'];
      return {
        label,
        link,
      };
    },
  );

  return getHelpLinks;
};
