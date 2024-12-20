import './ContentWrapper.scss';

type ContentWrapperProps = {
  children: JSX.Element | JSX.Element[];
};

export const ContentWrapper = ({ children }: ContentWrapperProps) => {
  return (
    <div id="content-wrap" className="sap-margin-top-tiny">
      <div className="content-scroll">{children}</div>
    </div>
  );
};
