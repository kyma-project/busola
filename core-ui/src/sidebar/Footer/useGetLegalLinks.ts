import { useTranslation } from 'react-i18next';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

type LegalLink = {
  label: string;
  link: string;
};

export const useGetLegalLinks = (): LegalLink[] => {
  const { t, i18n } = useTranslation();
  const { features } = useMicrofrontendContext() as any;
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
