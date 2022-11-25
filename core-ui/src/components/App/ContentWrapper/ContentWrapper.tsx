// import { useRecoilValue } from 'recoil';
// import { configFeaturesState } from 'state/configFeatures/configFeaturesAtom';
import './ContentWrapper.scss';

type ContentWrapperProps = {
  children: JSX.Element;
};

export const ContentWrapper = ({ children }: ContentWrapperProps) => {
  // const configFeatures = useRecoilValue(configFeaturesState);
  const { pathname } = window.location;

  // const reactNavEnabled = configFeatures?.REACT_NAVIGATION?.isEnabled;

  const reactNavEnabled = true;
  return (
    <div
      id="content-wrap"
      className={
        !reactNavEnabled || pathname === '/clusters' ? 'sidebar-hidden' : ''
      }
    >
      {children}
    </div>
  );
};
