import './ContentWrapper.scss';

type ContentWrapperProps = {
  children: JSX.Element | JSX.Element[];
};

export const ContentWrapper = ({ children }: ContentWrapperProps) => {
  return (
    <span id="content-wrap" className="sap-margin-top-tiny">
      <span className="content-scroll">{children}</span>
    </span>
  );
};
