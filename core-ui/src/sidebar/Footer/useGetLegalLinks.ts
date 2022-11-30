import { useFeature } from 'hooks/useFeature';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { configFeaturesState } from 'state/configFeatures/configFeaturesSelector';
import { ConfigFeature } from 'state/types';

type LegalLink = {
  label: string;
  link: string;
};

interface LegalLinksFeature extends ConfigFeature {
  config: Record<string, Record<string, string>>;
}

export const useGetLegalLinks = (): LegalLink[] => {
  const { t, i18n } = useTranslation();
  const legalLinksConfig = useFeature<LegalLinksFeature>('LEGAL_LINKS')?.config;

  if (!legalLinksConfig) return [];

  const legalLinks = Object.entries(legalLinksConfig).map(
    ([translationLabel, externalLink]) => {
      const label = t(`legal.${translationLabel}`);
      const link = externalLink[i18n.language] || externalLink['default'];
      return {
        label,
        link,
      };
    },
  );

  return legalLinks;
};
