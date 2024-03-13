import { Button, Popover, Text } from '@ui5/webcomponents-react';
import { createPortal } from 'react-dom';
import { useRef } from 'react';

export function HintButton({
  setShowTitleDescription,
  showTitleDescription,
  description,
  style,
  context,
}) {
  const descBtnRef = useRef(null);
  return (
    <>
      <Button
        id={`descriptionOpener-${context}`}
        ref={descBtnRef}
        icon="hint"
        design="Transparent"
        style={style}
        onClick={() => {
          setShowTitleDescription(true);
        }}
      />
      {createPortal(
        <Popover
          opener={`descriptionOpener-${context}`}
          //Point initial focus to other component removes the focus from the link in description
          onAfterOpen={() => {
            descBtnRef.current.focus();
          }}
          open={showTitleDescription}
          onAfterClose={() => setShowTitleDescription(false)}
          placementType="Right"
        >
          <Text className="description">{description}</Text>
        </Popover>,
        document.body,
      )}
    </>
  );
}
