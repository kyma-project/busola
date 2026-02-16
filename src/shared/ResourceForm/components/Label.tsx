import { Label as UI5Label } from '@ui5/webcomponents-react';
import WrappingType from '@ui5/webcomponents/dist/types/WrappingType';

export type LabelProps = {
  required?: boolean;
  forElement?: string;
  children: React.ReactNode;
  showColon?: boolean;
  wrappingType?: WrappingType | keyof typeof WrappingType;
  style?: React.CSSProperties;
};

export function Label({
  required,
  forElement,
  children,
  showColon = true,
  wrappingType,
  style,
}: LabelProps) {
  return (
    <UI5Label
      required={required}
      for={forElement}
      showColon={showColon}
      wrappingType={wrappingType}
      style={style}
    >
      {children}
    </UI5Label>
  );
}
