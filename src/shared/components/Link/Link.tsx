import { ReactNode } from 'react';
import { Link as UI5Link } from '@ui5/webcomponents-react';
import { useSetRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useNavigate } from 'react-router-dom';

type LinkProps = {
  url: string;
  className?: string;
  children?: ReactNode;
  dataTestId?: string;
  design?: 'Default' | 'Subtle' | 'Emphasized';
  resetLayout?: boolean;
  onClick?: any;
};

export const Link = ({
  url,
  className = '',
  children,
  dataTestId,
  design = 'Emphasized',
  resetLayout = true,
  onClick,
}: LinkProps) => {
  const setLayout = useSetRecoilState(columnLayoutState);
  const navigate = useNavigate();

  function handleOnlick(resetLayout: any, url: any) {
    if (resetLayout)
      setLayout({
        midColumn: null,
        endColumn: null,
        layout: 'OneColumn',
      });
    navigate(url);
  }

  return (
    <UI5Link
      wrappingType={'Normal'}
      design={design}
      className={className}
      data-testid={dataTestId}
      onClick={() => (onClick ? onClick() : handleOnlick(resetLayout, url))}
    >
      {children}
    </UI5Link>
  );
};
