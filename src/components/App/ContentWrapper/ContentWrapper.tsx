import { spacing } from '@ui5/webcomponents-react-base';
import './ContentWrapper.scss';

type ContentWrapperProps = {
  children: JSX.Element | JSX.Element[];
};

export const ContentWrapper = ({ children }: ContentWrapperProps) => {
  return (
    <div id="content-wrap" style={spacing.sapUiTinyMarginTop}>
      <div className="content-scroll">{children}</div>
    </div>
  );
};
