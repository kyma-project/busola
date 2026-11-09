import { Label as UI5Label } from '@ui5/webcomponents-react';
import WrappingType from '@ui5/webcomponents/dist/types/WrappingType.js';

export type LabelProps = {
  required?: boolean;
  forElement?: string;
  children: React.ReactNode;
  showColon?: boolean;
  wrappingType?: WrappingType | keyof typeof WrappingType;
  style?: React.CSSProperties;
  // Set by UI5 slot props (e.g. labelContent); must reach the DOM
  slot?: string;
};

export function Label({
  required,
  forElement,
  children,
  showColon = true,
  wrappingType,
  style,
  slot,
}: LabelProps) {
  return (
    <UI5Label
      required={required}
      for={forElement}
      showColon={showColon}
      wrappingType={wrappingType}
      style={style}
      slot={slot}
    >
      {children}
    </UI5Label>
  );
}
