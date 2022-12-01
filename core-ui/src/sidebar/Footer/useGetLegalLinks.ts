import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { configurationState } from 'state/configurationSelector';

type LegalLink = {
  label: string;
  link: string;
};

export const useGetLegalLinks = (): LegalLink[] => {
  const { t, i18n } = useTranslation();
  const configuration = useRecoilValue(configurationState);
  const features = configuration?.features;
  const legalLinksConfig = features?.LEGAL_LINKS?.config as Record<
    string,
    Record<string, string>
  >;

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
