import { ReactNode } from 'react';
import { Link as UI5Link } from '@ui5/webcomponents-react';
import { useSetRecoilState } from 'recoil';
import { columnLayoutState } from 'state/columnLayoutAtom';
import { useNavigate } from 'react-router';

type LinkProps = {
  url: string;
  className?: string;
  children?: ReactNode;
  dataTestId?: string;
  design?: 'Default' | 'Subtle' | 'Emphasized';
  resetLayout?: boolean;
  onClick?: any;
  style?: React.CSSProperties;
};

export const Link = ({
  url,
  className = '',
  children,
  dataTestId,
  design = 'Emphasized',
  resetLayout = true,
  onClick,
  style = {},
}: LinkProps) => {
  const setLayout = useSetRecoilState(columnLayoutState);
  const navigate = useNavigate();

  function handleOnlick(resetLayout: any, url: any, e: any) {
    e.preventDefault();

    if (resetLayout) {
      setLayout({
        startColumn: null,
        midColumn: null,
        endColumn: null,
        layout: 'OneColumn',
      });
    }
    navigate(url);
  }

  return (
    <UI5Link
      wrappingType={'Normal'}
      design={design}
      className={className}
      data-testid={dataTestId}
      onClick={(e) =>
        onClick ? onClick(e) : handleOnlick(resetLayout, url, e)
      }
      href={url}
      target="_blank"
      style={style}
    >
      {children}
    </UI5Link>
  );
};
