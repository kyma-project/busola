import { useRecoilValue } from 'recoil';
import { themeState } from 'state/preferences/themeAtom';

export function Logo(props: any) {
  const theme = useRecoilValue(themeState);

  return (
    <div slot={props.slot}>
      <img
        alt="Kyma"
        src={
          theme === 'sap_horizon_hcw'
            ? '/assets/logo-black.svg'
            : theme === 'sap_horizon'
            ? '/assets/logo-blue.svg'
            : '/assets/logo.svg'
        }
      />
    </div>
  );
}
