import { useGetTranslation } from 'components/Extensibility/helpers';
import { useRecoilValue } from 'recoil';
import { isSidebarCondensedState } from 'state/preferences/isSidebarCondensedAtom';
import { useGetBusolaVersionDetails } from './useGetBusolaVersion';
import { useGetLegalLinks } from './useGetLegalLinks';
import { SideNavigationItem } from '@ui5/webcomponents-react';

export function Footer() {
  const { t } = useGetTranslation();
  const { githubLink, busolaVersion } = useGetBusolaVersionDetails();
  const legalLinks = useGetLegalLinks();
  const isSidebarCondensed = useRecoilValue(isSidebarCondensedState);
  if (isSidebarCondensed) return null;

  return (
    <>
      {legalLinks.map(legalLink => (
        <SideNavigationItem
          key={legalLink.link}
          onClick={() => {
            const newWindow = window.open(
              legalLink.link,
              '_blank',
              'noopener, noreferrer',
            );
            if (newWindow) newWindow.opener = null;
          }}
          slot="fixedItems"
          text={legalLink.label}
          icon="inspect"
        />
      ))}
      <SideNavigationItem
        onClick={() => {
          const newWindow = window.open(
            githubLink,
            '_blank',
            'noopener, noreferrer',
          );
          if (newWindow) newWindow.opener = null;
        }}
        slot="fixedItems"
        text={`${t('common.labels.version')} ${busolaVersion}`}
        icon="inspect"
      />
    </>
  );
}
