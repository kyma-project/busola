import { Label as UI5Label } from '@ui5/webcomponents-react';

export function Label({
  required,
  forElement,
  children,
  showColon = true,
  wrappingType,
  style,
}) {
  return (
    <>
      <UI5Label
        required={required}
        for={forElement}
        showColon={showColon}
        wrappingType={wrappingType}
        style={style}
      >
        {children}
      </UI5Label>
    </>
  );
}
