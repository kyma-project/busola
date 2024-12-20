import './SeparatorLine.scss';

type SeparatorLineProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const SeparatorLine = ({ className, style }: SeparatorLineProps) => {
  return <hr className={`separation-line ${className}`} style={style} />;
};
